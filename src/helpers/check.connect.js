"use strict";

const mongoose = require("mongoose");
const os = require("os");
const process = require("process");
const _SECONDS = 5000;

// Count Connect
const countConnect = () => {
  const numConnection = mongoose.connections.length;
  console.log(`Number of connections::${numConnection}`);
};

// check over load connect
const checkOverload = () => {
  setInterval(() => {
    const numConnection = mongoose.connections.length;
    const numCors = os.cpus().length; // Check coi máy tính có bao nhiêu core
    const memoryUsage = process.memoryUsage().rss;
    // Example maximum number of connections based on number of cores
    const maxConnections = numCors * 5; // Máy tính của mình chịu được tối đa 5 connection

    // console.log(`Active connections:${numConnection}`);
    // console.log(`Memory usage:: ${memoryUsage / 1024 / 1024} MB`);

    if (numConnection > maxConnections) {
      console.log(`Connection overload detected!`);
    }
  }, _SECONDS); // Monitor every 5 seconds
};

module.exports = {
  countConnect,
  checkOverload,
};
