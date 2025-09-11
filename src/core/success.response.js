"use strict";

const StatusCode = {
  OK: 200,
  CREATED: 201,
};

const ReasonStatusCode = {
  CREATED: "Created!",
  OK: "Success",
};

class SuccessResponse {
  constructor({
    message,
    statusCode = StatusCode.OK,
    reasonStatusCode = ReasonStatusCode.OK,
    metadata = {},
  }) {
    this.message = !message ? reasonStatusCode : message;
    this.status = statusCode; // `status` sẽ được dùng bởi res.status()
    this.metadata = metadata; // Dữ liệu thực tế trả về
  }

  send(res, headers = {}) {
    // Phương thức này sẽ tự động gửi response
    // `this` chính là toàn bộ object SuccessResponse (message, status, metadata)
    return res.status(this.status).json(this);
  }
}

// Lớp cho response 200 OK
class OK extends SuccessResponse {
  constructor({ message, metadata }) {
    // Gọi constructor của lớp cha với statusCode mặc định là 200
    super({ message, metadata });
  }
}

// Lớp cho response 201 Created
class CREATED extends SuccessResponse {
  constructor({
    message,
    statusCode = StatusCode.CREATED,
    reasonStatusCode = ReasonStatusCode.CREATED,
    metadata,
    options = {}, // Tùy chọn thêm nếu cần
  }) {
    super({ message, statusCode, reasonStatusCode, metadata });
    this.options = options;
  }
}

module.exports = {
  OK,
  CREATED,
  SuccessResponse,
};
