const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const app = express();

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/jobSeekersDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Define a schema for storing user data
const userSchema = new mongoose.Schema({
  name: String,
  resumePath: String,
});

const User = mongoose.model("User", userSchema);

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// Set EJS as the template engine
app.set("view engine", "ejs");

// Serve static files
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", upload.single("resume"), (req, res) => {
  const userName = req.body.name;
  const resumePath = req.file.path;

  // Save the user info and resume path in MongoDB
  const newUser = new User({
    name: userName,
    resumePath: resumePath,
  });

  newUser
    .save()
    .then(() => {
      res.send("Signup successful! Resume uploaded and data saved.");
    })
    .catch((err) => {
      res.status(500).send("Error saving user data to MongoDB");
      console.error(err);
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
