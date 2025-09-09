const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Plant = require("../models/plant");

// Configure multer (store in /public/uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// All Plants Page
router.get("/plants", async (req, res) => {
  try {
    const plants = await Plant.find();
    res.render("allplants", { plants });
  } catch (err) {
    res.status(500).send("Error fetching plants");
  }
});

// Add Plant (Form submission)
router.post("/addplant", upload.single("image"), async (req, res) => {
  try {
    const newPlant = new Plant({
      name: req.body.name,
      type: req.body.type,
      description: req.body.description,
      image: req.file ? "/uploads/" + req.file.filename : null,
      sketchfabEmbedUrl: req.body.sketchfabEmbedUrl
    });

    await newPlant.save();
    res.redirect("/plants");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding plant");
  }
});

module.exports = router;
