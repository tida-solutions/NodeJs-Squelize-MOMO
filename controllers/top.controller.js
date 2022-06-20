const Top = require("../models/index").Top;
const { getCurrentDate } = require("../ultils/date.ultil");
const { validationResult } = require("express-validator");

const list = async (req, res) => {
  const list = await Top.findAll({
    where: {
      isDeleted: false,
    },
  });
  res.render("admin/top", {
    list,
    csrfToken: req.csrfToken(),
  });
};

const get = async (req, res) => {
  try {
    const data = await Top.findOne({
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
    await Top.create(data);
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

    await Top.update(data, {
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
      deletedAt: getCurrentDate(),
    };
    await Top.update(data, {
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
