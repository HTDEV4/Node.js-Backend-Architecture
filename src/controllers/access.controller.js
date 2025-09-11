"use strict";

const { CREATED } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  signUp = async (req, res, next) => {
    try {
      // * 1. Gọi service để xử lý nghiệp vụ
      const result = await AccessService.signUp(req.body);

      // * 2. Dùng class CREATED để đóng gói và gửi response
      new CREATED({
        message: "Registered OK!",
        metadata: result,
      }).send(res);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AccessController();
