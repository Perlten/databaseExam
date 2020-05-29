node generateProductData.js
node generateOrderData.js

# mongo < deleteCollections.txt

mongoimport --host "mongodb://jeperltwebshop-azpsy.mongodb.net/test" --username jePerltAdmin --password jeppeperlt321 --jsonArray --db jePerltRandomWebshop --collection products --file productData.json
mongoimport --host "mongodb://jeperltwebshop-azpsy.mongodb.net/test" --username jePerltAdmin --password jeppeperlt321 --jsonArray --db jePerltRandomWebshop --collection orders --file orderData.json
# mongoimport --jsonArray --db jePerltRandomWebshop --collection products --file productData.json
# mongoimport --jsonArray --db jePerltRandomWebshop --collection orders --file orderData.json
