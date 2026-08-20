/**
 * Auth Service
 * Business logic for authentication: hash, verify, tokens, JWT
 */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Token = require("../models/Token");
const env = require("../config/env");
const { UnauthorizedError, BadRequestError } = require("../utils/customErrors");

const SALT_ROUNDS = 12;

// Hash password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

// Verify password
const verifyPassword = async (candidatePassword, hashedPassword) => {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
};

// Verify JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch (err) {
    throw new UnauthorizedError("Invalid or expired token");
  }
};

// Generate random token for email verification / password reset
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Hash token before storing (same pattern as password)
const hashToken = async (token) => {
  return await bcrypt.hash(token, SALT_ROUNDS);
};

// Verify stored token against provided token
const verifyStoredToken = async (providedToken, hashedToken) => {
  return await bcrypt.compare(providedToken, hashedToken);
};

// Save token to database
const saveToken = async (userId, token, type, expiresHours = 24) => {
  const hashedToken = await hashToken(token);
  const expiresAt = new Date(Date.now() + expiresHours * 60 * 60 * 1000);

  await Token.create({
    userId,
    token: hashedToken,
    type,
    expiresAt,
    used: false,
  });

  return { plainToken: token, expiresAt };
};

// Find and validate token
const findValidToken = async (plainToken, type) => {
  const tokens = await Token.find({ type, used: false }).populate("userId");

  for (const tokenDoc of tokens) {
    const isValid = await verifyStoredToken(plainToken, tokenDoc.token);
    if (isValid) {
      if (tokenDoc.expiresAt < new Date()) {
        throw new BadRequestError("Token has expired");
      }
      return tokenDoc;
    }
  }

  throw new BadRequestError("Invalid token");
};

// Mark token as used
const markTokenUsed = async (tokenId) => {
  await Token.findByIdAndUpdate(tokenId, { used: true });
};

// Clean used/expired tokens (optional, MongoDB TTL handles most)
const cleanupTokens = async () => {
  await Token.deleteMany({
    $or: [{ used: true }, { expiresAt: { $lt: new Date() } }],
  });
};

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  generateRandomToken,
  hashToken,
  verifyStoredToken,
  saveToken,
  findValidToken,
  markTokenUsed,
  cleanupTokens,
};