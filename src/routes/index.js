"use strict";

const express = require("express");
const { apiKey, permission } = require("../auth/checkAuth");
const router = express.Router();

// * ====> Check apiKey
router.use(apiKey);

// * ====> Check permission
router.use(permission("0000"));

// * ====> Route Tổng
router.use("/v1/api/", require("./access"));
// router.use("/v1/api/product", require("./product"));

module.exports = router;
