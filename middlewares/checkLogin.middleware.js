const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
    let token = null
    try {
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token
        }
        const authorization = jwt.verify(token, process.env.JWT_SECRET)
        if (authorization) {
            next()
        }
        else {
           res.redirect('/admin/signin')
        }
    } catch (error) { 
       return res.redirect('/admin/signin')
    }
}