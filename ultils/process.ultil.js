var Sequelize = require("sequelize");
const Promise = require("bluebird");
const { getCurrentDate, getCurrentTime, getCurrentMonth } = require("../ultils/date.ultil");
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
const Phone = require("../models/index").Phone;
const GameModel = require("../models/index").Game;
const landMark = require('../landmark')





/**
 * Get data from api
 */
const getData = async (data) => {
  for (const i of data) {
    const comment = i.comment.trim().toLowerCase();
    const typeContent = checkTypeContent(comment);
    const result = await checkResult(typeContent, i.tranId, comment);
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

const getSetting = () => {
  return Setting.findOne({
    attributes: [
      'title',
      'description',
      'logo',
      'maintenance',
      'notification',
      'minPlay',
      'maxPlay',
      'accessToken',
      'signature',
      'boxChat'
    ]
  });
}


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
const checkResult = async (type, transId, comment) => {
  switch (type) {
    case "chanle":
      return await checkChanle(transId, comment);
    case "taixiu":
      return await checkTaiXiu(transId, comment);
    case "chanle2":
      return await checkChanle2(transId, comment);
    case "gap3":
      return await checkGap3(transId, comment);
    case "tong3so":
      return await checkTong3So(transId, comment);
    case "1phan3":
      return await check1Phan3(transId, comment);
    case "xien":
      return await checkXien(transId, comment);
    case "doanso":
      return await checkDoanSo(transId, comment);
    case "amduong":
      return await checkAmDuong(transId, comment);
    case "lien":
      return await checkLien(transId, comment);
    case "motdoi":
      return await check1Doi(transId, comment);
    default:
      return await checkOther(transId, comment);
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
    const apiUrl = "https://momosv3.apimienphi.com/api/getMomoInfo";
    const setting = await getSetting();
    const access_token = setting.dataValues.accessToken;
    const listPhone = await axios.post(apiUrl, { access_token });
    let data = await Promise.all(
      listPhone.data.data.map(async (phone) => {
        return {
          phone: phone.phone,
          balance: phone.balance,
          countToday: await countToday(phone.phone, 'send'),
          countMonth: await totalMonth(phone.phone, 'send'),
        }
      }))
    data = data.length > 0 ? data : null
    return data.filter((phone) => phone !== null);
  } catch (error) {
    console.log(error);
  }
};

/**
 * Check limit phone and swap phone  
 */
const checkLimit = async (money) => {
  const listPhone = await getListPhone();
  const data = listPhone.filter(item => {
    const { balance, countToday, countMonth } = item;
    return balance >= money
      && countToday.totalCount < 140
      && countToday.totalAmount < 40000000
      && countMonth < 80000000
  }
  );

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
  const setting = await getSetting();
  return price < setting.minPlay || price > setting.maxPlay ? true : false;
};


const getTransUnReward = async () => {
  const data = await TransactionHistory.findAll({
    where: {
      type: "unreward"
    },
  });
  return data.map(item => item.dataValues)
}

const checkTranId = async (tranId) => {
  const apiUrl = 'https://momosv3.apimienphi.com/api/checkTranId'
  const setting = await getSetting();
  const access_token = setting.dataValues.accessToken;
  const data = {
    access_token,
    tranId
  }
  const res = await axios.post(apiUrl, data)


  return res.data.data && moment(res.data.data.clientTime).format("YYYY-MM-DD") == getCurrentDate() ? true : false
}


const getDataTranId = async (tranId) => {
  const apiUrl = 'https://momosv3.apimienphi.com/api/checkTranId'
  const setting = await getSetting();
  const access_token = setting.dataValues.accessToken;
  const data = {
    access_token,
    tranId
  }

  const res = await axios.post(apiUrl, data)
  return res.data.data
}

const handelRefund = async (tranId) => {
  try {
    const data = await getDataTranId(tranId)
    const limit = await checkLimit(data.amount)
    const apiUrl = "https://momosv3.apimienphi.com/api/sendMoneyMomo";
    if (limit) {
      saveHistory({
        receivingPhone: data.partnerId,
        transferPhone: limit.phone,
        tradingCode: tranId,
        type: "refund",
        amount: data.amount,
        comment: `${tranId} | Refund`,
      })
      const setting = await getSetting();
      const access_token = setting.dataValues.accessToken;
      const dataSend = {
        access_token,
        phone: limit.phone,
        phoneto: data.partnerId,
        amount: data.amount,
        note: `${tranId} | Refund`,
      };
      axios.post(apiUrl, dataSend)
    }
  } catch (error) {
    console.log(error);
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
    const result = await checkResult(typeContent, item.tradingCode, comment);
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
  const apiUrl = "https://momosv3.apimienphi.com/api/sendMoneyMomo";
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
          const setting = await getSetting();
          const access_token = setting.dataValues.accessToken;
          const dataSend = {
            access_token,
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



const checkPhoneRegMomo = async (phone) => {
  const apiUrl = "https://momosv3.apimienphi.com/api/checkMomoUser";
  const setting = await getSetting();
  const access_token = setting.dataValues.accessToken;
  const data = {
    access_token,
    phone
  }
  const res = await axios.post(apiUrl, data)
  return res.data.error === 0 ? true : false
}

/** 
 * Get total send month
 */
const totalMonth = async (phone, type) => {
  const data = await TransactionHistory.findAll({
    attributes: [[Sequelize.fn("sum", Sequelize.col("amount")), "totalAmount"]],
    where: {
      [Sequelize.Op.and]: [
        {
          [Sequelize.Op.and]: Sequelize.where(
            Sequelize.fn("month", Sequelize.col("createdAt")),
            getCurrentMonth()
          ),
          type: type === 'send' ? ["reward", "point", 'refund'] : ["win", "lose"],
          [type === 'send' ? 'transferPhone' : 'receivingPhone']: phone
        },

      ]
    }
  })
  return data[0].dataValues.totalAmount || 0;
}

/**
 * Count send day
 */
const countToday = async (phone, type) => {
  const data = await TransactionHistory.findAll({
    attributes: [
      [Sequelize.fn("sum", Sequelize.col("amount")), "totalAmount"],
      [Sequelize.fn("count", Sequelize.col("id")), "totalCount"]],
    where: {
      [Sequelize.Op.and]: Sequelize.where(
        Sequelize.fn("date", Sequelize.col("createdAt")),
        getCurrentDate()
      ),
      type: type === 'send' ? ["reward", "point", 'refund'] : ["win", "lose"],
      [type === 'send' ? 'transferPhone' : 'receivingPhone']: phone
    }
  })
  return data[0].dataValues
}

/**
 * Reward introduce
 */
const rewardIntroduce = async (phone) => {

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
  phones?.forEach(async (phone) => {
    arrPhones.push(phone.phone);
  })

  const arrPhoneNotInData = phones?.filter(phone => !arrPhoneInData.includes(phone.phone));

  const arrPhoneNotInApi = arrPhoneInData.filter(phone => !arrPhones.includes(phone));
  if (arrPhoneNotInApi.length > 0) {
    arrPhoneNotInApi.forEach(async (phone) => {
      await Phone.destroy({
        where: {
          phone: phone
        }
      })
    })
  }
  if (arrPhoneNotInData.length > 0)
    return arrPhoneNotInData.forEach(async (phone) => {
      const countDay = await countToday(phone.phone, 'send');
      const receiveTody = await countToday(phone.phone, 'receive');
      return Phone.create({
        phone: phone.phone,
        amount: phone.balance,
        countSendDay: countDay.totalCount || 0,
        countReceiveDay: receiveTody.totalCount || 0,
        totalSendDay: countDay.totalAmount || 0,
        totalReceiveDay: receiveTody.totalAmount || 0,
        totalSendMonth: 0,
        totalReceiveMonth: 0,
      })
    })

  return phones.forEach(async (phone) => {
    const countDay = await countToday(phone.phone, 'send');
    const receiveTody = await countToday(phone.phone, 'receive');
    return Phone.update({
      amount: phone.balance,
      countSendDay: countDay.totalCount || 0,
      countReceiveDay: receiveTody.totalCount || 0,
      totalSendDay: countDay.totalAmount || 0,
      totalReceiveDay: receiveTody.totalAmount || 0,
      totalSendMonth: await totalMonth((phone.phone).toString(), 'send'),
      totalReceiveMonth: await totalMonth((phone.phone).toString(), 'receive'),
    },
      {
        where: {
          phone: phone.phone
        }
      })
  })
}

const getGame = async () => {
  const data = await GameModel.findOne({
    attributes: [`chanle`, `chanle2`, `taixiu`, `gap3`, `tong3so`, `motphan3`, `xien`, `doanso`, `amduong`, `lien`, `motdoi`]
  });
  return data;
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
  getTransUnReward,
  checkTranId,
  getDataTranId,
  handelRefund,
  getTranNotReward,
  checkPhonePointListToday,
  checkPhoneRegMomo,
  getListPhone,
  totalMonth,
  countToday,
  updatePhones,
  getSetting,
  getGame
};
