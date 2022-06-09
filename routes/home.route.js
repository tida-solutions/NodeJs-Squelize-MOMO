const Router = require("express").Router();
const { checkTransFalse, viewHome, hook, getHistoryWin, pointList } = require("../controllers/home.controller");
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });
Router.get("/", csrfProtection, viewHome);

Router.post("/checkCode", csrfProtection, checkTransFalse);

Router.post("/webhook", hook);

Router.get('/getHistoryWin', getHistoryWin);

Router.post("/pointList", pointList);

module.exports = Router;
 