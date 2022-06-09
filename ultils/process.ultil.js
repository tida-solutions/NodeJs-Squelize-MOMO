var Sequelize = require("sequelize");
const Promise = require("bluebird");
const { getCurrentDate, getCurrentTime } = require("../ultils/date.ultil");
const games = require("../games.json");
const axios = require("axios");
const {
  checkChanle,
  checkTaiXiu,
  checkChanle2,
  checkGap3,
  checkTong3So,
  check1Phan3,
  checkXien,
  checkDoanSo,
  checkAmDuong,
  checkLien,
  check1Doi,
  checkOther,
} = require("./checkgame.ultil");
const moment = require("moment");
const TransactionHistory = require("../models/index").TransactionHistory;
const Setting = require("../models/index").Setting;
const PointList = require("../models/index").PointList;
const landMark = require('../landmark')
/**
 * Get data from api
 */
const getData = async (data) => {
  for (const i of data) {
    const comment = i.comment.trim().toLowerCase();
    const typeContent = checkTypeContent(comment);
    const result = checkResult(typeContent, i.tranId, comment);
    const checkLimitPrice = await limitPrice(i.amount);
    if (checkLimitPrice) {
      if (!(await isSaveHistory(i.tranId, "false"))) {
        saveHistory({
          receivingPhone: i.user,
          transferPhone: i.partnerId,
          tradingCode: i.tranId,
          type: "false",
          amount: i.amount,
          comment: i.comment,
          transferTime: i.clientTime,
        });
      }
    } else {
      if (result) {
        if (!(await isSaveHistory(i.tranId, "win"))) {
          saveHistory({
            receivingPhone: i.user,
            transferPhone: i.partnerId,
            tradingCode: i.tranId,
            type: "win",
            amount: i.amount,
            comment: i.comment,
            transferTime: i.clientTime,
          });
        }

        return sendReward({
          transId: i.tranId,
          reciever: i.partnerId,
          amount: i.amount,
          ratio: Number(result),
          comment,
        });
      } else {
        if (typeContent === "other") {
          if (!(await isSaveHistory(i.tranId, "false"))) {
            saveHistory({
              receivingPhone: i.user,
              transferPhone: i.partnerId,
              tradingCode: i.tranId,
              type: "false",
              amount: i.amount,
              comment: i.comment,
              transferTime: i.clientTime,
            });
          }
        } else {
          if (!(await isSaveHistory(i.tranId, "lose"))) {
            saveHistory({
              receivingPhone: i.user,
              transferPhone: i.partnerId,
              tradingCode: i.tranId,
              type: "lose",
              amount: i.amount,
              comment: i.comment,
              transferTime: i.clientTime,
            });
          }
        }
      }
    }
  }
};

/**
 * Check type content
 */
const checkTypeContent = (comment) => {
  const game = games.filter((game) => {
    return game.content.includes(comment);
  });
  return game.length > 0 ? game[0].name : "other";
};

/** 
 * Check result
 */
const checkResult = (type, transId, comment) => {
  switch (type) {
    case "chanle":
      return checkChanle(transId, comment);
    case "taixiu":
      return checkTaiXiu(transId, comment);
    case "chanle2":
      return checkChanle2(transId, comment);
    case "gap3":
      return checkGap3(transId, comment);
    case "tong3so":
      return checkTong3So(transId, comment);
    case "1phan3":
      return check1Phan3(transId, comment);
    case "xien":
      return checkXien(transId, comment);
    case "doanso":
      return checkDoanSo(transId, comment);
    case "amduong":
      return checkAmDuong(transId, comment);
    case "lien":
      return checkLien(transId, comment);
    case "motdoi":
      return check1Doi(transId, comment);
    default:
      return checkOther(transId, comment);
  }
};

/**
 * Send reward
 */
const sendReward = async (data) => {
  try {
    const { transId, reciever, amount, ratio, comment } = data;
    const limit = await checkLimit(amount * ratio);
    if (!(await checkReward(transId))) {
      if (limit) {
        saveHistory({
          receivingPhone: reciever,
          transferPhone: 'null',
          tradingCode: transId,
          type: "unreward",
          amount: amount * ratio,
          comment: `${transId} | ${comment}`,
        });
      }
    }
  } catch (error) {
    console.log(error);
    console.log("Reward error");
  }
};

/**
 * Check reward
 */
const checkReward = async (transId) => {
  const result = await TransactionHistory.findOne({
    where: {
      tradingCode: transId,
      type: {
        [Sequelize.Op.in]: ["unreward", 'reward'],
      }
    },
  });
  return result ? true : false;
};

/**
 * Save history
 */
const saveHistory = (data) => {
  TransactionHistory.create({
    ...data,
    createdAt: getCurrentTime(),
    updatedAt: getCurrentTime(),
  });
};

