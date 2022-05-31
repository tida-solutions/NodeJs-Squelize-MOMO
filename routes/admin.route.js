const Router = require("express").Router();
const {
  signin,
  viewHistoryPlay,
  viewHistoryReward,
  viewDashboard,
  getPrice,
} = require("../controllers/admin.controller");
const authValidate = require("../validations/auth.validate");
const passport = require("passport");
//require("../middlewares/authorization.middleware");

/**
 * Signin
 */
Router.get("/signin", (req, res) => {
  res.render("admin/signin", {
    csrfToken: req.csrfToken(),
  });
});

Router.post("/signin", authValidate.signin(), signin);

/**
 * Dashboard
 */
Router.get(
  "/dashboard",
  viewDashboard
  //   passport.authenticate("jwt", {
  //     session: false,
  //     failureRedirect: "/admin/signin",
  //   }),
);

/**
 * History play
 */
Router.get("/history", viewHistoryPlay);

/**
 * History reward
 */
Router.get("/reward", viewHistoryReward);

Router.post("/price", getPrice);

module.exports = Router;
