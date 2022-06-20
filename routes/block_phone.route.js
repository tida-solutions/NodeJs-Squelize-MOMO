const Router = require("express").Router();
const checkLogin = require("../middlewares/checkLogin.middleware");
const passport = require("passport");
require("../middlewares/authorization.middleware");
const {
  list,
  get,
  create,
  update,
  remove,
} = require("../controllers/block_phone.controller");
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });
const blockPhoneValidate = require("../validations/block_phone.validate");

Router.get("/", checkLogin, csrfProtection, list);

Router.get("/:id", passport.authenticate('jwt', { session: false }), csrfProtection, get);

Router.post("/", passport.authenticate('jwt', { session: false }), csrfProtection, blockPhoneValidate(), create);

Router.put("/:id", passport.authenticate('jwt', { session: false }), csrfProtection, blockPhoneValidate(), update);

Router.delete("/:id", passport.authenticate('jwt', { session: false }), csrfProtection, remove);

module.exports = Router;