const Joi = require("joi");

module.exports = function(req) {
  const schema = {
    name: Joi.string()
      .min(3)
      .max(50)
      .required(),
    email: Joi.string()
      .required()
      .email()
  };

  return Joi.validate(req, schema);
};
