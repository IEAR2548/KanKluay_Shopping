const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getUserByEmail, createUser } = require("./userService");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Register user ใหม่
 * - ตรวจ email ซ้ำ
 * - hash password
 * - INSERT ลง DB
 */
const register = async ({
  firstname,
  lastname,
  username,
  email,
  password,
  phone_number,
}) => {
  // ตรวจ email ซ้ำ
  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error("Email already in use");
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // สร้าง user ใหม่
  const newUser = await createUser({
    firstname,
    lastname,
    username,
    email,
    password: hashedPassword,
    phone_number: phone_number || null,
    role: "user", // default role
    status: "active",
  });

  return newUser;
};

/**
 * Login
 * - ดึง user จาก email
 * - เปรียบเทียบ password ด้วย bcrypt
 * - ออก JWT token
 */
const login = async ({ email, password }) => {
  // ดึง user จาก email
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // ตรวจ status
  if (user.status !== "active") {
    throw new Error("Account is suspended or inactive");
  }

  // ตรวจ password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // ออก JWT
  const payload = {
    user_id: user.user_id,
    email: user.email,
    role: user.role,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  // Return token + user info (ไม่ส่ง password กลับ)
  const { password: _pw, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
};

module.exports = { register, login };
