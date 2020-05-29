import { url } from './facadeConfig';


export async function addToCart(product) {
  let reddisKey = localStorage.getItem("reddisKey");
  if (!reddisKey) {
    reddisKey = create_UUID();
    localStorage.setItem("reddisKey", reddisKey);
  }

  let basket = await getBasket();
  basket.push(product);

  await fetch(url + "/createBasket", {
    method: "POST",
    body: JSON.stringify({
      key: reddisKey,
      basket: basket
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  return basket;
}

export async function getBasket() {
  let reddisKey = localStorage.getItem("reddisKey");
  let basket = await fetch(url + "/getBasket/" + reddisKey).then(e => e.json());
  if (!basket) basket = [];
  return basket;
}

export function clearBasket() {
  let reddisKey = localStorage.getItem("reddisKey");
  fetch(url + "/createBasket", {
    method: "POST",
    body: JSON.stringify({
      key: reddisKey,
      basket: []
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

function create_UUID() {
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}
