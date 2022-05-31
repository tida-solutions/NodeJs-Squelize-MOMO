const { body } = require("express-validator");
const signin = () => [
  body("email").isEmail().withMessage("Email is invalid"),
  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = {
  signin, 
};
 