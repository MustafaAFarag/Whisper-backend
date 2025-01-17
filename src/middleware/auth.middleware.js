import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (request, response, next) => {
  try {
    const token = request.cookies.jwt;

    if (!token) {
      return response.status(401).json({
        message: "Unauthroized - No Token Provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return response.status(401).json({
        message: "Unauthroized - Invaild Token",
      });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return response.status(404).json({
        message: "User not Found",
      });
    }

    request.user = user;

    next();
  } catch (error) {
    console.log("Error in ProtectRoute middleware", error.message);
    response.status(500).json({
      message: "Internal Server Error",
    });
  }
};
