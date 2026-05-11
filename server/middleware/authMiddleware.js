const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * Middleware: ตรวจ JWT token จาก HttpOnly Cookie
 * ถ้า token ถูกต้อง → แนบ req.user แล้วไปต่อ
 * ถ้าไม่มี / หมดอายุ → ส่ง 401
 */
const authenticate = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { user_id, email, role }
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid or expired token" });
  }
};

/**
 * Middleware: ตรวจ role
 * ใช้ต่อจาก authenticate เสมอ
 * ตัวอย่าง: router.get('/admin', authenticate, authorizeRole('admin'), handler)
 */
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Insufficient permissions" });
    }
    next();
  };
};

module.exports = { authenticate, authorizeRole };
