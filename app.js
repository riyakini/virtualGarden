const express=require('express');
const app=express();
const cookieParser=require('cookie-parser');
const path=require('path');
const healthRoutes = require("./routes/health");
const userModel = require("./models/user");
const Plant = require("./models/plant");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const plantsRoutes = require("./routes/plant");
require("dotenv").config();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.set('view engine','ejs');
app.use("/api", healthRoutes);
// Connect to Database
const connectDb=require('./config/mongoose-connector');
connectDb();

app.get('/',(req,res)=>{
    res.render('index');
});

function isLoggedIn(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    
    return res.redirect("/login");
  }

  try {
    const data = jwt.verify(token, "secret");
    req.user = data;
    next();
  } catch (err) {
    
    res.redirect("/login");
  }
}

app.get('/register',(req,res)=>{
    res.render('auth/register');
});

app.post("/register", async function (req, res) {
  let { name, email, password } = req.body;

  try {
    let createdUser = await userModel.findOne({ email });

    if (createdUser) {
      alert("User already exists");
        return res.redirect("/register");
    }

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        createdUser = await userModel.create({
          name,
          email,
          password: hash,
        });

        let token = jwt.sign({ email }, "secret");
        res.cookie("token", token);
        res.redirect("/login");
      });
    });
  } catch (err) {
    
    res.redirect("/register");
  }
});

app.get('/login',(req,res)=>{
    res.render('auth/login');
});
app.post("/login", async function (req, res) {
  let user = await userModel.findOne({ email: req.body.email });
  if (!user) {
   
    return res.redirect("/login");
  }

  bcrypt.compare(req.body.password, user.password, function (err, result) {
    if (result) {
      let token = jwt.sign({ email: user.email }, "secret");
      res.cookie("token", token);
      res.redirect("/");
    } else {
      req.flash("error_msg", "Invalid email or password.");
      res.redirect("/login");
    }
  });
});

app.get('/plants',(req,res)=>{
    res.render('plants/allplant');
});
// Routes
app.use("/plants", plantsRoutes);
app.get('/addplant',(req,res)=>{
    res.render('plants/addplant');
});
app.get('/health',isLoggedIn,(req,res)=>{
    res.render('health');
});
app.get('/detect',isLoggedIn, (req, res) => res.render('detect'));

app.get('/aloevera', (req, res) => res.render('plants/aloevera'));
// Logout Route
app.get("/logout", function (req, res) {
  res.cookie("token", "");
  res.redirect("/");
});

app.listen(3000,()=>{
    console.log("Server running on http://localhost:3000");
});