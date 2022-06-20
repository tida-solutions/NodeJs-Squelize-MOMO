const BlockPhone = require("../models/index").BlockPhone;
const { validationResult } = require("express-validator");

const list = async (req, res) => {
    const list = await BlockPhone.findAll({
        where: {
            isDeleted: false,
        },
        order:[[
            "id",
            "DESC"
        ]]
    });
    res.render("admin/block_phone", {
        list,
        csrfToken: req.csrfToken(),
    });
};

const get = async (req, res) => {
    try {
        const data = await BlockPhone.findOne({
            where: {
                id: req.params.id,
                isDeleted: false,
            },
        });
        return res.json({
            status: true,
            data,
        });
    } catch (error) {
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

/**
 * Create
 */
const create = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({
                status: false,
                errors: errors.array(),
            });
        }
        const data = req.body;
        await BlockPhone.create(data);
        return res.json({
            status: true,
            msg: "Create successfully",
        });
    } catch (error) {
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

/**
 * Update
 */
const update = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({
                status: false,
                errors: errors.array(),
            });
        }
        const data = req.body;

        await BlockPhone.update(data, {
            where: {
                id: req.params.id,
            },
        });
        return res.json({
            status: true,
            msg: "Update successfully",
        });
    } catch (error) {
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

const remove = async (req, res) => {
    try {
        const data = {
            isDeleted: true,
        };
        await BlockPhone.update(data, {
            where: {
                id: req.params.id,
            },
        });
        return res.json({
            status: true,
            msg: "Remove successfully",
        });
    } catch (error) {
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
    list,
    get,
    create,
    update,
    remove,
};
