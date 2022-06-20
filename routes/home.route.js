const Router = require("express").Router();
const { checkTransFalse,
    viewHome,
    hook,
    getHistoryWin,
    pointList,
    introduceToday
} = require("../controllers/home.controller");
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });
Router.get("/", csrfProtection, viewHome);

Router.post("/checkCode", csrfProtection, checkTransFalse);

Router.post("/webhook", hook);

Router.get('/getHistoryWin', getHistoryWin);

Router.post("/pointList", csrfProtection, pointList);

Router.post('/introduce', introduceToday)

module.exports = Router;
