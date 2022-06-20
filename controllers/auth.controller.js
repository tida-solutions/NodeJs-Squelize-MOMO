const { validationResult } = require("express-validator");
const User = require("../models/index").User;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


/**
 * Signin
 */
const signin = async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({
                status: false,
                errors: errors.array(),
            });
        }

        const { email, password } = req.body;

        const user = await User.findOne({
            where: {
                email,
            },
        });
        if (!user) {
            return res.json({
                status: false,
                errors: [
                    {
                        msg: "Email is not exist",
                        param: "error",
                    },
                ],
            });
        }

        const isUser = await bcrypt.compare(password, user.password);
        if (!isUser) {
            return res.json({
                status: false,
                errors: [
                    {
                        msg: "Password is incorrect",
                        param: "error",
                    },
                ],
            });
        } 
        const token = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: "10h",
        });
        return res.json({
            status: true,
            msg: "Signin successfully",
            token,
        });
    } catch (error) {
        console.log(error);
        return res.json({
            status: false,
            errors: [
                {
                    msg: "Something went wrong",
                    param: "error",
                },
            ],
        });
    }
};



module.exports = {
    signin,
}