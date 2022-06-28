"use strict";
const { validationResult } = require("express-validator");
const TransactionHistory = require("../models/index").TransactionHistory;
const Phone = require("../models/index").Phone;
const Sequelize = require("sequelize");
const { getCurrentDate, getCurrentMonth } = require("../ultils/date.ultil");
const moment = require("moment");
const Setting = require("../models/index").Setting;
const axios = require("axios");
const Promise = require("bluebird");
const { handelRefund, countToday, totalMonth, updatePhones, getSetting, getGame } = require("../ultils/process.ultil");
const User = require("../models/index").User;
const bcrypt = require('bcrypt');
const GameModel = require("../models/index").Game;

/**
 * View history play
 */
const viewHistoryPlay = async (req, res) => {
  const list = await TransactionHistory.findAll({
    where: {
      type: ["lose", "win", "false"],
    },
    order: [["id", "DESC"]],
  });
  return res.render("admin/history", {
    list,
    csrfToken: req.csrfToken(),
  });
};

/**
 * View history reward
 */
const viewHistoryReward = async (req, res) => {
  const list = await TransactionHistory.findAll({
    where: {
      type: ["reward", 'refund', 'point'],
    },
    order: [["id", "DESC"]],
  });
  return res.render("admin/reward", {
    list,
    csrfToken: req.csrfToken(),
  });
};

/**
 * View dashboard
 */
const viewDashboard = async (req, res) => {
  const dayRevenue = await DayRevenue(getCurrentDate(), 'receive');
  const costDay = await DayRevenue(getCurrentDate(), 'send');
  const monthRevenue = await MonthRevenue(getCurrentMonth(), 'receive');
  const costMonth = await MonthRevenue(getCurrentMonth(), 'send');
  return res.render("admin/home", {
    dayRevenue,
    costDay,
    monthRevenue,
    costMonth,
    csrfToken: req.csrfToken(),
  });
};

const viewSetting = async (req, res) => {
  const setting = await getSetting();
  return res.render("admin/setting", {
    csrfToken: req.csrfToken(),
    setting
  })
}

/**
 * View Phone
 */
const viewPhone = async (req, res) => {
  const list = await Phone.findAll();
  updatePhones()
  return res.render("admin/phone", {
    csrfToken: req.csrfToken(),
    list,
  })
}

/**
 * Show / Hidden phone 
 */
const actionPhone = async (req, res) => {
  const { phone, isShow } = req.body;

  Phone.update({
    isShow: isShow === 'true' ? 1 : 0
  }, {
    where: {
      phone
    }
  })
}

/**
 * Get day revenue 
 */
const DayRevenue = async (date, type) => {
  const data = await TransactionHistory.findAll({
    attributes: [[Sequelize.fn("sum", Sequelize.col("amount")), "totalAmount"]],
    where: {
      [Sequelize.Op.and]: [
        {
          [Sequelize.Op.and]: Sequelize.where(
            Sequelize.fn("date", Sequelize.col("createdAt")),
            date
          ),
          type: type === 'send' ? ["reward", "point", 'refund'] : ["win", "lose", "false"],
        },
      ]
    }
  });
  return data[0].dataValues.totalAmount || 0;
};

/**
 * Get month revenue
 */
const MonthRevenue = async (date, type) => {
  const data = await TransactionHistory.findAll({
    attributes: [[Sequelize.fn("sum", Sequelize.col("amount")), "totalAmount"]],
    where: {
      [Sequelize.Op.and]: [
        {
          [Sequelize.Op.and]: Sequelize.where(
            Sequelize.fn("month", Sequelize.col("createdAt")),
            date
          ),
          type: type === 'send' ? ["reward", "point", 'refund'] : ["win", "lose", "false"],
        },
      ],
    },
  });
  return data[0].dataValues.totalAmount || 0;
};

/**
 * Get price by day
 */
