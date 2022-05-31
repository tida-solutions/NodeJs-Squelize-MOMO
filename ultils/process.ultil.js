var Sequelize = require("sequelize");
const Promise = require("bluebird");
const { getCurrentDate } = require("../ultils/date.ultil");
const games = require("../games.json");

const TransactionHistory = require("../models/index").TransactionHistory;
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
        const apiUrl = "https://congthanhtoanmomo.xyz/api/sendMoneyMomo";
        const dataSend = {
          access_token: process.env.ACCESS_TOKEN,
          phone: limit.phone,
          phoneto: reciever,
          amount: amount * ratio,
          note: `Thắng: ${transId} | ${comment}`,
        };
        //  await axios.post(apiUrl, dataSend);
        saveHistory({
          receivingPhone: reciever,
          transferPhone: limit.phone,
          tradingCode: transId,
          type: "reward",
          amount: amount * ratio,
          comment: dataSend.note,
        });
        console.log("Reward success ");
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
      type: "reward",
    },
  });
  return result ? true : false;
};

/**
 * Save history
 */
const saveHistory = (data) => {
  TransactionHistory.create(data);
};

const checkLimit = async (money) => {
  const apiUrl = "https://congthanhtoanmomo.xyz/api/getMomoInfo";
  const access_token = process.env.ACCESS_TOKEN;
  const listPhone = await axios.post(apiUrl, { access_token });
  const data = listPhone.data.data;

  const arr = Promise.all(
    data.map(async (item) => {
      const dataQuery = await TransactionHistory.findAll({
        attributes: [
          [Sequelize.fn("count", Sequelize.col("id")), "count"],
          [Sequelize.fn("sum", Sequelize.col("amount")), "totalAmount"],
        ],
        where: {
          type: "reward",
          createdAt: {
            [Sequelize.Op.between]: [getCurrentDate(), `${getCurrentDate()}`],
          },
          transferPhone: item.phone,
        },
      });
      const { count, totalAmount } = dataQuery[0].dataValues;
      return {
        phone: item.phone,
        count,
        totalAmount: totalAmount || 0,
        balance: item.balance,
      };
    })
  );

  const end = (await arr).filter(
    (item) =>
      item.count < 140 && item.totalAmount < 400000000 && item.balance >= money
  );

  end.sort((a, b) => {
    return a.balance - b.balance;
  });
  return end.length > 0 ? end[0] : false;
};

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
 * get all phone from api
 */
const getAllPhone = async () => {
  const apiUrl = "https://congthanhtoanmomo.xyz/api/getMomoInfo";
  const access_token = process.env.ACCESS_TOKEN;
  const listPhone = await axios.post(apiUrl, { access_token });
  const data = listPhone.data.data.map((item) => {
    return item.phone;
  });
  return data;
};

/**
 * Check limite price
 */
const limitPrice = (price) => {
  return price < 5000 || price > 1000000 ? true : false;
};

module.exports = {
  checkTypeContent,
  checkResult,
  sendReward,
  checkReward,
  saveHistory,
  checkLimit,
  isSaveHistory,
  getAllPhone,
  limitPrice,
};
