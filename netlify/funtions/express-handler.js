const serverless = require("serverless-http");
const express = require("express");

const app = express();

// Middleware and routes
app.use(express.json());
app.use("/api", require("./routes")); // Point to your routes file

// Export for Netlify
module.exports.handler = serverless(app);
