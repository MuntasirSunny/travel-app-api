const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");

// Routes
router.get("/", homeController.home);

module.exports = router;
