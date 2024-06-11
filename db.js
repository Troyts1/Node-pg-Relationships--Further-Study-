const { Client } = require("pg");

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = "postgresql:///biztime_test";
} else {
  DB_URI = "postgresql:///biztime";
}

let db = new Client({
  connectionString: DB_URI
});

db.connect();

module.exports = db;




// const { Client } = require("pg");

// const client = new Client({
//   connectionString: "postgresql:///biztime_test"
// });

// client.connect();


// module.exports = client;









