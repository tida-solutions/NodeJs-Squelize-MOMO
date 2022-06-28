const { body } = require("express-validator");


module.exports = () => [
    body('chanle').notEmpty().withMessage("Chan le is required"),
    body('taixiu').notEmpty().withMessage("Tai xiu is required"),
    body('chanle2').notEmpty().withMessage("Chan le 2 is required"),
    body('gap3').notEmpty().withMessage("Gap 3 is required"),
    body('tong3so').notEmpty().withMessage("Tong 3 so is required"),
    body('motphan3').notEmpty().withMessage("Mot phan 3 is required"),
    body('xien').notEmpty().withMessage("Xien is required"),
    body('doanso').notEmpty().withMessage("Doan so is required"),
    body('amduong').notEmpty().withMessage("Am duong is required"),
    body('lien').notEmpty().withMessage("Lien is required"),
    body('motdoi').notEmpty().withMessage("Mot doi is required"),
]