const { body } = require("express-validator");

module.exports = () => [
    body('title').notEmpty().withMessage("Title is required"),
    body('description').notEmpty().withMessage("Description is required"),
    body('minPlay').notEmpty().withMessage("Min play is required"),
    body('maxPlay').notEmpty().withMessage("Max play is required"),
    body('notification').notEmpty().withMessage("Notification is required"),
]