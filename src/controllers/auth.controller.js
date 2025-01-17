import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (request, response) => {
  console.log("Request Body:", request.body);
  const { fullName, email, password } = request.body;
  try {
    // hash password
    if (!fullName || !email || !password) {
      return response.status(400).json({
        message: "ALL Fields are Required",
      });
    }

    if (password.length < 6) {
      return response.status(400).json({
        message: "Password must be atleast 6 Characters",
      });
    }

    const user = await User.findOne({ email });

    if (user)
      return response.status(400).json({
        message: "Email already exists",
      });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, response);
      await newUser.save();

      response.status(201).json({
        status: "success",
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
        data: {
          user: newUser,
        },
      });
    } else {
      response.status(400).json({
        message: "Invalid user data",
      });
    }
  } catch (error) {
    console.log("Error in Signup Controller", error.message);
    response.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const login = async (request, response) => {
  const { email, password } = request.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return response.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const isPaswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPaswordCorrect) {
      return response.status(400).json({
        message: "Invalid Credentials",
      });
    }

    generateToken(user._id, response);

    response.status(200).json({
      status: "successfull",
      data: {
        user,
      },
    });
  } catch (error) {
    console.log("Error in Login Controller", error.message);
    response.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const logout = (request, response) => {
  //clear all cookies

  try {
    response.cookie("jwt", "", {
      maxAge: 0,
    });

    response.status(200).json({
      message: "Logged out Successfully",
    });
  } catch (error) {
    console.log("Error in Logout Controller", error.message);
    response.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const updateProfile = async (request, response) => {
  try {
    const { profilePic } = request.body;
    const userId = request.user._id;

    if (!profilePic) {
      response.status(400).json({
        message: "Profile Pic is Required",
      });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResponse.secure_url,
      },
      {
        new: true,
      }
    );

    response.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in update Profile", error);
    response.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const checkAuth = (request, response) => {
  try {
    response.status(200).json(request.user);
  } catch (error) {
    console.log("Error in CheckAuth Controller", error.message);
    response.status(500).json({
      message: "Internal Server Error",
    });
  }
};
