const serverless = require("serverless-http");
const express = require("express");

const app = require("../../app.js");

// Export for Netlify
module.exports.handler = serverless(app);
