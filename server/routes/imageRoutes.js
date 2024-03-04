const express = require("express");

const Image = require("../models/Image");

const imageRoutes = express.Router();

//get carousel images
const getCarouselImages = async (req, res) => {
  const images = await Image.distinct("imageUrl");
  res.json(images);
};

imageRoutes.route("/").get(getCarouselImages);

module.exports = imageRoutes;
