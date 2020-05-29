import { url } from './facadeConfig';


export async function createOrder(orderObject) {
  let response = await fetch(url + "/createOrder", {
    method: "POST",
    body: JSON.stringify(orderObject),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(e => e.json());

  console.log(response);
}