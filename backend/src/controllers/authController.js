import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken } from "../utils/token.js";

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS_WINDOW_MS = 60 * 1000; 


export async function register(req, res) {
  try {
    const { name, email, password, role = "applicant" } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
    if (!["applicant", "recruiter"].includes(role)) return res.status(400).json({ message: "Invalid role" });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: email.toLowerCase(), password: hashed, role, isVerified: true });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || !(await bcrypt.compare(password || "", user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

function publicUser(user) {
  const obj = user.toObject();
  delete obj.password;
  delete obj.resetOtpHash;
  delete obj.resetOtpExpires;
  return obj;
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

const lastOtpRequestAt = new Map(); // email -> timestamp, simple per-process anti-spam

export async function forgotPassword(req, res) {
  try {
    const email = req.body.email?.toLowerCase().trim();
    if (!email) return res.status(400).json({ message: "Email is required" });

    const lastRequest = lastOtpRequestAt.get(email);
    if (lastRequest && Date.now() - lastRequest < OTP_MAX_ATTEMPTS_WINDOW_MS) {
      return res.status(429).json({ message: "Please wait a moment before requesting another code" });
    }

    const user = await User.findOne({ email });
   
    if (!user) {
      return res.json({ message: "If that email is registered, a reset code has been sent." });
    }

    const otp = generateOtp();
    user.resetOtpHash = await bcrypt.hash(otp, 10);
    user.resetOtpExpires = new Date(Date.now() + OTP_TTL_MS);
    await user.save();

    lastOtpRequestAt.set(email, Date.now());

    await sendOtpEmail(email, otp);

    res.json({ message: "If that email is registered, a reset code has been sent." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function resetPassword(req, res) {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, code and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email }).select("+resetOtpHash +resetOtpExpires");
    if (!user || !user.resetOtpHash || !user.resetOtpExpires) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }
    if (user.resetOtpExpires.getTime() < Date.now()) {
      user.resetOtpHash = undefined;
      user.resetOtpExpires = undefined;
      await user.save();
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    const matches = await bcrypt.compare(String(otp), user.resetOtpHash);
    if (!matches) return res.status(400).json({ message: "Invalid or expired code" });

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetOtpHash = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
