const moment = require("moment");

/**
 * Get current date
 */
const getCurrentDate = () => {
  const today = new Date();
  return moment(today,'YYYY MM DD').format("YYYY-MM-DD");
};

const getCurrentMonth = () => {
  const today = new Date();
  return moment(today.toDateString()).format("MM-YYYY");
};

module.exports = {
  getCurrentDate,
  getCurrentMonth,
};
  