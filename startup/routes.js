const express = require("express");
const mail = require("../routes/mail");
const error = require("../middleware/error");

module.exports = function(app) {
  app.use(express.json());
  app.use("/api/mail", mail);
  app.use(error);
};
