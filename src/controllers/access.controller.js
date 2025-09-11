"use strict";

const AccessService = require("../services/access.service");

class AccessController {
  signUp = async (req, res, next) => {
    try {
      console.log(`[P]::signUp::`, req.body);
      /**
       * 200 OK
       * 201 CREATED
       */
      return res.status(201).json(await AccessService.signUp(req.body));
    } catch (error) {
      // Chuyển lỗi cho middleware xử lý lỗi tổng (app.js)
      next(error);
    }
  };
}

module.exports = new AccessController();
