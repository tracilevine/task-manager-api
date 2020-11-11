const User = require("../db/models/user"),
  cloudinary = require("cloudinary").v2,
  { sendWelcomeEmail, sendCancellationEmail } = require('../emails/index'),
  jwt = require("jsonwebtoken");

// ***********************************************//
// Create a user
// ***********************************************//

exports.createUser = async (req, res) => {
  //create request body
  const { name, email, password } = req.body;

  //try catch will take req body and attach it user and add cookies and place into our database
  try {
    const user = new User({
      name,
      email,
      password,
    });
    //once user is created we will save the user in MongoDB
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    //now we will create the users token
    const token = await user.generateAuthToken();
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "Strict",
      //when you're in production your .env values must be secure
      //secure - Boolean: Marks the cookie to be used with HTTPS only.
      secure: process.env.NODE_ENV !== "production" ? false : true,
    });
    //sends back to the front-end
    res.status(201).json(user);
  } catch (e) {
    res.status(400).json({ error: e.toString() });
  }
};

// ***********************************************//
// Login a user
// ***********************************************//

exports.loginUser = async (req, res) => {
  //here we set the the email and password are required to login
  const { email, password } = req.body;
  try {
    //here we are finding the users by their input and creating the user
    const user = await User.findByCredentials(email, password);
    //now we are going to attach their cookie back to them
    const token = await user.generateAuthToken();
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "Strict",
      //when you're in production your .env values must be secure
      //secure - Boolean: Marks the cookie to be used with HTTPS only.
      secure: process.env.NODE_ENV !== "production" ? false : true,
    });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.toString() });
  }
};

// AUTHENTICATED REQUESTS

// ***********************************************//
// Get current user
// ***********************************************//

exports.getCurrentUser = async (req, res) => {
  res.json(req.user);
};

// ***********************************************//
// Update a user
// ***********************************************//

exports.updateCurrentUser = async (req, res) => {
  const updates = Object.keys(req.body); //this will return the keys name, email, password
  //now we will declare what we allow to be updated
  const allowedUpdates = ["name", "email", "password", "avatar"];
  //check to see if action is valid
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  //if not valid you will get and error
  if (!isValidOperation)
    return res.status(400).json({ message: "Invalid Update" });
  try {
    //Loop through each update, and change the value for the current user to the value coming from the body
    updates.forEach((update) => (req.user[update] = req.body[update]));
    //save the updated user in the db
    await req.user.save();
    //send the updated user as a response
    res.json(req.user);
  } catch (e) {
    res.status(400).json({ error: error.message });
  }
};

// ***********************************************//
// Logout a user
// ***********************************************//
exports.logoutUser = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.cookies.jwt;
    });
    await req.user.save();
    res.clearCookie("jwt");
    res.json({ message: "logged out!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ***********************************************//
// Logout all devices
// ***********************************************//

exports.logoutAllDevices = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.clearCookie("jwt");
    res.json({ message: "logged out from all devices!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ***********************************************//
// Delete a user
// ***********************************************//

exports.deleteUser = async (req, res) => {
  try {
    await req.user.remove();
    sendCancellationEmail(req.user.email, req.user.name);
    res.clearCookie("jwt");
    res.json({ message: "user deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ***********************************************//
// Upload avatar
// ***********************************************//
exports.uploadAvatar = async (req, res) => {
  try {
    const response = await cloudinary.uploader.upload(
      req.files.avatar.tempFilePath
    );
    req.user.avatar = response.secure_url;
    await req.user.save();
    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
