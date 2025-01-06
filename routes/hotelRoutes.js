const express = require("express");
const router = express.Router();
const hotelController = require("../controllers/hotelController");

// Route
router.get("/gethotels", hotelController.getHotels);
router.post("/destinations", hotelController.destinations);
router.post("/search-hotels", hotelController.hotelSearch);

module.exports = router;
