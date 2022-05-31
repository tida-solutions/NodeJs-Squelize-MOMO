const TransactionHistory = require("../models/index").TransactionHistory;
const { getCurrentDate } = require("../ultils/date.ultil");
const Sequelize = require("sequelize");
const {
  saveHistory,
  isSaveHistory,
  checkLimit,
} = require("../ultils/process.ultil");
/**
 * Check transaction fail
 */
const checkTransFalse = async (req, res) => {
  const { code } = req.body;
  try {
    const checkFalse = await checkCodeToday("false", code);
    const checkWin = await checkCodeToday("win", code);
    const checkReward = await checkCodeToday("reward", code);
    const getDataCode = await getDataCode(code);

    if ((checkFalse && !checkReward) || (checkWin && !checkReward)) {
      const limit = await checkLimit(getDataCode.amount);
      if (limit) {
      }

      return res.json({
        status: true,
        msg: "Hoàn tiền thành công",
      });
    }
    return res.json({
      status: false,
      msg: "Mã giao dịch không hợp lệ",
    });
  } catch (error) {
    return res.json({
      status: false,
      msg: "Có lỗi xảy ra, vui lòng thử lại sau",
    });
  }
};

const checkCodeToday = async (type, code) => {
  const data = await TransactionHistory.findOne({
    where: {
      [Sequelize.Op.and]: [
        {
          [Sequelize.Op.and]: Sequelize.where(
            Sequelize.fn("date", Sequelize.col("createdAt")),
            getCurrentDate()
          ),
        },
        {
          tradingCode: code,
          type,
        },
      ],
    },
  });
  return data ? true : false;
};

const getDataCode = async (code) => {
  const data = await TransactionHistory.findOne({
    where: {
      tradingCode: code,
      type: {
        [Sequelize.Op.or]: ["false", "win"],
      },
      [Sequelize.Op.and]: Sequelize.where(
        Sequelize.fn("date", Sequelize.col("createdAt")),
        //
        "2022-05-29"
      ),
    },
  });
  return data;
};

const handelRefund = async (code) => {
  const dataCode = await getDataCode(code);
  const checkSave = await isSaveHistory(dataCode.tradingCode, "reward");
  if (!checkSave) {
    
  }
};

module.exports = {
  checkTransFalse,
};
