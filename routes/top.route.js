const Router = require("express").Router();
const topValidate = require("../validations/top.validate");
const {
  list,
  get,
  create,
  update,
  remove,
} = require("../controllers/top.controller");

Router.get("/", list);

Router.get("/:id", get);

Router.post("/", topValidate(), create);

Router.put("/:id", topValidate(), update);

Router.delete("/:id", remove);

module.exports = Router;
