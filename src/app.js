require("dotenv").config();
const compression = require("compression");
const express = require("express");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const { rateLimit } = require("express-rate-limit");

const app = express();

// * ====> Init middlewares
app.use(morgan("dev"));
app.use(helmet()); // Tăng cường bảo mật cho các header của HTTP response.
app.use(compression()); // Giảm kích thước response, tăng tốc độ tải.

// Body parser middlewares - cần đặt trước routes
app.use(express.json({ limit: "10kb" })); // Giới hạn payload JSON là 10kb
app.use(express.urlencoded({ extended: true }));

// * ====> Security middlewares
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
app.use(limiter);

// * ====> Init db
require("./dbs/init.mongodb");
const { checkOverload } = require("./helpers/check.connect");
checkOverload();

// * ====> Init routes
app.use("/", require("./routes"));

// * ====> Handling error
// Middleware bắt lỗi 404
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// Middleware xử lý lỗi tổng
app.use((error, req, res, next) => {
  // 500 là lỗi của server
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: error.message || "Internal Server Error",
  });
});

module.exports = app;
