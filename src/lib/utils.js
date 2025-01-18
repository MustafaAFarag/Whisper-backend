import jwt from "jsonwebtoken";

export const generateToken = (userId, response) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // Send in cookie
  response.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // Prevent XSS Attacks (cross-site scripting attacks)
    sameSite: "None", // CSRF attacks (cross-site)
    secure: process.env.NODE_ENV === "production", // Only set secure flag in production
  });

  return token;
};
