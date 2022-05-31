"use strict";
const { validationResult } = require("express-validator");
const User = require("../models/index").User;
const TransactionHistory = require("../models/index").TransactionHistory;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Sequelize = require("sequelize");
const { getCurrentDate, getCurrentMonth } = require("../ultils/date.ultil");
const moment = require("moment");

/**
 * Signin
 */
const signin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        status: false,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      return res.json({
        status: false,
        errors: [
          {
            msg: "Email is not exist",
            param: "error",
          },
        ],
      });
    }

    const isUser = await bcrypt.compare(password, user.password);
    if (!isUser) {
      return res.json({
        status: false,
        errors: [
          {
            msg: "Password is incorrect",
            param: "error",
          },
        ],
      });
    }
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "30s",
    });
    res.setHeader("Authorization", `Bearer ${token}`);
    return res.json({
      status: true,
      msg: "Signin successfully",
      token,
    });
  } catch (error) {
    return res.json({
      status: false,
      errors: [
        {
          msg: "Something went wrong",
          param: "error",
        },
      ],
    });
  }
};

/**
 * View history play
 */
const viewHistoryPlay = async (req, res) => {
  const data = await TransactionHistory.findAll({
    where: {
      [Sequelize.Op.not]: [
        {
          type: "reward",
        },
      ],
    },
  });
  return res.render("admin/history", {
    data,
    csrfToken: req.csrfToken(),
  });
};

/**
 * View history reward
 */
const viewHistoryReward = async (req, res) => {
  const data = await TransactionHistory.findAll({
    where: {
      type: "reward",
    },
  });
  return res.render("admin/reward", {
    data,
    csrfToken: req.csrfToken(),
  });
};

/**
 * View dashboard
 */
const viewDashboard = async (req, res) => {
  const dayRevenue = await DayRevenue(getCurrentDate());
  const costDay = await CostDay(getCurrentDate());
  const monthRevenue = await MonthRevenue(getCurrentMonth());
  const costMonth = await CostMonth(getCurrentMonth());
  return res.render("admin/home", {
    dayRevenue,
    costDay,
    monthRevenue,
    costMonth,
    csrfToken: req.csrfToken(),
  });
};

/**
 * Get day revenue
 */
const DayRevenue = async (date) => {
  const data = await TransactionHistory.findAll({
    attributes: [[Sequelize.fn("sum", Sequelize.col("amount")), "totalAmount"]],
    where: {
      [Sequelize.Op.not]: [
        {
          type: "reward",
        },
      ],
      createdAt: {
        [Sequelize.Op.between]: [date, `${date} 23:59:59`],
      },
    },
  });
  return data[0].dataValues.totalAmount || 0;
};

/**
 * Get cost day
 */
const CostDay = async (date) => {
  const data = await TransactionHistory.findAll({
    attributes: [[Sequelize.fn("sum", Sequelize.col("amount")), "totalAmount"]],
    where: {
      type: "reward",
      createdAt: {
        [Sequelize.Op.between]: [date, `${date} 23:59:59`],
      },
    },
  });
  return data[0].dataValues.totalAmount || 0;
};

/**
 * Get month revenue
 */
const MonthRevenue = async (date) => {
  const data = await TransactionHistory.findAll({
    attributes: [[Sequelize.fn("sum", Sequelize.col("amount")), "totalAmount"]],
    where: {
      [Sequelize.Op.and]: [
        {
          [Sequelize.Op.and]: Sequelize.where(
            Sequelize.fn("month", Sequelize.col("createdAt")),
            date
          ),
        },
        {
          [Sequelize.Op.not]: [
            {
              type: "reward",
            },
          ],
        },
      ],
    },
  });
  return data[0].dataValues.totalAmount || 0;
};

/**
 * Get cost month
 */
const CostMonth = async (date) => {
  const data = await TransactionHistory.findAll({
    attributes: [[Sequelize.fn("sum", Sequelize.col("amount")), "totalAmount"]],
    where: {
      [Sequelize.Op.and]: [
        {
          [Sequelize.Op.and]: Sequelize.where(
            Sequelize.fn("month", Sequelize.col("createdAt")),
            date
          ),
        },
        {
          type: "reward",
        },
      ],
    },
  });
  return data[0].dataValues.totalAmount || 0;
};

const getPrice = async (req, res) => {
  const { date } = req.body;
  const day = moment(moment(new Date(date)).add(1, 'days')).format('YYYY-MM-DD');
  const month = moment(new Date(date)).format("MM-YYYY");
  const dayRevenue = await DayRevenue(day);
  const costDay = await CostDay(day);
  const monthRevenue = await MonthRevenue(month);
  const costMonth = await CostMonth(month);

  return res.json({
    dayRevenue,
    costDay,
    monthRevenue,
    costMonth,
  });
};

module.exports = {
  signin,
  viewHistoryPlay,
  viewHistoryReward,
  viewDashboard,
  getPrice,
};
