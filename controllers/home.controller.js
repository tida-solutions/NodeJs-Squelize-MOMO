const TransactionHistory = require("../models/index").TransactionHistory;
const Top = require("../models/index").Top;
const Phone = require("../models/index").Phone;
const { getCurrentDate } = require("../ultils/date.ultil");
const Sequelize = require("sequelize");
const {
  saveHistory,
  isSaveHistory,
  checkTypeContent,
  checkResult,
  limitPrice,
  sendReward,
  checkTranId,
  handelRefund,
  getDataTranId
} = require("../ultils/process.ultil");
const moment = require("moment");
const games = require('../games.json')
const Setting = require("../models/index").Setting;
const PointList = require("../models/index").PointList;


/**
 * Check transaction fail
 */
const checkTransFalse = async (req, res) => {
  const { code } = req.body;
  try {
    const checkId = await checkTranId(code);
    if (checkId) {
      const checkreward = await checkCodeToday("reward", code);
      const checkWin = await checkCodeToday("win", code);
      const checkFalse = await checkCodeToday("false", code);
      const checkRefund = await checkCodeToday("refund", code);
      const dataTranId = await getDataTranId(code);
      const dataComent = (dataTranId.comment).toLowerCase()
      const checkCount = await checkCountRefund(code);
      if (checkWin && !checkreward) {
        const typeContent = checkTypeContent(dataComent);
        const result = checkResult(typeContent, code, dataComent);
        sendReward({
          transId: code,
          reciever: dataTranId.partnerId,
          amount: Number(dataTranId.amount),
          ratio: result,
          comment: dataTranId.comment,
        });
        return res.json({
          status: true,
          msg: "Trả thưởng thành công",
        })
      }

      if (checkFalse && !checkRefund) {
        if (Number(checkCount) >= 5) {
          console.log(1);
          return res.json({
            status: false,
            msg: "Bạn đã hết lượt hoàn tiền"
          })
        }
        handelRefund(code)
        return res.json({
          status: true,
          msg: "Hoàn tiền thành công",
        })
      }
      else {
        return res.json({
          status: false,
          msg: "Mã giao dịch không hợp lệ"
        })
      }
    }
    return res.json({
      status: false,
      msg: "Mã giao dịch không hợp lệ"
    })
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      msg: "Có lỗi xảy ra, vui lòng thử lại sau",
    });
  }
};

/**
 * Check count refund
 */
const checkCountRefund = async (transId) => {
  const data = await getDataTranId(transId);
  const { count } = await TransactionHistory.findAndCountAll({
    where: {
      [Sequelize.Op.and]: [
        {
          [Sequelize.Op.and]: Sequelize.where(
            Sequelize.fn("date", Sequelize.col("createdAt")),
            getCurrentDate()
          ),
        },
        {
          receivingPhone: data.partnerId,
          type: 'refund',
        },
      ],
    }
  })
  return count
}

/**
 * Check code today
 */
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

/**
 * Get list top
 */
const getTops = async () => {
  const data = await Top.findAll({
    where: {
      isDeleted: false
    }
  })
  return data.map(item => item.dataValues)
}

/**
 * Get list history win
 */
const getHistoryWin = async (req, res) => {
  const data = await TransactionHistory.findAll({
    where: {
      type: 'win'
    },
    limit: 10,
    order: [
      ['id', 'DESC']
    ]
  })
  const end = data.map(item => {
    const comment = item.comment.toLowerCase();
    const checkType = checkTypeContent(comment)
    const result = checkResult(checkType, item.tradingCode, comment)
    return {
      transferPhone: item.transferPhone,
      amount: item.amount,
      amountReceive: item.amount * result,
      gameName: games.filter(game => checkType === game.name)[0].nameDefault,
      comment: item.comment,
    }
  })
  return res.json({
    status: true,
    data: end
  })
}

/**
 * Show history win
*/
const historyWin = async () => {
  const data = await TransactionHistory.findAll({
    where: {
      type: 'win'
    },
    limit: 10,
    order: [
      ['id', 'DESC']
    ]
  })
  const end = data.map(item => {
    const comment = item.comment.toLowerCase();
    const checkType = checkTypeContent(comment)
    const result = checkResult(checkType, item.tradingCode, comment)
    return {
      transferPhone: item.transferPhone,
      amount: item.amount,
      amountReceive: item.amount * result,
      gameName: games.filter(game => checkType === game.name)[0].nameDefault,
      comment: item.comment,
    }
  })
  return end
}

