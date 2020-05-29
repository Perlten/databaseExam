const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors')
const mongo = require('mongodb');

const neo4jFacade = require("./databaseFacades/neo4jFacade")
const mongoFacade = require("./databaseFacades/mongoFacade")
const redisFacade = require("./databaseFacades/redisFacade")
const postgresFacade = require("./databaseFacades/postgresFacade")

const app = express();

app.use(cors())
app.use(bodyParser.json());

const PORT = 3001;

/*
  order: {
    name,
    products,
    cityTo
  }
  creditCardInfo:  {
    phoneNumber,
    verificationCode,
    cardNumber,
    expirationDate
  }
*/
app.post('/createOrder', async function (request, response) {
  let { order, creditCardInfo } = request.body;
  try {
    await postgresFacade.checkNameAndPhoneNumberExits(creditCardInfo.phoneNumber, order.name);
    order["phoneNumber"] = creditCardInfo["phoneNumber"];
    order["cityFrom"] = "Copenhagen";
    order["paymentConfirmed"] = false;
    order["date"] = new Date();
    order["isDelivered"] = false;
    order["route"] = await neo4jFacade.runDijkstra(order["cityFrom"], order["cityTo"]);
    let amount = order.products.reduce((total, e) => total + e.price, 0);
    let webShopOrderId = await mongoFacade.createOne(order, "orders");
    await postgresFacade.createTransaction({
      creditCard: creditCardInfo,
      amount,
      webShopOrderId
    })
    response.json(order);
  } catch (e) {
    // If user is not valid delete the order that was created
    response.json(e).status(400);
  }
})


/*
  {
    from,
    to,
    time
  }
*/
app.put("/updateRoad", async function (request, response) {
  try {
    let { from, to, time } = request.body;
    await neo4jFacade.updateRoad(from, to, time);
    let orderList = await mongoFacade.findOrdersWithCityConnection(to);

    for (let order of orderList) {
      let route = await neo4jFacade.runDijkstra(order["cityFrom"], order["cityTo"]);
      await mongoFacade.update({ _id: order["_id"] }, { $set: { route } }, "orders");
    }
    response.json(orderList);
  } catch (e) {
    response.json(e).status(400);
  }
})

/*
  {
    key,
    basket
  }
*/
app.post("/createBasket", async function (request, response) {
  try {
    let { basket, key } = request.body;
    await redisFacade.write(key, basket);
    response.json({ basket, key });
  } catch (e) {
    response.json(e).status(400);
  }
});

/*
{
  key
}
*/
app.get("/getBasket/:key", async function (request, response) {
  try {
    let { key } = request.params;
    response.json(await redisFacade.get(key));
  } catch (e) {
    response.json(e).status(400);
  }
});

/*
{
  name,
  phoneNumber
}
*/
app.post("/createPerson", async function (request, response) {
  try {
    await postgresFacade.createPerson(request.body);
    response.json({ message: "All good" });
  } catch (e) {
    response.json({ message: "Could not create person" }).status(400);
  }
});


app.get("/products", async function (request, response) {
  try {
    let amount = request.query.amount ? parseInt(request.query.amount) : -1;
    let products = await mongoFacade.getRandomProducts(amount);
    
    response.json(products);
  } catch (e) {
    response.json({ message: "Could no get products" }).status(400);
  }
});

app.get("/approvedTransactions", async function (request, response) {
  let transactions = await postgresFacade.getAllApprovedTransactions();
  let resList = [];
  for (let trans of transactions) {
    var objectId = new mongo.ObjectID(trans.webshoporderid);
    let mongoObject = await mongoFacade.get({ isDelivered: false, _id: objectId, paymentConfirmed: true }, "orders");
    mongoObject = mongoObject[0];
    if (mongoObject) {
      resList.push({ transaction: trans, order: mongoObject });
    }
  }
  response.json(resList);
});

async function syncConfirmedPayment() {
  let query = { paymentConfirmed: false };
  let orders = await mongoFacade.get(query, "orders");
  let transactions = await postgresFacade.getAllApprovedTransactionsId();
  let transactionsSet = new Set(transactions);
  for (let order of orders) {
    if (transactionsSet.has(order["_id"].toHexString())) {
      await mongoFacade.update({ _id: order["_id"] }, { $set: { paymentConfirmed: true } }, "orders");
    }
  }
}

// Check every 10 min
// setInterval(syncConfirmedPayment, 1000 * 60 * 1);
setInterval(syncConfirmedPayment, 1000 * 10);


app.listen(PORT, () => {
  console.log("Server listen on port: " + PORT);
});