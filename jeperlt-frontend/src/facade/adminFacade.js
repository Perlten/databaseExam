import { url } from './facadeConfig';


export async function getApprovedTransaction() {
  return fetch(url + "/approvedTransactions").then(e => e.json());
}

export async function updateRoad(updatedRoad) {
  return fetch(url + "/updateRoad", {
    method: "PUT",
    body: JSON.stringify(updatedRoad),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(e => e.json());
}