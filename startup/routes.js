const { json } = require("body-parser");

const error = require("../middleware/error");
const mail = require("../routes/mail");

module.exports = function(app) {
  app.use(json());
  app.use("/api/mail", mail);
  app.use(error);
};
