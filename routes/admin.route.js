const Router = require("express").Router();
const {
  viewHistoryPlay,
  viewHistoryReward,
  viewDashboard,
  viewSetting,
  getPrice,
  actionPhone,
  viewPhone,
  setting
} = require("../controllers/admin.controller");
const passport = require("passport");
require("../middlewares/authorization.middleware");
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });
const settingValidate = require("../validations/setting.validate");
const checkLogin = require("../middlewares/checkLogin.middleware");


/**
 * Dashboard
 */
Router.get("/dashboard", csrfProtection, checkLogin, viewDashboard,);

/**
 * History play
 */
Router.get("/history-play", checkLogin, csrfProtection, viewHistoryPlay);

/**
 * History reward
 */
Router.get("/history-reward", checkLogin, csrfProtection, viewHistoryReward);

/**
 * History refund
 */

Router.get("/setting", checkLogin, csrfProtection, viewSetting);

Router.post("/price", csrfProtection, getPrice);

Router.get("/manage-phone", checkLogin, csrfProtection, viewPhone);

Router.post("/phone", csrfProtection, actionPhone)

Router.post("/setting", passport.authenticate('jwt', { session: false }), csrfProtection, settingValidate(), setting)

module.exports = Router;