const getPrice = async (req, res) => {
  const { date } = req.body;
  const day = moment(moment(new Date(date))).format('YYYY-MM-DD');
  const month = moment(new Date(date)).format("MM-YYYY");
  const dayRevenue = await DayRevenue(day, 'receive');
  const costDay = await DayRevenue(day, 'send');
  const monthRevenue = await MonthRevenue(month, 'receive');
  const costMonth = await MonthRevenue(month, 'send');
  return res.json({
    dayRevenue,
    costDay,
    monthRevenue,
    costMonth,
  });
};

/**
 *Update setting
 */
const setting = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        status: false,
        errors: errors.array(),
      });
    }

    const dataRq = req.body;
    const data = await getSetting();
    delete dataRq.logo
    Setting.update({
      logo: req.file?.filename || data.logo,
      ...dataRq,
    },
      {
        where: {
          maintenance: data.maintenance
        }
      })
    return res.json({
      status: true,
      msg: 'Update success'
    })

  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      msg: 'Update fail'
    })
  }
}

/**
 * Get trans  false
 */
const getAllTransFalse = async () => {
  const data = await TransactionHistory.findAll({
    where: {
      type: 'false'
    },
    order: [['id', 'DESC']]
  })

  const dataRS = Promise.all(data.map(async (item) => {
    const checkId = await checkTranIdRefund(item.tradingCode);
    if (!checkId) {
      return item;
    }
  }))

  return dataRS.map(item => item?.dataValues || null).filter(item => item !== null);
}

const checkTranIdRefund = async (tranId) => {
  const data = await TransactionHistory.findAll({
    where: {
      tradingCode: tranId,
      type: 'refund'
    }
  })
  return data.length > 0 ? true : false
}

/**
 * View transaction false
 */

const viewTransFalse = async (req, res) => {
  const list = await getAllTransFalse();
  return res.render('admin/history_false', {
    csrfToken: req.csrfToken(),
    list
  })
}

/**
 * Refund
 */
const refundTransFalse = async (req, res) => {
  try {
    const { arr } = req.body;
    for (const item of arr) {
      const checkId = await checkTranIdRefund(item);
      if (!checkId) {
        handelRefund(item);
      }
    }
    return res.json({
      status: true,
      msg: 'Refund success'
    })
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      msg: 'Refund fail'
    })
  }
}

/**
 * View withdraw
 */
const viewWithdraw = async (req, res) => {
  // const phones = await getListPhone();

  return res.render('admin/withdraw', {
    csrfToken: req.csrfToken(),
    // phones
  })
}

/**
 * View change password
 */
const viewChangePassword = async (req, res) => {
  return res.render('admin/change_password', {
    csrfToken: req.csrfToken(),
  })
}

/**
 * Change password
 */
const changePassword = async (req, res) => {
  try {
    const { oldPass, newPass } = req.body;

    const user = await User.findOne({
      where: {
        email: req.user.email
      }
    });

    const isUser = await bcrypt.compare(oldPass, user.password);
    if (!isUser) {
      return res.json({
        status: false,
        msg: 'Old password is wrong'
      })
    }

    User.update({
      password: await bcrypt.hash(newPass, 10)
    },
      {
        where: {
          email: req.user.email
        }
      })
    return res.json({
      status: true,
      msg: 'Change password success'
    })
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      msg: 'Change password fail'
    })
  }
}

const viewGame = async (req, res) => {
  const game = await getGame();
  return res.render('admin/game', {
    csrfToken: req.csrfToken(),
    game
  })
}

const updateGame = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        status: false,
        errors: errors.array(),
      });
    }
    const dataRq = req.body;
    const game = await getGame();
    GameModel.update({
      ...dataRq,
    },
      {
        where: {
          chanle: game.chanle
        }
      })
    return res.json({
      status: true,
      msg: 'Update success'
    })
  }
  catch (error) {
    console.log(error);
  }
}

module.exports = {
  viewHistoryPlay,
  viewHistoryReward,
  viewDashboard,
  getPrice,
  viewSetting,
  actionPhone,
  viewPhone,
  setting,
  countToday,
  totalMonth,
  viewTransFalse,
  refundTransFalse,
  viewWithdraw,
  viewChangePassword,
  changePassword,
  viewGame,
  updateGame
};
