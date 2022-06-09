'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Setting.init({
    maintenance: DataTypes.STRING,
    notification: DataTypes.TEXT,
    minPlay: DataTypes.INTEGER,
    maxPlay: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Setting',
  });
  return Setting;
};