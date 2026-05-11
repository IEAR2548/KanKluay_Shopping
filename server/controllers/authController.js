const { register, login } = require("../services/authService");
const { getUserById } = require("../services/userService");

// Cookie options สำหรับ HttpOnly cookie
const COOKIE_OPTIONS = {
  httpOnly: true,                                      // JavaScript อ่านไม่ได้ → กัน XSS
  secure: process.env.NODE_ENV === "production",       // HTTPS only ใน production
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // cross-site ได้ใน production
  maxAge: 7 * 24 * 60 * 60 * 1000,                   // 7 วัน (ms)
  path: "/",
};

/**
 * POST /api/auth/register
 */
const registerController = async (req, res) => {
  try {
    const { firstname, lastname, username, email, password, phone_number } = req.body;

    // Validate required fields
    if (!firstname || !lastname || !username || !email || !password) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    // Password length check
    if (password.length < 8) {
      return res.status(400).json({ message: "Password ต้องมีอย่างน้อย 8 ตัวอักษร" });
    }

    const newUser = await register({ firstname, lastname, username, email, password, phone_number });

    return res.status(201).json({
      message: "สมัครสมาชิกสำเร็จ",
      user: newUser,
    });
  } catch (err) {
    if (err.message === "Email already in use") {
      return res.status(409).json({ message: "Email นี้ถูกใช้งานแล้ว" });
    }
    console.error("[registerController]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/auth/login
 */
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "กรุณากรอก email และ password" });
    }

    const { token, user } = await login({ email, password });

    // Set JWT ใน HttpOnly Cookie
    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(200).json({
      message: "เข้าสู่ระบบสำเร็จ",
      user,
    });
  } catch (err) {
    if (
      err.message === "Invalid email or password" ||
      err.message === "Account is suspended or inactive"
    ) {
      return res.status(401).json({ message: err.message });
    }
    console.error("[loginController]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/auth/logout
 */
const logoutController = (req, res) => {
  res.clearCookie("token", { ...COOKIE_OPTIONS, maxAge: 0 });
  return res.status(200).json({ message: "ออกจากระบบสำเร็จ" });
};

/**
 * GET /api/auth/me
 * ดึงข้อมูล user ที่ login อยู่ (ต้องผ่าน authenticate middleware ก่อน)
 */
const getMeController = async (req, res) => {
  try {
    const user = await getUserById(req.user.user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    console.error("[getMeController]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  registerController,
  loginController,
  logoutController,
  getMeController,
};