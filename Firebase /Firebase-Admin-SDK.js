var admin = require("firebase-admin");

var serviceAccount = require("/Users/yzydalshmry/Desktop/mais/Firebase /serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