const getListPhone = async () => {
  try {
    const apiUrl = "https://congthanhtoanmomo.xyz/api/getMomoInfo";
    const access_token = process.env.ACCESS_TOKEN;
    const listPhone = await axios.post(apiUrl, { access_token });
    return listPhone.data.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Check limit phone and swap phone
 */
const checkLimit = async (money) => {
  const listPhone = await getListPhone();
  const data = listPhone.filter(item => item.tonggdchuyen <= 140 && item.tongchuyentrongngay <= 40000000 && item.balance >= money);
  data.sort((a, b) => {
    return b.balance - a.balance;
  });
  return data.length > 0 ? data[0] : false;
};

/**
 * Save history
 */
const isSaveHistory = async (transId, type) => {
  const result = await TransactionHistory.findOne({
    where: {
      tradingCode: transId,
      type,
    },
  });
  return result ? true : false;
};

/**
 * Check limite price
 */
const limitPrice = async (price) => {
  const setting = await Setting.findOne({
    where: {
      id: 1
    }
  })
  return price < setting.minPlay || price > setting.maxPlay ? true : false;
};


const getTransUnReward = async () => {
  return await TransactionHistory.findAll({
    where: {
      type: "unreward"
    },
  });
}

const checkTranId = async (tranId) => {
  const apiUrl = 'https://congthanhtoanmomo.xyz/api/checkTranId'
  const access_token = process.env.ACCESS_TOKEN
  const data = {
    access_token,
    tranId
  }
  const res = await axios.post(apiUrl, data)

  return res.data.data && moment(res.data.data.clientTime).format("YYYY-MM-DD") == getCurrentDate() ? true : false
}


const getDataTranId = async (tranId) => {
  const apiUrl = 'https://congthanhtoanmomo.xyz/api/checkTranId'
  const access_token = process.env.ACCESS_TOKEN
  const data = {
    access_token,
    tranId
  }

  const res = await axios.post(apiUrl, data)
  return res.data.data
}

const handelRefund = async (tranId) => {
  const data = await getDataTranId(tranId)
  const limit = await checkLimit(data.amount)
  const apiUrl = "https://congthanhtoanmomo.xyz/api/sendMoneyMomo";
  if (limit) {
    saveHistory({
      receivingPhone: data.partnerId,
      transferPhone: limit.phone,
      tradingCode: tranId,
      type: "refund",
      amount: data.amount,
      comment: `${tranId} | Refund`,
    })
    const dataSend = {
      access_token: process.env.ACCESS_TOKEN,
      phone: limit.phone,
      phoneto: data.partnerId,
      amount: data.amount,
      note: `${tranId} | Refund`,
    };
    axios.post(apiUrl, dataSend)
  }
}

const allTransWin = async () => {
  const data = await TransactionHistory.findAll({
    where: {
      [Sequelize.Op.and]: [
        {
          [Sequelize.Op.and]: Sequelize.where(
            Sequelize.fn("date", Sequelize.col("createdAt")),
            getCurrentDate()
          ),
        },
        {
          type: 'win',
        },
      ],
    },
    limit: 50,
    order: [["id", "DESC"]],
  })

  return data.map(item => item.dataValues)
}

const allTransWinUnReward = async (tradingCode) => {
  const data = await TransactionHistory.findOne({
    where: {
      [Sequelize.Op.and]: [
        {
          type: 'reward',
          tradingCode
        },
      ],
    },
  })
  return data
}

const getTranNotReward = async () => {
  const win = await allTransWin()
  for (const item of win) {
    const comment = (item.comment).toLowerCase()
    const typeContent = checkTypeContent(comment);
    const result = checkResult(typeContent, item.tradingCode, comment);
    if (!await allTransWinUnReward(item.tradingCode)) {
      sendReward({
        transId: item.tradingCode,
        reciever: item.transferPhone,
        amount: item.amount,
        ratio: result,
        comment
      })
    }
  }
}

const getPointListToday = async () => {
  const data = await PointList.findAll({
    where: Sequelize.where(
      Sequelize.fn("date", Sequelize.col("createdAt")),
      getCurrentDate()
    ),
  })
  return data.map(item => item.dataValues.phone)
}

const checkPhonePointListToday = async () => {
  const listPhone = await getPointListToday()
  const apiUrl = "https://congthanhtoanmomo.xyz/api/sendMoneyMomo";
  for (const i of listPhone || []) {
    const count = await countPhoneIsPonitList(i)
    if (count.count < 5) {
      const totalAmount = count.totalAmount
      const isCheck = landMark.filter(item => item.order == count.count + 1)
      if (Number(totalAmount) >= Number(isCheck[0].bettween[0]) && Number(totalAmount) <= isCheck[0].bettween[1]) {
        const limit = await checkLimit(isCheck[0].gift)
        if (limit) {
          saveHistory({
            receivingPhone: i,
            transferPhone: limit.phone,
            tradingCode: null,
            type: "point",
            amount: isCheck[0].gift,
            comment: `${i} | Point List`,
          })
          const dataSend = {
            access_token: process.env.ACCESS_TOKEN,
            phone: limit.phone,
            phoneto: i,
            amount: isCheck[0].gift,
            note: `${isCheck[0].gift} | Point List`,
          };
          axios.post(apiUrl, dataSend)
        }
      }
      return
    }
  }
}

const countPhoneIsPonitList = async (phone) => {
  const data = await TransactionHistory.findAll({
    attributes: [
      [Sequelize.fn("sum", Sequelize.col("amount")), "totalAmount"],
      [Sequelize.fn("count", Sequelize.col("id")), "count"]
    ],
    where: {
      [Sequelize.Op.and]: [
        {
          [Sequelize.Op.and]: Sequelize.where(
            Sequelize.fn("date", Sequelize.col("createdAt")),
            getCurrentDate()
          ),
          type: 'point',
          receivingPhone: phone
        },
      ]
    }
  })
  return data[0].dataValues
}

module.exports = {
  checkTypeContent,
  checkResult,
  sendReward,
  checkReward,
  saveHistory,
  checkLimit,
  isSaveHistory,
  limitPrice,
  getData,
  getListPhone,
  getTransUnReward,
  checkTranId,
  getDataTranId,
  handelRefund,
  getTranNotReward,
  checkPhonePointListToday
};
