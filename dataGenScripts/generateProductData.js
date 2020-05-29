const fs = require("fs");


const DATA_AMOUNT = 1000;

let brandList = ["Arla", "Samsung", "Sony", "Microsoft", "Hummel", "HM", "Zara"];
let sizeList = ["small", "large", "medium", "XS", "XL", "XXL", "Supersize", "American Size"];
let ecoList = ["eco friendly", "not eco friendly"];
let madeInList = ["Denmark", "Texas", "New York", "China", "India", "Norway", "Sweden", "Germany", "France", "Ireland", "Italy"];

let productList = [
  createProduct("butter", 5, 100),
  createProduct("Milk", 4, 20),
  createProduct("Playstation 4", 2000, 3500),
  createProduct("Xbox one", 1700, 3200),
  createProduct("Laptop", 500, 20000),
  createProduct("TV", 300, 20000),
];


function createProduct(name, minPrice, maxPrice) {
  return { name, minPrice, maxPrice };
}

function generateProductData() {
  let resSet = new Set();
  for (let i = 0; i < DATA_AMOUNT; i++) {
    let brand = getRandomElement(brandList);
    let size = getRandomElement(sizeList);
    let evo = getRandomElement(ecoList);
    let madeIn = getRandomElement(madeInList);
    let productElement = getRandomElement(productList);
    let product = productElement.name;
    let price = Math.round(Math.random() * (productElement.maxPrice - productElement.minPrice) + productElement.minPrice);
    resSet.add({ brand, size, evo, madeIn, product, price });
  }
  saveData("productData.json", Array.from(resSet));
  console.log("Products data generated");
}


function getRandomElement(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function saveData(path, data) {
  fs.writeFileSync(path, JSON.stringify(data));
}

generateProductData();