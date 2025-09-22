"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  login = async (req, res, next) => {
    try {
      new SuccessResponse({
        metadata: await AccessService.login(req.body),
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

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
