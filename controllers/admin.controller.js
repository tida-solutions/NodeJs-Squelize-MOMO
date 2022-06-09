"use strict";
const { validationResult } = require("express-validator");
const TransactionHistory = require("../models/index").TransactionHistory;
const Phone = require("../models/index").Phone;
const Sequelize = require("sequelize");
const { getCurrentDate, getCurrentMonth, getCurrentTime } = require("../ultils/date.ultil");
const moment = require("moment");
const { getListPhone } = require('../ultils/process.ultil');
const Setting = require("../models/index").Setting;


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

const viewHistoryRefund = async (req, res) => {
  const list = await TransactionHistory.findAll({
    where: {
      type: "refund",
    },
    order: [["id", "DESC"]],
  });
  return res.render("admin/refund", {
    list,
    csrfToken: req.csrfToken(),
  });
}

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

const viewSetting = async (req, res) => {
  const setting = await Setting.findOne({
    where: {
      id: 1
    }
  });
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
  updatePhones();
  return res.render("admin/phone", {
    csrfToken: req.csrfToken(),
    list,
  })
}


/**
 * Get list phone from api
 */
const updatePhones = async () => {
  let phoneInData = await Phone.findAll();
  const arrPhoneInData = []
  phoneInData.forEach(async (phone) => {
    arrPhoneInData.push(phone.phone);
  })
  const phones = await getListPhone();
  const arrPhones = []
  phones.forEach(async (phone) => {
    arrPhones.push(phone.phone);
  })
  const arrPhoneNotInData = phones.filter(phone => !arrPhoneInData.includes(phone.phone));
  if (arrPhoneNotInData.length > 0)
    return arrPhoneNotInData.forEach(async (phone) => {
      return Phone.create({
        phone: phone.phone,
        amount: phone.balance,
        countSendDay: phone.tonggdchuyen,
        countReceiveDay: phone.tonggdnhan,
        totalSendDay: phone.tongchuyentrongngay,
        totalReceiveDay: phone.tongnhantrongngay,
        totalSendMonth: 0,
        totalReceiveMonth: 0,
      })
    })
  return phones.forEach(async (phone) => {
    return Phone.update({
      amount: phone.balance,
      countSendDay: phone.tonggdchuyen,
      countReceiveDay: phone.tonggdnhan,
      totalSendDay: phone.tongchuyentrongngay,
      totalReceiveDay: phone.tongnhantrongngay,
      totalSendMonth: await totalSendMonth((phone.phone).toString()),
      totalReceiveMonth: await totalReceiveMonth((phone.phone).toString()),
    },
      {
        where: {
          phone: phone.phone
        }
      })
  })
}

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

/**
 * Get total send month
 */
const totalSendMonth = async (phone) => {
  const data = await TransactionHistory.findAll({
    attributes: [[Sequelize.fn("sum", Sequelize.col("amount")), "totalAmount"]],
    where: {
      [Sequelize.Op.and]: [
        {
          [Sequelize.Op.and]: Sequelize.where(
            Sequelize.fn("month", Sequelize.col("createdAt")),
            getCurrentMonth()
          ),
          type: ["reward", "refund"],
          transferPhone: phone
        },

      ]
    }
  })
  return data[0].dataValues.totalAmount || 0;
}

/**
 * Get total receive month
 */
const totalReceiveMonth = async (phone) => {
  const data = await TransactionHistory.findAll({
    attributes: [[Sequelize.fn("sum", Sequelize.col("amount")), "totalAmount"]],
    where: {
      [Sequelize.Op.and]: [
        {
          [Sequelize.Op.and]: Sequelize.where(
            Sequelize.fn("month", Sequelize.col("createdAt")),
            getCurrentMonth()
          ),
          type: ["win", "lose", 'false'],
          receivingPhone: phone
        },

      ]
    }
  })
  return data[0].dataValues.totalAmount || 0;
}

/**
 * Get price by day
 */
const getPrice = async (req, res) => {
  const { date } = req.body;
  const day = moment(moment(new Date(date))).format('YYYY-MM-DD');
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

/**
 * Setting
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

    const { maintenance, minPlay, maxPlay, notification } = req.body;
    const data = await Setting.findAll();
    if (data.length === 0) {
      Setting.create({
        maintenance: maintenance === 'true' ? 'on' : 'off',
        minPlay,
        maxPlay,
        notification
      })
    }
    else {
      Setting.update({
        maintenance: maintenance === 'true' ? 'on' : 'off',
        minPlay,
        maxPlay,
        notification
      },
        {
          where: {
            id: 1
          }
        })
    }
    return res.json({
      status: true,
      msg: 'Update success'
    })

  } catch (error) {
    return res.json({
      status: false,
      msg: 'Update fail'
    })
  }

}


module.exports = {
  viewHistoryPlay,
  viewHistoryReward,
  viewDashboard,
  viewHistoryRefund,
  getPrice,
  viewSetting,
  actionPhone,
  viewPhone,
  setting
};
