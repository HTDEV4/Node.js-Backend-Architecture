"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  handlerRefreshToken = async (req, res, next) => {
    new SuccessResponse({
      message: "Get token success!",
      metadata: await AccessService.handlerRefreshToken(req.body.refreshToken),
    }).send(res);
  };

  logout = async (req, res, next) => {
    new SuccessResponse({
      message: "Logout success!",
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  };

  login = async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.login(req.body),
    }).send(res);
  };

  signUp = async (req, res, next) => {
    // * 1. Gọi service để xử lý nghiệp vụ
    const result = await AccessService.signUp(req.body);

    // * 2. Dùng class CREATED để đóng gói và gửi response
    new CREATED({
      message: "Registered OK!",
      metadata: result,
    }).send(res);
  };
}

module.exports = new AccessController();
