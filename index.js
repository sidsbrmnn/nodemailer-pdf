require("dotenv").config();
const express = require("express");
const winston = require("winston");

const app = express();

require("./startup/logging")();
require("./startup/routes")(app);

app.use(express.static(__dirname + "/public"));

const PORT = process.env.PORT;
app.listen(PORT, () => winston.info(`Listening on port ${PORT}`));
