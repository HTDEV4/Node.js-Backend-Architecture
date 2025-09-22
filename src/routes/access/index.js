"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const router = express.Router();

// * ====> Route SignUp
router.post("/shop/signup", asyncHandler(accessController.signUp));
// * ====> Route Login
router.post("/shop/login", asyncHandler(accessController.login));

module.exports = router;
