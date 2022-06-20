const Router = require("express").Router();
const topValidate = require("../validations/top.validate");
const checkLogin = require("../middlewares/checkLogin.middleware");
const passport = require("passport");
require("../middlewares/authorization.middleware");
const {
  list,
  get,
  create,
  update,
  remove,
} = require("../controllers/top.controller");
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });

Router.get("/", checkLogin, csrfProtection, list);

Router.get("/:id", passport.authenticate('jwt', { session: false }), csrfProtection, get);

Router.post("/", passport.authenticate('jwt', { session: false }), csrfProtection, topValidate(), create);

Router.put("/:id", passport.authenticate('jwt', { session: false }), csrfProtection, topValidate(), update);

Router.delete("/:id", passport.authenticate('jwt', { session: false }), csrfProtection, remove);

module.exports = Router;
