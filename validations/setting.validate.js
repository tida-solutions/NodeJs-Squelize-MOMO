const { body } = require("express-validator");

module.exports = () => [
    body('title').notEmpty().withMessage("Title is required"),
    body('description').notEmpty().withMessage("Description is required"),
    body('minPlay').notEmpty().withMessage("Min play is required"),
    body('maxPlay').notEmpty().withMessage("Max play is required"),
    body('boxChat').notEmpty().withMessage("Box chat is required"),
    body('notification').notEmpty().withMessage("Notification is required"),
    body('accessToken').notEmpty().withMessage("Access token is required"),
    body('signature').notEmpty().withMessage("Signature is required"),
]