const cron = require("node-cron");
const axios = require("axios");
var Sequelize = require("sequelize");
const Promise = require("bluebird");
const { getTransUnReward, checkLimit, getTranNotReward, checkPhonePointListToday } = require("./ultils/process.ultil");
const TransactionHistory = require("./models/index").TransactionHistory;

/**
 * Cron job
 */
cron.schedule("*/3 * * * * *", async () => {
  try {
    const data = await getTransUnReward();
    const apiUrl = "https://momosv3.apimienphi.com/api/sendMoneyMomo";
    data.forEach((item, index) => {
      setTimeout(async () => {
        const limit = await checkLimit(item.amount);
        if (limit) {
          TransactionHistory.update(
            {
              transferPhone: limit.phone,
              type: "reward",
            },
            {
              where: {
                id: item.id,
                type: 'unreward'
              }
            }
          )
          const dataSend = {
            access_token: process.env.ACCESS_TOKEN,
            phone: limit.phone,
            phoneto: item.receivingPhone,
            amount: item.amount,
            note: item.comment,
          };
          axios.post(apiUrl, dataSend)
          console.log('reward success');
        }
      }, 1000 * index);
    });
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
