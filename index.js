const express = require("express");

const app = express();

require("./startup/routes")(app);

app.use(express.static(__dirname + "/public"));

const port = process.env.port || 3000;
const server = app.listen(port, () =>
  console.log(`Listening on port ${port}...`)
);

module.exports = server;
