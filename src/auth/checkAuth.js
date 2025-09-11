"use strict";

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
};

const { findById } = require("../services/apikey.service");

// * ====> Middleware check apiKey
const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key) {
      return res.status(403).json({
        message: "Forbidden Error",
      });
    }

    // * ====> Check objectKey
    const objKey = await findById(key);
    if (!objKey) {
      return res.status(403).json({
        message: "Forbidden Error",
      });
    }

    req.objKey = objKey;
    return next();
  } catch (error) {
    next(error);
  }
};

// * ====> Middleware check permission
const permission = (permission) => {
  // Trình bao đóng JS (Closure)
  return (req, res, next) => {
    if (!req.objKey.permissions) {
      return res.status(403).json({
        message: "Permissions denied",
      });
    }

    console.log("permissions::", req.objKey.permissions);
    const validPermission = req.objKey.permissions.includes(permission);
    if (!validPermission) {
      return res.status(403).json({
        message: "Permissions denied",
      });
    }

    return next();
  };
};

module.exports = {
  apiKey,
  permission,
};
