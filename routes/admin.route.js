const Router = require("express").Router();
const {
  viewHistoryPlay,
  viewHistoryReward,
  viewDashboard,
  viewSetting,
  getPrice,
  actionPhone,
  viewPhone,
  setting,
  viewTransFalse,
  refundTransFalse,
  viewWithdraw,
  viewChangePassword,
  changePassword
} = require("../controllers/admin.controller");
const passport = require("passport");
require("../middlewares/authorization.middleware");
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });
const settingValidate = require("../validations/setting.validate");
const checkLogin = require("../middlewares/checkLogin.middleware");
const authValidate = require("../validations/auth.validate");
const { signin } = require('../controllers/auth.controller')
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname)
  }
})

var upload = multer({
  storage, fileFilter(req, file, cb) {
    if (['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype)) {
      cb(null, true)
    }
    else {
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
})

/**
 * Signin
 */
Router.get("/signin", csrfProtection, (req, res) => {
  res.render("admin/signin", {
    csrfToken: req.csrfToken(),
  });
});
Router.post("/signin", csrfProtection, authValidate.signin(), signin);

/**
 * Dashboard
 */
Router.get("/dashboard", checkLogin, csrfProtection, viewDashboard,);

/**
 * History play
 */
Router.get("/history-play", checkLogin, csrfProtection, viewHistoryPlay);

/**
 * History reward
 */
Router.get("/history-reward", checkLogin, csrfProtection, viewHistoryReward);

/**
 * History false
 */
Router.get("/history-false", checkLogin, csrfProtection, viewTransFalse);

Router.get("/setting", checkLogin, csrfProtection, viewSetting);

Router.post("/price", passport.authenticate('jwt', { session: false }), csrfProtection, getPrice);

Router.get("/manage-phone", checkLogin, csrfProtection, viewPhone);

Router.post("/phone", csrfProtection, actionPhone)

Router.post("/setting", passport.authenticate('jwt', { session: false }), upload.single('logo'), csrfProtection, settingValidate(), setting)

Router.post("/refund", passport.authenticate('jwt', { session: false }), csrfProtection, refundTransFalse)

Router.get('/withdraw', checkLogin, csrfProtection, viewWithdraw)

Router.get('/change-password', checkLogin, csrfProtection, viewChangePassword)

Router.post('/change-password', passport.authenticate('jwt', { session: false }), csrfProtection, changePassword)
module.exports = Router;
