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
const authRoute = require("./routes/auth.route");
const cors = require("cors");


process.env.TZ = "Asia/Ho_Chi_Minh";

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
//app.use(helmet());
app.use(cookieParser());
app.set("view engine", "ejs");
connectDB();

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
        msg: 'Too many requests from this IP, please try again later',
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
app.use("/auth", authRoute);

/**
 * Run server
 */
app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port " + process.env.PORT || 3000);
});
