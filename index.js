const express = require("express");
const winston = require("winston");

const app = express();

require("./startup/logging")();
require("./startup/routes")(app);

app.use(express.static(__dirname + "/public"));

const port = process.env.port || 3000;
const server = app.listen(port, () =>
  winston.info(`Listening on port ${port}...`)
);

module.exports = server;
