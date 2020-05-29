const neo4j = require('neo4j-driver');

function createDriver() {
  return neo4j.driver(
    'bolt://localhost',
    //Insert password
    //Perlt: admin
    //Jesper: Jeppe123#
    neo4j.auth.basic('neo4j', 'Jeppe123#'),
  )

}

async function runDijkstra(city1, city2) {
  return new Promise(async (resolve, reject) => {
    const driver = createDriver();
    try {
      const session = driver.session();
      let res = await session.run(`
      MATCH(from: City{ name: $city1 }), (to: City{ name: $city2})
      CALL apoc.algo.dijkstra(from, to, 'Road', 'time') yield path as path, weight as weight
      RETURN path, weight
      `, {
        city1, city2
      });
      res.records.forEach(record => {
        let segments = record.get("path")["segments"];
        let nodes = segments.map(e => {
          let time = e["relationship"]["properties"]["time"]["low"] ? e["relationship"]["properties"]["time"]["low"] : e["relationship"]["properties"]["time"];
          let from = e["start"]["properties"].name
          let to = e["end"]["properties"].name
          return { from, to, time };
        })
        resolve(nodes);
      })
    } catch (e) {
      reject(e);
    } finally {
      driver.close();
    }
  })
}

async function updateRoad(from, to, time) {
  const driver = createDriver();
  try {
    const session = driver.session();
    let res = await session.run(`
      MATCH (from:City {name: $from})-[r:Road]-(to:City {name: $to})
      set r.time = $time
      return r, from, to
      `, {
      from, to, time
    });
    return res
  } catch (e) {
    reject(e);
  } finally {
    driver.close();
  }
}

async function main() {
  let res = await runDijkstra("Aalborg", "Skalborg")
  console.log(res)
}

module.exports = { runDijkstra, updateRoad }




