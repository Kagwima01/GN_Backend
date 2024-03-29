const express = require("express");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const Jwt = require("jsonwebtoken");
const sendVerificationEmail = require("../middleware/sendVerificationEmail");
const sendPasswordResetEmail = require("../middleware/sendPasswordResetEmail");
const { protectRoute, admin } = require("../middleware/authMiddleware");

const userRoutes = express.Router();

//TODO: redefine expiresIn

const genToken = (id) => {
  return Jwt.sign({ id }, process.env.TOKEN_SECRET, { expiresIn: "60d" });
};

// login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPasswords(password))) {
    user.firstLogin = false;
    await user.save();
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      googleImage: user.googleImage,
      goodleId: user.googleId,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
      token: genToken(user._id),
      active: user.active,
      firstLogin: user.firstLogin,
      created: user.createdAt,
    });
  } else {
    res.status(401).json({ message: "Invalid Email or Password." });
    throw new Error("User not found.");
  }
});

// register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res
      .status(400)
      .json({ message: "We already have an account with that email address." });
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const newToken = genToken(user._id);

  sendVerificationEmail(newToken, email, name);

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      googleImage: user.googleImage,
      googleId: user.googleId,
      firstLogin: user.firstLogin,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
      token: newToken,
      active: user.active,
      createdAt: user.createdAt,
    });
  } else {
    res.status(400).json({ message: "We could not register you." });
    throw new Error(
      "Something went wrong. Please check your information and try again."
    );
  }
});

// verify email
const verifyEmail = asyncHandler(async (req, res) => {
  const user = req.user;
  user.active = true;
  await user.save();
  res.json(
    "Thanks for activating your account. You can close this window now."
  );
});

// password reset request
const passwordResetRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      const newToken = genToken(user._id);
      sendPasswordResetEmail(newToken, user.email, user.name);
      res.status(200).send(`We have send you a recover email to ${email}`);
    }
  } catch (error) {
    res
      .status(401)
      .json({ message: "There is no account with such an email address" });
  }
});

// password reset
const passwordReset = asyncHandler(async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (user) {
      user.password = req.body.password;
      await user.save();
      res.json({ message: "Your password has been updated successfully." });
    } else {
      res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    res.status(401).json({ message: "Password reset failed." });
  }
});

//google Web login
const googleWebLogin = asyncHandler(async (req, res) => {
  const { googleId, email, name, googleImage } = req.body;
  console.log(googleId, email, name, googleImage);

  try {
    const user = await User.findOne({ googleId: googleId });
    if (user) {
      user.firstLogin = false;
      await user.save();
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        googleImage: user.googleImage,
        googleId: user.googleId,
        firstLogin: user.firstLogin,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
        token: genToken(user._id),
        active: user.active,
        createdAt: user.createdAt,
      });
    } else {
      const newUser = await User.create({
        name,
        email,
        googleImage,
        googleId,
      });

      const newToken = genToken(newUser._id);

      sendVerificationEmail(newToken, newUser.email, newUser.name, newUser._id);
      res.json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        googleImage: newUser.googleImage,
        googleId: newUser.googleId,
        firstLogin: newUser.firstLogin,
        isAdmin: newUser.isAdmin,
        isSuperAdmin: newUser.isSuperAdmin,
        token: genToken(newUser._id),
        active: newUser.active,
        createdAt: newUser.createdAt,
      });
    }
  } catch (error) {
    res
      .status(404)
      .json({ message: "Something went wrong, please try again later." });
  }
});

//get all users
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

//delete a user
const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  try {
    await User.findByIdAndRemove(userId);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: "This user could not be found." });
    throw new Error("This user could not be found.");
  }
});
const userDelete = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
  } catch (error) {
    res.status(404).send(error);
    throw new Error(error);
  }
};

userRoutes.route("/delete-account/:id").delete(protectRoute, userDelete);

userRoutes.route("/login").post(loginUser);
userRoutes.route("/register").post(registerUser);
userRoutes.route("/verify-email").get(protectRoute, verifyEmail);
userRoutes.route("/password-reset-request").post(passwordResetRequest);
userRoutes.route("/password-reset").post(protectRoute, passwordReset);

userRoutes.route("/google-login").post(googleWebLogin);
userRoutes.route("/").get(protectRoute, admin, getUsers);
userRoutes.route("/:id").delete(protectRoute, admin, deleteUser);

module.exports = userRoutes;
