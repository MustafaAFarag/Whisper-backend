import jwt from "jsonwebtoken";

export const generateToken = (userId, response) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  rres.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
  });

  return token;
};
