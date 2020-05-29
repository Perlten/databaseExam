const MongoClient = require('mongodb').MongoClient;

// const url = 'mongodb://localhost:27017';
// const dbName = 'jePerltRandomWebshop';
const url = 'mongodb+srv://jePerltUser:jeppeperlt321@jeperltwebshop-azpsy.mongodb.net/test';
const dbName = 'jePerltRandomWebshop';

async function test() {
  console.log(await get({}, "orders"));
}

// test();

async function connectDatabase() {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function (err, client) {
      if (err) {
        reject(err);
      }
      const db = client.db(dbName);
      resolve({ db, client });
    });
  })
}

async function createOne(object, collectionName) {
  let { client, db } = await connectDatabase();
  const collection = db.collection(collectionName);

  return new Promise((resolve, reject) => {
    collection.insertOne(object, (err) => {
      if (err) {
        client.close();
        reject(err);
        return;
      }
      client.close();
      let id = object["_id"].toHexString();
      resolve(id);
    });
  })
}

async function get(query, collectionName, amount = -1) {
  let { client, db } = await connectDatabase();
  const collection = db.collection(collectionName);
  try {
    let res;
    if (amount < 1) {
      res = await collection.find(query).toArray();
    } else {
      res = await collection.find(query).limit(amount).toArray();
    }
    return res;
  } finally {
    client.close();
  }
}

async function getRandomProducts(amount) {
  let { client, db } = await connectDatabase();
  const collection = db.collection("products");
  try {
    let res;
    res = await collection.aggregate([{ $sample: { size: amount } }]).toArray();
    return res;
  } finally {
    client.close();
  }
}

async function update(query, value, collectionName) {
  let { client, db } = await connectDatabase();
  const collection = db.collection(collectionName);
  try {
    return new Promise((resolve, reject) => {
      collection.updateOne(query, value, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    })
  } finally {
    client.close();
  }
}




async function findOrdersWithCityConnection(to) {
  let { client, db } = await connectDatabase();
  const collection = db.collection("orders");
  try {
    let res = await collection.find({ route: { $elemMatch: { to } }, isDelivered: false }).toArray();
    return res;
  } finally {
    client.close();
  }
}



module.exports = { createOne, findOrdersWithCityConnection, update, get, getRandomProducts };