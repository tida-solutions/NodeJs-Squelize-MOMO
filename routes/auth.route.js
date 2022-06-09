const Router = require("express").Router();
const { signin } = require('../controllers/auth.controller')
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });
const authValidate = require("../validations/auth.validate");

/**
 * Signin
 */
Router.get("/signin", csrfProtection, (req, res) => {
    res.render("admin/signin", {
        csrfToken: req.csrfToken(),
    });
});
Router.post("/signin", csrfProtection, authValidate.signin(), signin);


module.exports = Router;