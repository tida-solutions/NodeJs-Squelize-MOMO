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
  getDataTranId,
  checkPhoneRegMomo,
  countToday,
  checkLimit,
  getSetting,
  getGame
} = require("../ultils/process.ultil");
const moment = require("moment");
const games = require('../games.json')
const Setting = require("../models/index").Setting;
const PointList = require("../models/index").PointList;
const BlockPhone = require("../models/index").BlockPhone;
const Introduce = require("../models/index").Introduce;
const landmark = require('../landmark.json')

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
        const result = await checkResult(typeContent, code, dataComent);
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
  const end = data.map(async item => {
    const comment = item.comment.toLowerCase();
    const checkType = checkTypeContent(comment)
    const result = await checkResult(checkType, item.tradingCode, comment)
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
  const end = data.map(async item => {
    const comment = item.comment.toLowerCase();
    const checkType = checkTypeContent(comment)
    const result = await checkResult(checkType, item.tradingCode, comment)
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
  const setting = await getSetting();
  const game = await getGame();
  return res.render("home/index", {
    top: await getTops(),
    phones: await Phone.findAll({ where: { isShow: true } }),
    historyWin: await historyWin(),
    csrfToken: req.csrfToken(),
    setting,
    game
  });
};

/** 
 * Receiver from hook
 */
const hook = async (req, res) => {
  const setting = await getSetting()

  const signatureApi = setting.dataValues.signature;

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
  if (setting.dataValues.maintenance === 'false') {
    if (signature && signature === signatureApi) {
      comment = comment.trim().toLowerCase();
      const typeContent = checkTypeContent(comment);
      const result = await checkResult(typeContent, tranId, comment);
      const checkLimitPrice = await limitPrice(amount);
      const listPhoneBlocked = await getListPhoneBlocked();
      if (checkLimitPrice || listPhoneBlocked.includes(partnerId)) {
        if (!(await isSaveHistory(tranId, "false"))) {
          console.log(1);
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
            console.log(2);
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
              console.log(3);
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
              console.log(4);
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
    else {
      return res.status(200).json({
        msg: "unauthorized",
      });
    }
  }
  else {
    return res.status(200).json({
      msg: "maintenance",
    });
  }
};

/**
 * Point list a day
 */
const pointList = async (req, res) => {
  const { phone } = req.body;
  const checkPhone = await checkPhonePointList(phone);
  const checkPhoneIsReg = await checkPhoneRegMomo(phone);

  if (!checkPhoneIsReg) {
    return res.json({
      status: false,
      msg: "Số điện thoại chưa đăng ký momo",
    });
  }

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

/**
 * Get list phone is blocked
 */
const getListPhoneBlocked = async () => {
  const data = await BlockPhone.findAll({
    where: {
      isDeleted: 0
    }
  })

  return data.map(item => item.phone)
}

/**
 * Introduce today
 */
const introduceToday = async (req, res) => {
  const { phoneFriend, phoneUser } = req.body;
  const checkPhoneFriend = await checkPhoneRegMomo(phoneFriend);
  const checkPhoneUser = await checkPhoneRegMomo(phoneUser);

  if (phoneFriend === phoneUser) {
    return res.json({
      status: false,
      msg: "2 số điện thoại phải khác nhau"
    })
  }

  if (!checkPhoneFriend || !checkPhoneUser) {
    return res.json({
      status: false,
      msg: "Số điện thoại của bạn hoặc bạn của bạn chưa đăng ký momo"
    })
  }

  if (await checkPhoneIntroduceToday(phoneUser, 'user')) {
    return res.json({
      status: false,
      msg: `Hôm nay số điện thoại ${phoneUser} đã điểm danh`
    })
  }

  if (await checkPhoneIntroduceToday(phoneFriend, 'friend')) {
    return res.json({
      status: false,
      msg: `Hôm nay số điện thoại ${phoneFriend} đã được người khác nhận thưởng`
    })
  }

  const moneyOfFriend = await countToday(phoneFriend, 'send');
  if (!moneyOfFriend.totalAmount || moneyOfFriend.totalAmount < 1000000) {
    return res.json({
      status: false,
      msg: `Hôm nay số điện thoại ${phoneFriend} chưa đạt mốc thưởng nào`
    })
  }

  const isCheck = landmark.find(item => Number(item.bettween[0]) >= moneyOfFriend.totalAmount && Number(item.bettween[1]) >= moneyOfFriend.totalAmount);
  const limit = await checkLimit(isCheck.gift)
  //if (limit) {
  saveHistory({
    receivingPhone: phoneUser,
    transferPhone: limit.phone,
    tradingCode: null,
    type: "introduce",
    amount: isCheck.gift,
    comment: `Introduce | ${phoneFriend} | ${getCurrentDate()}`,
  })
  Introduce.create({
    phoneFriend,
    phoneUser,
  })
  const dataSend = {
    access_token: process.env.ACCESS_TOKEN,
    phone: limit.phone,
    phoneto: phoneUser,
    amount: isCheck.gift,
    note: `Introduce | ${phoneFriend} | ${getCurrentDate()}`,
  };
  // axios.post(apiUrl, dataSend)
  return res.json({
    status: true,
    msg: `Chúc mừng bạn nhận được ${isCheck.gift} từ ${phoneFriend}`
  })
  // }
}


const checkPhoneIntroduceToday = async (phone, type) => {
  const checkPhone = await Introduce.findOne({
    where: {
      [Sequelize.Op.and]: [
        {
          [Sequelize.Op.and]: Sequelize.where(
            Sequelize.fn("date", Sequelize.col("createdAt")),
            getCurrentDate()
          ),
        },
        {
          [type == 'user' ? 'phoneUser' : 'phoneFriend']: phone,
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
  pointList,
  introduceToday,
};
