const Router = require("express").Router();
const { checkTransFalse } = require("../controllers/home.controller");

Router.get("/", (req, res) => {
  res.render("home/index", {
    csrfToken: req.csrfToken(),
  });
});

Router.post("/checkCode", checkTransFalse);

module.exports = Router;
