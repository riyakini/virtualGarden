const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Plant = require("../models/plant");

// Configure multer to store uploaded images in /public/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ================================
// 1️⃣ All Plants Page
// ================================
router.get("/plants", async (req, res) => {
  try {
    const plants = await Plant.find();
    res.render("plants/allplant", { plants });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching plants");
  }
});

// ================================
// 2️⃣ Add Plant Page (Form)
// ================================
router.get("/plants/addplant", (req, res) => {
  res.render("plants/addplant");
});

// Add Plant Form Submission
// Add Plant Form Submission
router.post("/plants/addplant", upload.single("image"), async (req, res) => {
  try {
    let {
      name,
      botanicalName,
      commonNames,
      type,
      habitat,
      family,
      region,
      culturalSignificance,
      description,
      medicinal,
      cultivation,
      externalLink,
      sketchfabEmbedUrl,
    } = req.body;

    // Convert commonNames (comma separated string → array)
    if (commonNames && typeof commonNames === "string") {
      commonNames = commonNames.split(",").map(n => n.trim());
    }

    // Ensure arrays
    if (medicinal && !Array.isArray(medicinal)) medicinal = [medicinal];
    if (cultivation && !Array.isArray(cultivation)) cultivation = [cultivation];

    const newPlant = new Plant({
      name,
      botanicalName,
      commonNames,
      type,
      habitat,
      family,
      region,
      culturalSignificance,
      description,
      medicinal,
      cultivation,
      externalLink,
      sketchfabEmbedUrl,
      image: req.file ? "/uploads/" + req.file.filename : null,
    });

    await newPlant.save();
    res.redirect("/plants");
  } catch (err) {
    console.error("Error adding plant:", err);
    res.status(500).send("Error adding plant");
  }
});



// ================================
// 3️⃣ Single Plant Detail Page
// ================================
// Single Plant Detail Page
router.get("/plants/:id", async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).send("Plant not found");

    // Try to get recommended plants of the same type
    let recommendedPlants = await Plant.aggregate([
      { $match: { _id: { $ne: plant._id }, type: plant.type } },
      { $sample: { size: 3 } }
    ]);

    // Fallback: If no plants of same type, get random plants
    if (recommendedPlants.length === 0) {
      recommendedPlants = await Plant.aggregate([
        { $match: { _id: { $ne: plant._id } } },
        { $sample: { size: 3 } }
      ]);
    }

    res.render("plants/plantDetail", { plant, recommendedPlants });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching plant details");
  }
});


module.exports = router;
