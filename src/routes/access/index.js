"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const router = express.Router();

// * ====> Route SignUp
router.post("/shop/signup", asyncHandler(accessController.signUp));

module.exports = router;
