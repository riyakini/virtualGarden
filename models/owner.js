// models/Owner.js
const mongoose = require("mongoose");

const ownerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String,default: "admin" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Owner", ownerSchema);


