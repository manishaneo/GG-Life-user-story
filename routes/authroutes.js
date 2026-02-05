import express from "express";
import {signup, login, sendCode, verifyCode, resendCode} from "../controllers/authcontroller.js";
import authmiddleware from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/send-code", sendCode);
router.post("/verify-code",verifyCode);
router.post("/resend-code", resendCode)
router.get("/profile", authmiddleware, (req, res) => {
  res.json({ message: "Protected", userId: req.userId });
});

export default router;
