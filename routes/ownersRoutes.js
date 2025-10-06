const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const OwnerModel = require("../models/owner");

// Show admin registration form
router.get("/create", (req, res) => {
  res.render("auth/ownerRegister");
});

// Handle admin creation
router.post("/create", async (req, res) => {
  try {
    let { name, email, password } = req.body;

    let existingOwner = await OwnerModel.findOne({ email });
    if (existingOwner) {
      res.send("Owner with this email already exists");
      return res.redirect("/owners/create"); // already exists
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    
    let newOwner = await OwnerModel.create({
      name,
      email,
      password: hash,
      role: "admin",
    });

    let token = jwt.sign({ email, role: "admin" }, "secret");
    res.cookie("token", token);
    res.redirect("/owners/login"); // after creating admin go to login
  } catch (err) {
    console.log(err);
    res.send("cannot create owner, ownee already exists");
    res.redirect("/owners/create");
  }
});

// Show admin login form
router.get("/login", (req, res) => {
  res.render("auth/ownerLogin");
});

// Handle admin login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const owner = await OwnerModel.findOne({ email });
    if (!owner) {
      return res.redirect("/owners/login");
    }

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      return res.redirect("/owners/login");
    }

    // ✅ Login success, set cookie
    let token = jwt.sign({ email: owner.email, role: owner.role }, "secret");
    res.cookie("token", token);

    // Redirect to plants/add if admin, else home
    if (owner.role === "admin") {
      res.redirect("/plants/add");
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.error(err);
    res.redirect("/owners/login");
  }
});


module.exports = router;
