const moment = require("moment");

const getCurrentTime = () => {
  return moment().format("YYYY-MM-DD HH:mm:ss")
}


console.log(getCurrentTime());
/**
 * Get current date
 */
const getCurrentDate = () => {
  return moment().format("YYYY-MM-DD");
};

const getCurrentMonth = () => {
  return moment().format("MM-YYYY");
};


module.exports = {
  getCurrentTime,
  getCurrentMonth,
  getCurrentDate
};
 