/**
 * View Home
 */
const viewHome = async (req, res) => {
  const setting = await Setting.findOne({
    where: {
      id: 1
    }
  });
  res.render("home/index", {
    top: await getTops(),
    phones: await Phone.findAll({ where: { isShow: true } }),
    historyWin: await historyWin(),
    csrfToken: req.csrfToken(),
    setting
  });
};

/** 
 * Receiver from hook
 */
const hook = async (req, res) => {

  const signatureApi = process.env.SIGNATURE;

  let {
    signature,
    phone,
    tranId,
    ackTime,
    partnerId,
    partnerName,
    amount,
    comment,
  } = req.body;
  const setting = await Setting.findOne({
    where: {
      id: 1
    }
  })
  // if (setting.maintenance == 'on') {
    if (signature && signature === signatureApi) {
      comment = comment.trim().toLowerCase();
      const typeContent = checkTypeContent(comment);
      const result = checkResult(typeContent, tranId, comment);
      const checkLimitPrice = await limitPrice(amount);
      if (checkLimitPrice) {
        if (!(await isSaveHistory(tranId, "false"))) {
          saveHistory({
            receivingPhone: phone,
            transferPhone: partnerId,
            tradingCode: tranId,
            type: "false",
            amount,
            comment,
            transferTime: moment.unix(ackTime).format('YYYY-MM-DD HH:mm:ss'),
          });
        }
        return res.status(200).json({
          msg: "success",
        });
      } else {
        if (result) {
          if (!(await isSaveHistory(tranId, "win"))) {
            saveHistory({
              receivingPhone: phone,
              transferPhone: partnerId,
              tradingCode: tranId,
              type: "win",
              amount,
              comment,
              transferTime: moment.unix(ackTime).format('YYYY-MM-DD HH:mm:ss'),
            });
          }
          sendReward({
            transId: tranId,
            reciever: partnerId,
            amount,
            ratio: Number(result),
            comment,
          });
          return res.status(200).json({
            msg: "success",
          });
        } else {
          if (typeContent === "other") {
            if (!(await isSaveHistory(tranId, "false"))) {
              saveHistory({
                receivingPhone: phone,
                transferPhone: partnerId,
                tradingCode: tranId,
                type: "false",
                amount,
                comment,
                transferTime: moment.unix(ackTime).format('YYYY-MM-DD HH:mm:ss'),
              });
            }
            return res.status(200).json({
              msg: "success",
            });
          } else {
            if (!(await isSaveHistory(tranId, "lose"))) {
              saveHistory({
                receivingPhone: phone,
                transferPhone: partnerId,
                tradingCode: tranId,
                type: "lose",
                amount,
                comment,
                transferTime: moment.unix(ackTime).format('YYYY-MM-DD HH:mm:ss'),
              });
            }
            return res.status(200).json({
              msg: "success",
            }); 
          }
        }
      };
    }
    return res.status(200).json({
      msg: "unauthorized",
    });
 // } 
};

/**
 * Point list a day
 */
const pointList = async (req, res) => {
  const { phone } = req.body;
  const checkPhone = await checkPhonePointList(phone);
  if (checkPhone) {
    return res.json({
      status: false,
      msg: "Hôm nay bạn đã điểm danh"
    })
  }

  PointList.create({
    phone
  })
  return res.json({
    status: true,
    msg: "Điểm danh thành công"
  })

}

/**
 * Check point list today
 */
const checkPhonePointList = async (phone) => {
  const checkPhone = await PointList.findOne({
    where: {
      [Sequelize.Op.and]: [
        {
          [Sequelize.Op.and]: Sequelize.where(
            Sequelize.fn("date", Sequelize.col("createdAt")),
            getCurrentDate()
          ),
        },
        {
          phone,
        },
      ],
    }
  })
  return checkPhone ? true : false;
}


module.exports = {
  checkTransFalse,
  viewHome,
  hook,
  getHistoryWin,
  pointList
};
