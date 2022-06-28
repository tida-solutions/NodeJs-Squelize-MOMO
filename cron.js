const cron = require("node-cron");
const axios = require("axios");
var Sequelize = require("sequelize");
const Promise = require("bluebird");
const { getTransUnReward, checkLimit, getTranNotReward, checkPhonePointListToday, getSetting } = require("./ultils/process.ultil");
const TransactionHistory = require("./models/index").TransactionHistory;


/**
 * Cron job
 */
cron.schedule("*/3 * * * * *", async () => {
  try {
    return getTransUnReward().then(data => data.map((data, index) => {
      setTimeout(() => {
        checkLimit(data.amount).then(data1 => {
          if (data1) {
            getSetting().then(data3 => {
              const dataSend = {
                access_token: data3.dataValues.accessToken,
                phone: data1.phone,
                phoneto: data.receivingPhone,
                amount: data.amount,
                note: data.comment,
              };
              const apiUrl = "https://momosv3.apimienphi.com/api/sendMoneyMomo";
              axios.post(apiUrl, dataSend).then(data2 => {
                if (data2.data.error === 0) {
                  TransactionHistory.update(
                    {
                      transferPhone: data1.phone,
                      type: "reward",
                    },
                    {
                      where: {
                        id: data.id,
                        type: 'unreward'
                      }
                    }
                  )
                  return console.log(`Reward ${data.comment} success`);
                }
                else {
                  return console.log(`Reward ${data.comment} fail`);
                }
              })
            })
          }
        });
      }, 1000 * index);
    }))
    // const data = await getTransUnReward();
    // const apiUrl = "https://momosv3.apimienphi.com/api/sendMoneyMomo";
    // data.forEach((item, index) => {
    //   setTimeout(async () => {
    //     const limit = await checkLimit(item.amount);
    //     if (limit) {
    //       TransactionHistory.update(
    //         {
    //           transferPhone: limit.phone,
    //           type: "reward",
    //         },
    //         {
    //           where: {
    //             id: item.id,
    //             type: 'unreward'
    //           }
    //         }
    //       )
    //       const dataSend = {
    //         access_token: process.env.ACCESS_TOKEN,
    //         phone: limit.phone,
    //         phoneto: item.receivingPhone,
    //         amount: item.amount,
    //         note: item.comment,
    //       };
    //       const res = await axios.post(apiUrl, dataSend)
    //       if (res.data.error === 0)
    //         return console.log(`Reward ${item.comment} success`);
    //       return console.log(`Reward ${item.comment} fail`);
    //     }
    //   }, 1500 * index);
    // });
  } catch (error) {
    console.log(error);
    console.log("Cron job error");
  }
});

cron.schedule("*/10 * * * * *", async () => {
  getTranNotReward()
})

cron.schedule("*/3 * * * * *", async () => {
  checkPhonePointListToday()
})

module.exports = cron;
