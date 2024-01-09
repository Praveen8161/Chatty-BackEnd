import jwt from "jsonwebtoken";

// Generate Token by User ID
export function generateToken(id) {
  return jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: "2d",
  });
}

// Verify Token and return User ID
export function verifyToken(token) {
  return jwt.verify(token, process.env.SECRET_KEY);
}
