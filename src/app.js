require("dotenv").config();
const compression = require("compression");
const express = require("express");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const app = express();

// * init middlewares
app.use(morgan("dev"));
// morgan("combined"); // Mode này giành cho product nó sẽ hiển thị ping người dùng - ngày tháng - phương thức (GET, ...) - .... - curl (trình duyệt đang chạy: GG, FireFox, ...)
// morgan("common"); // y như combined nma nó kh có curl
// morgan("short"); // cũng y như combined nhưng mà nó ngắn hơn nhiều
// morgan("tiny"); // Ngắn hơn short luôn
app.use(helmet()); // Đội mũ bảo hiểm cho HEADER, giúp tăng bảo mật
app.use(compression()); // Tốt cho hiệu năng, giúp giảm kích thước response trả về cho client.
app.use(express.json()); // Giúp Express hiểu được body của request nếu nó ở định dạng JSON.
app.use(express.urlencoded({ extended: true })); // Giúp Express hiểu được body của request từ các form HTML.

// * init db
require("./dbs/init.mongodb");
const { checkOverload } = require("./helpers/check.connect");
checkOverload();
// * init routes
app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello World!",
  });
});

// * handling error

module.exports = app;
