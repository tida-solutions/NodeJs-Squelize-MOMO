const { Sequelize } = require('sequelize');
const moment = require("moment")
const { getSetting,getGame } = require("../ultils/process.ultil");

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    timezone: "+07:00",
})

// const getSetting = await Setting.findOne({
//     attributes: ['title'],
//   })
//   if (!getSetting) {
//     sequelize.query(`INSERT INTO Settings(title,createdAt,updatedAt) VALUES ("1","${moment().format("YYYY-MM-DD HH:mm:ss")}","${moment().format("YYYY-MM-DD HH:mm:ss")}")`).then(data => {
//       console.log(data);
//     })
//   } 

getSetting().then(data => {
    if (!data) {
        sequelize.query(`INSERT INTO Settings(title,createdAt,updatedAt) VALUES ("1","${moment().format("YYYY-MM-DD HH:mm:ss")}","${moment().format("YYYY-MM-DD HH:mm:ss")}")`).then(data => {
            console.log(data);
        })
    }
})

getGame().then(data => {
    if (!data) {
        sequelize.query(`INSERT INTO Games(chanle,createdAt,updatedAt) VALUES ("1","${moment().format("YYYY-MM-DD HH:mm:ss")}","${moment().format("YYYY-MM-DD HH:mm:ss")}")`).then(data => {
            console.log(data);
        })
    }
}) 

// sequelize.query('SELECT * FROM Settings').then(data => {
//     console.log(data[0]);
//   //  if (!data[0]) {
//         console.log(1);
//         sequelize.query(`INSERT INTO Settings(title,createdAt,updatedAt) VALUES ("1","${moment().format("YYYY-MM-DD HH:mm:ss")}","${moment().format("YYYY-MM-DD HH:mm:ss")}")`).then(data => {
//             console.log(data);
//         }) 
//    // }  
//     console.log(2);
// })

const connect = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

module.exports = connect;     