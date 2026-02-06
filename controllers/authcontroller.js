import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

import nodemailer from "nodemailer";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// REGISTER
export const signup = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    throw new ApiError(400, "Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    firstname,
    lastname,
    email,
    password: hashedPassword
  });

  return res.status(201).json(
    new ApiResponse(201, { userId: user._id }, "User registered successfully")
  );
});

// LOGIN
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid password");
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return res.status(200).json(
    new ApiResponse(200, {
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
        email: user.email
      }
    }, "Login successful")
  );
});

export const sendCode = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const code = Math.floor(1000 + Math.random() * 9000).toString(); // 4 Digit OTP
  const expiry = Date.now() + 1 * 60 * 1000; // 1 minute

  user.code = code;
  user.codeExpiry = expiry;
  await user.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Verification Code",
    text: `Your verification code is ${code}. It is valid for 1min.`
  });

  return res.status(200).json(
    new ApiResponse(200, null, "Verification code sent successfully")
  );
});

export const verifyCode = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.code !== code) {
    throw new ApiError(400, "Invalid verification code");
  }

  if (Date.now() > user.codeExpiry) {
    throw new ApiError(400, "Verification code expired");
  }

  // Verification code Success then Issue JWT token
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  // Clear Verification Code
  user.code = null;
  user.codeExpiry = null;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, { token }, "Login successful")
  );
});

export const resendCode = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Generate new Verification Code
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expiry = Date.now() + 1 * 60 * 1000;

  user.code = code;
  user.codeExpiry = expiry;
  await user.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your New Verification Code",
    text: `Your new verification code is ${code}. It expires in 1 minute.`,
  });

  return res.status(200).json(
    new ApiResponse(200, null, "Verification code resent successfully!")
  );
});
