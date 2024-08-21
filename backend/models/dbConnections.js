const mongoose = require("mongoose");

const uri =
  "mongodb+srv://DarkVampire:<abhinav@0609>@cluster0.jhefy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

function dbConnection() {
  mongoose
    .connect(uri)
    .then((response) => {
      console.log("DB CONNECT SUCCESS");
    })
    .catch((err) => {
      console.log(err);
    });
}

module.exports = dbConnection;