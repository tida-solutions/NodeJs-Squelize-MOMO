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
    title: DataTypes.TEXT,
    description: DataTypes.TEXT,
    logo: DataTypes.STRING,
    maintenance: DataTypes.STRING,
    notification: DataTypes.TEXT,
    minPlay: DataTypes.INTEGER,
    maxPlay: DataTypes.INTEGER,
    accessToken: DataTypes.STRING,
    signature: DataTypes.STRING,
    boxChat: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Setting',
  });

  return Setting;
};