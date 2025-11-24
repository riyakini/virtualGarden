const mongoose = require("mongoose");

const plantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  botanicalName: {
    type: String,
    trim: true
  },
  commonNames: {
    type: [String], // store as array (split from comma separated input)
    default: []
  },
  type: {
    type: String,
    default: "Herb"
  },
  habitat: {
    type: String,
    trim: true
  },
  family: {
    type: String,
    trim: true
  },
  region: {
    type: String,
    trim: true
  },
  culturalSignificance: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  medicinal: {
    type: [String],
    default: []
  },
  cultivation: {
    type: [String],
    default: []
  },
  sketchfabEmbedUrl: {
    type: String
  },
  image: {
    type: String
  },
  externalLink: {
  type: String,
  trim: true
}

});

module.exports =mongoose.model("Plant", plantSchema);
