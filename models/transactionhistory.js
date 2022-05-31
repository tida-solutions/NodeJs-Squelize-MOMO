"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TransactionHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TransactionHistory.init(
    {
      receivingPhone: DataTypes.STRING,
      transferPhone: DataTypes.STRING,
      tradingCode: DataTypes.STRING,
      amount: DataTypes.INTEGER,
      comment: DataTypes.STRING,
      transferTime: DataTypes.DATE,
      type: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "TransactionHistory",
    }
  );
  return TransactionHistory;
};
