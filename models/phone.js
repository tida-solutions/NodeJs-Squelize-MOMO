'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Phone extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Phone.init({
    phone: DataTypes.STRING,
    amount: DataTypes.STRING,
    countSendDay: DataTypes.STRING,
    countReceiveDay: DataTypes.STRING,
    totalSendDay: DataTypes.STRING,
    totalReceiveDay: DataTypes.STRING,
    totalSendMonth: DataTypes.STRING,
    totalReceiveMonth: DataTypes.STRING,
    isShow: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Phone',
  });
  return Phone;
};