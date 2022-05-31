const { body } = require("express-validator");

module.exports = () => [
  body("phone").notEmpty().withMessage("Phone is required"),
  body("price").notEmpty().withMessage("Price is required"),
  body("gift").notEmpty().withMessage("Gift is required"),
];
