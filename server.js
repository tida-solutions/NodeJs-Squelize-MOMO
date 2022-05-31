require("dotenv").config();
require("./cron");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const helmet = require("helmet");
const connectDB = require("./config/connect");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const rateLimit = require("express-rate-limit");
const adminRoute = require("./routes/admin.route");
const homeRoute = require("./routes/home.route");
const topRoute = require("./routes/top.route");
const csrfProtection = csrf({ cookie: true });
const passport = require("passport");
const path = require("path");

require('./controllers/home.controller');


process.env.TZ = "UTC +7";


console.log(new Date());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
//app.use(helmet());
app.use(cookieParser());
// app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");
connectDB();

/**
 * Anti csfr
 */
app.use(csrfProtection);

/**
 * Rate limit request
 */
app.use(
  rateLimit({
    windowMs: 1000,
    max: 100,
    handler: (req, res) => {
      return res.json({
        status: false,
        errors: [
          {
            msg: "Too many requests",
            param: "error",
          },
        ],
      });
    },
  })
);

/**
 * Routers
 */
app.use("/admin", adminRoute);
app.use("/", homeRoute);
app.use("/admin/top", topRoute);

/**
 * Passport
 */
// app.use(passport.initialize());
// app.use(passport.session());

/**
 * Run server
 */
app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port " + process.env.PORT || 3000);
});
