const { Pool, Client } = require('pg')


const client = new Client({
  user: 'jePerltUser',
  host: 'localhost',
  database: 'jePerltRandomWebshop',
  password: 'jeppeperlt321',
  port: 5432,
})

client.connect();


async function test() {
  let query = "SELECT * from  accounts";
  let response = await client.query(query);
  let users = response.rows.map(e => e.name);
  console.log(users);
}

async function getAllApprovedTransactionsId() {
  let query = "SELECT webshoporderid from  transactions t WHERE t.approved = true";
  let response = await client.query(query);
  return response.rows.map(e => e.webshoporderid);
}

async function getAllApprovedTransactions() {
  let query = "SELECT * from  transactions t WHERE t.approved = true";
  let response = await client.query(query);
  return response.rows.map(e => {
    return ({
      amount: e.amount,
      webshoporderid: e.webshoporderid,
      date: e.date
    })
  });
}


async function createPerson(person) {
  let query = "INSERT INTO accounts(phonenumber, name) VALUES($1, $2)";
  const values = [person["phoneNumber"], person["name"]];
  await client.query(query, values);
}

async function createCreditcard(creditCard) {
  try {
    let query = "INSERT INTO creditcards(cardnumber, verificationcode, expirationdate, fk_account) VALUES($1, $2, $3, $4)";
    const values = [creditCard["cardNumber"], creditCard["verificationCode"], creditCard["expirationDate"], creditCard["phoneNumber"]];
    await client.query(query, values);
  } catch (e) {
    throw "Could not create creditcard"
  }
}

/*
  {
    creditCard: {
      phoneNumber,
      verificationCode,
      cardNumber,
      expirationDate
    }
    amount
    webShopOrderId
  }
*/
async function createTransaction(transaction) {
  try {
    let cd = transaction.creditCard;
    let checkCreditcardQuery = "SELECT * FROM creditcards WHERE cardnumber = $1";
    let response = await client.query(checkCreditcardQuery, [cd.cardNumber]);
    if (response.rowCount == 0) {
      await createCreditcard(cd);
    } else {
      let rc = response.rows[0];
      if (
        rc.verificationcode != cd.verificationCode ||
        rc.fk_account != cd.phoneNumber ||
        rc.expirationdate != cd.expirationDate) {
        throw "Creditcard does not have the right information";
      }
    }
    try {

      let createTransactionQuery = "INSERT INTO transactions(amount, fk_creditcards, webshoporderid) values($1, $2, $3)";
      let createTransactionValues = [transaction.amount, cd.cardNumber, transaction.webShopOrderId];
      await client.query(createTransactionQuery, createTransactionValues);
    } catch (e) {
      throw "Could not create transaction";
    }
  } finally {
  }
}

async function checkNameAndPhoneNumberExits(phoneNumber, name) {
  let query = "SELECT * FROM accounts a WHERE a.phonenumber = $1 AND a.name = $2";
  const values = [phoneNumber, name];
  let response = await client.query(query, values);
  if (response.rowCount == 0) {
    throw "Could not find user";
  }
}

// createTransaction({
//   creditCard: {
//     phoneNumber: 28940903,
//     verificationCode: 123,
//     cardNumber: 1111111111111199,
//     expirationDate: "11-11"
//   },
//   amount: 100
// });

module.exports = { createPerson, createTransaction, getAllApprovedTransactions, getAllApprovedTransactionsId, checkNameAndPhoneNumberExits };