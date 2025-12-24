"use strict";

const mongoose = require("mongoose");
const os = require("os");
const process = require("process");

const _SECONDS = 5000;

/**
 * Đếm số lượng kết nối hiện tại
 */
const countConnect = () => {
  const numConnection = mongoose.connections.length;
  console.log(`[Monitor] Number of connections: ${numConnection}`);
  return numConnection;
};

/**
 * Giám sát quá tải hệ thống (Connection & Memory)
 */
const checkOverload = () => {
  // Trả về interval để có thể quản lý (stop/start)
  return setInterval(() => {
    const numConnection = mongoose.connections.length;
    const numCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;

    // Giả định: Mỗi core chịu được tối đa 5 kết nối (Có thể điều chỉnh lên 50-100 tùy server)
    const maxConnections = numCores * 5;

    // Chuyển đổi RSS sang MB để dễ đọc
    const memoryUsageMB = (memoryUsage / 1024 / 1024).toFixed(2);

    // console.log(`---------- SYSTEM MONITOR ----------`);
    // console.log(`> Active connections: ${numConnection}/${maxConnections}`);
    // console.log(`> Memory usage: ${memoryUsageMB} MB`);

    // 1. Cảnh báo quá tải kết nối
    if (numConnection > maxConnections) {
      console.warn(
        `[ALERT] Connection overload detected! Current: ${numConnection}`
      );
      // Ở đây bạn có thể gửi mail alert hoặc bắn tin nhắn Telegram cho Dev
    }

    // 2. Cảnh báo quá tải RAM (Ví dụ: Cảnh báo nếu app dùng quá 500MB RAM - tùy cấu hình)
    const memoryThreshold = 500; // 500MB
    if (parseFloat(memoryUsageMB) > memoryThreshold) {
      console.warn(`[ALERT] High memory usage detected: ${memoryUsageMB} MB`);
    }

    // console.log(`------------------------------------`);
  }, _SECONDS);
};

module.exports = {
  countConnect,
  checkOverload,
};
