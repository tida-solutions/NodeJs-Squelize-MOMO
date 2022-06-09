const Router = require("express").Router();
const topValidate = require("../validations/top.validate");
const checkLogin = require("../middlewares/checkLogin.middleware");

const {
  list,
  get,
  create,
  update,
  remove,
} = require("../controllers/top.controller");
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });

Router.get("/",checkLogin,csrfProtection, list);

Router.get("/:id",csrfProtection, get);

Router.post("/", csrfProtection, topValidate(), create);

Router.put("/:id", csrfProtection, topValidate(), update);

Router.delete("/:id", csrfProtection, remove);

module.exports = Router;
