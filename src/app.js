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
app.use(helmet());
app.use(compression());

// * init db

// * init routes
app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello World!",
  });
});

// * handling error

module.exports = app;
