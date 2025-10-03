const Joi = require('joi');

module.exports = (schema) => (req, res, next) => {
  const toValidate = {};
  if (schema.params) toValidate.params = req.params;
  if (schema.query) toValidate.query = req.query;
  if (schema.body) toValidate.body = req.body;

  const { error, value } = Joi.object(schema).validate(toValidate, { abortEarly: false, allowUnknown: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ success: false, error: error.details.map(d => d.message).join(', ') });
  }

  // merge validated values back
  if (value.body) req.body = value.body;
  if (value.query) req.query = value.query;
  if (value.params) req.params = value.params;
  next();
};
