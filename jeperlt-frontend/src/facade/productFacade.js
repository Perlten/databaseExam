import { url } from './facadeConfig'


export async function getProducts(page) {
  let amount = 12 * page;
  let response = await fetch(url + "/products?amount=" + amount);
  let products = await response.json();
  return products;
}