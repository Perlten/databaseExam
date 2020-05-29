const fs = require("fs");
const fetch = require('node-fetch');
const neo4jFacade = require("../databaseFacades/neo4jFacade")

const ORDER_AMOUNT = 100;

const productsList = getProductData("./productData.json");

const phoneSet = new Set();

async function generateOrderData() {
  const names = await getNames();
  const cities = getCities("cities.json");
  let orderSet = new Set();
  for (let i = 0; i < ORDER_AMOUNT; i++) {
    let isDelivered = i % 1000 == 0 ? false : true;
    let paymentConfirmed = true;
    if (!isDelivered) {
      paymentConfirmed = false;
    }

    let cityFrom = "Copenhagen";
    let cityTo = getRandomElement(cities);

    let route;
    if (cityFrom == cityTo) {
      route = [cityFrom];
    } else {
      route = await neo4jFacade.runDijkstra(cityFrom, cityTo);
    }

    orderSet.add({
      name: getRandomElement(names),
      products: getArrayOfProducts(),
      date: randomDate(new Date(2012, 0, 1), new Date()),
      phoneNumber: createPhoneNumber(),
      isDelivered,
      cityFrom,
      cityTo,
      route,
      paymentConfirmed
    })
  }
  saveData("orderData.json", Array.from(orderSet));
  console.log("Orders data generated");
}

function getArrayOfProducts() {
  let amount = Math.round(Math.random() * (10 - 1) + 1);
  let resList = [];
  for (let i = 0; i < amount; i++) {
    resList.push(getRandomElement(productsList));
  }
  return resList;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomElement(list) {
  return list[Math.floor(Math.random() * list.length)];
}

async function getNames() {
  const response = await fetch(
    'https://parseapi.back4app.com/classes/NamesList?limit=6000&order=Name&keys=Name',
    {
      headers: {
        'X-Parse-Application-Id': 'zsSkPsDYTc2hmphLjjs9hz2Q3EXmnSxUyXnouj1I',
        'X-Parse-Master-Key': '4LuCXgPPXXO2sU5cXm6WwpwzaKyZpo3Wpj4G4xXK',
      }
    }
  );
  const data = await response.json();
  return data.results.map(e => e.Name);
}

function createPhoneNumber() {
  let phoneNumber;
  while (true) {
    phoneNumber = Math.round(Math.random() * (99999999 - 11111111) + 11111111)
    if (!phoneSet.has(phoneNumber)) {
      phoneSet.add(phoneNumber);
      break;
    }
  }
  return phoneNumber;
}

function getCities(path) {
  let res = JSON.parse(fs.readFileSync(path));
  return res.map(e => e.city);
}


function getProductData(path) {
  return JSON.parse(fs.readFileSync(path));
}

function saveData(path, data) {
  fs.writeFileSync(path, JSON.stringify(data));
}

generateOrderData();