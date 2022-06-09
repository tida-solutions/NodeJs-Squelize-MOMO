const { body } = require("express-validator");

module.exports = () => [
    body('minPlay').notEmpty().withMessage("Min play is required"),
    body('maxPlay').notEmpty().withMessage("Max play is required"),
    body('notification').notEmpty().withMessage("Notification is required"),
]