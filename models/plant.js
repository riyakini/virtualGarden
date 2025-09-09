const mongoose = require("mongoose");

const plantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    default: "Herb"
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String, // store image filename or cloud URL
    required: false
  },
  sketchfabEmbedUrl: {
    type: String,
    required: true
  },
}, { timestamps: true });

module.exports = mongoose.model("Plant", plantSchema);
