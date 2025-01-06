exports.home = function (req, res, next) {
  res.status(200).json({
    Message: "Welcome to Express js!",
  });
};
