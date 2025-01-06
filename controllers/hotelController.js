const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Hotel Destinations
exports.destinations = async function (req, res, next) {
  // Check if the destination exists
  if (!req.body.destination) {
    return res.status(400).json({
      success: false,
      message: "Please provide a destination",
    });
  }

  const options = {
    method: "GET",
    url: "https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination",
    params: { query: req.body.destination },
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "booking-com15.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    res.status(200).json({
      success: true,
      message: "Destination found!",
      data: response.data?.data,
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({
      success: false,
      error: error,
      message: "Destination not found!",
    });
  }
};

// Hotel Search by Destination and Check-in Date

exports.hotelSearch = async function (req, res, next) {
  // Check if the destination exists
  const { destinationId } = req.body;
  if (!destinationId) {
    return res.status(400).json({
      success: false,
      message: "Please provide a destination or check-in date",
    });
  }

  const axios = require("axios");

  const options = {
    method: "GET",
    url: "https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels",
    params: {
      dest_id: destinationId,
      search_type: "CITY",
      arrival_date: "2025-01-07",
      departure_date: "2025-01-08",
      adults: "2",
      room_qty: "1",
      page_number: "1",
      units: "metric",
      temperature_unit: "c",
      languagecode: "en-us",
      currency_code: "USD",
    },
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "booking-com15.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    res.status(200).json({
      success: true,
      message: "Destination found!",
      data: response.data?.data,
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({
      success: false,
      error: error,
      message: "Destination not found!",
    });
  }
};

// Get Hotels

exports.getHotels = async function (req, res, next) {
  const { city, checkin, checkout } = req.query;

  if (!city || !checkin || !checkout) {
    return res.status(400).json({
      success: false,
      message: "Please provide a city and checkin-checkout date",
    });
  }

  // Parse dates
  const checkinDate = new Date(checkin);
  const checkoutDate = new Date(checkout);

  // Calculate the difference in time (in milliseconds)
  const timeDifference = checkoutDate - checkinDate;

  // Convert milliseconds to days
  const numberOfDays = timeDifference / (1000 * 60 * 60 * 24);

  // Log the result
  console.log(`Number of days: ${numberOfDays}`);

  if (numberOfDays <= 0) {
    return res.status(400).json({
      success: false,
      message: "Checkout date must be after checkin date",
    });
  }

  // Path to the JSON file
  const filePath = path.join(__dirname, "./json/search_hotels.json");

  // Read the JSON file
  const rawData = fs.readFileSync(filePath, "utf-8");
  const search_hotels = JSON.parse(rawData);

  // Filter hotels by city
  const matchedHotels = search_hotels?.searchHotels.find(
    (hotel) => hotel.city.toLowerCase() === city.toLowerCase()
  );
  if (!matchedHotels) {
    return res.status(404).json({
      success: false,
      message: `No hotels found in ${city}`,
    });
  }

  // Format matched hotels
  const formattedHotels = matchedHotels?.data?.hotels.map((hotel) => {
    const pricePerNight = hotel.property.priceBreakdown?.grossPrice?.value || 0;

    // Parse accessibilityLabel into details
    const accessibilityLabel = hotel.accessibilityLabel || "";
    const details = {
      stars: accessibilityLabel.match(/\d+ out of \d+ stars/)?.[0] || null,
      reviewSummary:
        accessibilityLabel.match(
          /\d+\.\d+ (?:Very Good|Excellent|Good|Average|Poor)/
        )?.[0] || null,
      distance: accessibilityLabel.match(/\d+ km from downtown/)?.[0] || null,
      roomType:
        accessibilityLabel
          .match(/Private room : .+?\./)?.[0]
          ?.replace("Private room :", "")
          .trim() || null,
      priceInfo: (() => {
        const priceMatch = accessibilityLabel.match(
          /Original price (\d+\.?\d*)/
        );
        if (priceMatch && priceMatch[1]) {
          const originalPrice = parseFloat(priceMatch[1]);
          return `Original price for ${numberOfDays} nights was: ${(
            originalPrice * numberOfDays
          ).toFixed(2)} USD. Current Price is: ${(
            pricePerNight * numberOfDays
          ).toFixed(2)} USD`;
        }
        return null;
      })(),
    };

    return {
      hotel_id: hotel.hotel_id,
      hotel_name: hotel.property.name,
      nights: numberOfDays,
      price: pricePerNight * numberOfDays,
      details,
      basicInfo: {
        reviewScore: hotel.property.reviewScore,
        reviewCount: hotel.property.reviewCount,
        reviewScoreWord: hotel.property.reviewScoreWord,
        stars: hotel.property.propertyClass,
        location: {
          latitude: hotel.property.latitude,
          longitude: hotel.property.longitude,
        },
      },
      amenities:
        hotel.property.priceBreakdown?.benefitBadges?.map(
          (badge) => badge.text
        ) || [],
      photoUrls: hotel.property.photoUrls || [],
    };
  });

  res.status(200).json({
    success: true,
    message: "Destination found!",
    data: formattedHotels,
  });
};
