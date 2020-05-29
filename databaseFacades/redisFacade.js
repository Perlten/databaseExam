const redis = require("redis");

const client = redis.createClient();

const defaultTimeout = 1000 * 60 * 60 * 24 * 1; // 1 days 

client.on("error", function (error) {
  console.error(error);
});


async function get(key) {
  return new Promise((resolve, reject) => {
    client.get(key, (err, res) => {
      if (err) {
        reject("Could not read data");
        return;
      }
      resolve(JSON.parse(res));
    })
  })
}


async function write(key, value) {
  return new Promise((resolve, reject) => {
    client.set(key, JSON.stringify(value), (err, res) => {
      if (err) {
        reject("Could not write to redis");
        return;
      }

      setTimeout(() => {
        client.del(key);
      }, defaultTimeout);

      resolve(value);
    });
  })
}



module.exports = { write, get };
