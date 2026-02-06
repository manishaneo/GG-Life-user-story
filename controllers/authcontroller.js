import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

import nodemailer from "nodemailer";//

// REGISTER
export const signup= async (req, res)=> {
  
  const {firstname, lastname, email, password} = req.body;

  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({
      message: "All fields (firstname, lastname, email, password) are required"
    });
  }

  const nameRegex = /^[A-Za-z]+$/;

  if (!nameRegex.test(firstname)) {
    return res.status(400).json({ message: "Firstname can contain only letters" });
  }
  if (!nameRegex.test(lastname)) {
    return res.status(400).json({ message: "Lastname can contain only letters" });
  }

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters long"
    });
  }

  if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
    return res.status(400).json({ message: "Password must contain letters and numbers" });
  }

  try{
    
    const exists =await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id
    });
  } catch (err) {
    console.error("Signup error ", err);//debug
    res.status(500).json({ message: "Signup failed" });
    
  }
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "email and password are required"
    });
  }

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

export const sendCode = async(req,res)=>{
  const {email}= req.body;
  console.log("1. Received email:", email);

  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try{
    const user= await User.findOne({email});
    console.log("2. User found:", user);
    if(!user){
      return res.status(404).json({message:"User not found"});
    }

    const code= Math.floor(1000 + Math.random()* 9000).toString();//4 Digit OTP
    const expiry= Date.now()+ 1 * 60 * 1000; // 1 minute
    console.log("3. Generated code:", code);

    user.code= code;
    user.codeExpiry= expiry;
    await user.save();//saving code and expiry in db
    console.log("4. Code saved in DB");
    const transporter= nodemailer.createTransport({
      service:"gmail",
      auth:{
        user:process.env.EMAIL_USER,//sender email
        pass: process.env.EMAIL_PASS
      }
    });
    console.log("5. Mail transporter created");
    await transporter.sendMail({
      from: process.env.EMAIL_USER,//send email
      to: email,//recipient mail
      subject: "Your Verification Code",
      text: `Your verification code is ${code}. It is valid for 1min.`
    });
    console.log("6. Mail sent!");
    res.json({ message: "Verification code sent successfully" });
  } catch (err) {
    console.error("Verification code error:", err);
    res.status(500).json({ message: "Failed to send verification code" });
  }
};

export const verifyCode= async(req, res)=>{
  const {email, code}= req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "email and code are required" });
  }

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try{
    const user= await User.findOne({email});
    if(!user){
      return res.status(404).json(
        {
          message: "User not found"
        });
    }
    if(user.code !== code){
      return res.status(400).json(
        { 
          message: "Invalid verification code"
        }
      );
    }

    if(Date.now() > user.codeExpiry){
      return res.status(400).json(
        { 
          message:"Verification code expired" 
        }
      );
    }

    //Verification code Success then Issue JWT token
    const token = jwt.sign(
      { 
        userId: user._id
       },
      process.env.JWT_SECRET,
      { 
        expiresIn: "1d" 
      }
    );

    //clear Verification Code
    user.code = null;
    user.codeExpiry = null;
    await user.save();

    return res.json({ 
      message: "Login successful", token 
    });
  }catch(err){
    console.error("Verify verification code error:", err);
    return res.status(500).json(
      { 
        message: "Verification failed" 
      }
    );
  }
};

export const resendCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
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

    return res.json({ message: "Verification code resent successfully!" });
  } catch (err) {
    console.error("Resend verification code error:", err);
    return res.status(500).json({ message: "Failed to resend verification code" });
  }
};
