const Joi = require('joi');

const authRegister = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).optional(),
    phone: Joi.string().optional()
  })
};

const authLogin = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

const pairingRequest = {
  body: Joi.object({
    deviceInfo: Joi.object().optional(),
    name: Joi.string().optional(),
    deviceId: Joi.string().optional()
  })
};

const pairingConfirm = {
  body: Joi.object({
    pairingCode: Joi.string().required(),
    deviceId: Joi.string().optional(),
    consentData: Joi.object().optional()
  })
};

const eventsUpload = {
  body: Joi.array().items(Joi.object({
    childId: Joi.string().guid({ version: ['uuidv4'] }).optional(),
    eventType: Joi.string().required(),
    payload: Joi.object().required()
  })).min(1).required()
};

const heartbeat = {
  body: Joi.object({
    deviceId: Joi.string().required(),
    manufacturer: Joi.string().optional(),
    model: Joi.string().optional()
  })
};

module.exports = { authRegister, authLogin, pairingRequest, pairingConfirm, eventsUpload, heartbeat };
