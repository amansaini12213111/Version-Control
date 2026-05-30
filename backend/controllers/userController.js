const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../models/userModel");

dotenv.config();

async function signup(req, res) {

  const { username, password, email } = req.body;

  try {

    const existingUsername = await User.findOne({
      username: new RegExp("^" + username + "$", "i"),
    });

    if (existingUsername) {
      return res.status(400).json({
        message: "Username is already taken!",
      });
    }

    const existingEmail = await User.findOne({
      email: new RegExp("^" + email + "$", "i"),
    });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email is already registered!",
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    const token = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    return res.json({
      token,
      userId: savedUser._id,
    });

  } catch (err) {

    console.error(
      "Error during signup:",
      err.message
    );

    if (err.code === 11000) {
      const key = Object.keys(err.keyValue || {})[0] || "field";
      const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
      return res.status(400).json({
        message: `${formattedKey} is already registered!`,
      });
    }

    return res.status(500).json({
      message: "Server error during signup. Please try again.",
    });
  }
}

async function login(req, res) {

  const { email, password } = req.body;

  try {

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials!",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials!",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    return res.json({
      token,
      userId: user._id,
    });

  } catch (err) {

    console.error(
      "Error during login:",
      err.message
    );

    return res.status(500).send("Server error!");
  }
}

async function getAllUsers(req, res) {

  try {

    const users = await User.find({})
      .populate("repositories")
      .populate("followedUsers")
      .populate("starRepos");

    return res.json(users);

  } catch (err) {

    console.error(
      "Error during fetching:",
      err.message
    );

    return res.status(500).send("Server error!");
  }
}

async function getUserProfile(req, res) {

  const currentID = req.params.id;

  try {

    const user = await User.findById(currentID)
      .populate("repositories")
      .populate("followedUsers")
      .populate("starRepos");

    if (!user) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    return res.json(user);

  } catch (err) {

    console.error(
      "Error during fetching:",
      err.message
    );

    return res.status(500).send("Server error!");
  }
}

async function updateUserProfile(req, res) {

  const currentID = req.params.id;

  const { email, password } = req.body;

  try {

    let updateFields = {};

    if (email) {
      updateFields.email = email;
    }

    if (password) {

      const salt = await bcrypt.genSalt(10);

      const hashedPassword = await bcrypt.hash(
        password,
        salt
      );

      updateFields.password = hashedPassword;
    }

    const updatedUser =
      await User.findByIdAndUpdate(
        currentID,
        { $set: updateFields },
        { new: true }
      );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    return res.json(updatedUser);

  } catch (err) {

    console.error(
      "Error during updating:",
      err.message
    );

    return res.status(500).send("Server error!");
  }
}

async function deleteUserProfile(req, res) {

  const currentID = req.params.id;

  try {

    const deletedUser =
      await User.findByIdAndDelete(currentID);

    if (!deletedUser) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    return res.json({
      message: "User Profile Deleted!",
    });

  } catch (err) {

    console.error(
      "Error during deleting:",
      err.message
    );

    return res.status(500).send("Server error!");
  }
}

module.exports = {
  getAllUsers,
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};