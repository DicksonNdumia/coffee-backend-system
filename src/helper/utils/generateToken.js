import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  // Accessing the secret inside the function is safer
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing from environment variables");
  }

  return jwt.sign(
    {
      id: user.id,
      role_id: user.role_id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "45m" },
  );
};

export const generateRefreshToken = (user) => {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is missing from environment variables");
  }

  return jwt.sign({ id: user.id, role_id: user.role_id }, secret, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "7d",
  });
};
