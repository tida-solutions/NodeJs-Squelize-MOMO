const { body } = require("express-validator");

module.exports = () => [
  body("phone").notEmpty().withMessage("Phone is required"),
];
