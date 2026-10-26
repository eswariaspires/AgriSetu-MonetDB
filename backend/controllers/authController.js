
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/query.js";

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      district,
      state,
    } = req.body;

    if (!name?.trim() || !email?.trim() || !password || !role) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    if (!["farmer", "buyer"].includes(role)) {
      return res.status(400).json({
        message: "Role must be farmer or buyer.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

const normalizedEmail = email.trim().toLowerCase();

const existingResult = await query(
  "SELECT user_id FROM agrisetu.users WHERE email = ?",
  normalizedEmail
);

    if (existingResult.data.length > 0) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const insertResult = await query(
  `INSERT INTO agrisetu.users
   (name, email, password_hash, role, phone, district, state)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  name.trim(),
  normalizedEmail,
  hashedPassword,
  role,
  phone?.trim() || null,
  district?.trim() || null,
  state?.trim() || null
);

    const userResult = await query(
  `SELECT user_id, name, email, role, phone, district, state
   FROM agrisetu.users
   WHERE email = ?`,
  normalizedEmail
);

    if (userResult.data.length === 0) {
      throw new Error("User was inserted but could not be retrieved.");
    }

    const columns = userResult.headers.columnNames;
    const values = userResult.data[0];

    const user = Object.fromEntries(
      columns.map((column, index) => [column, values[index]])
    );

    return res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        district: user.district,
        state: user.state,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Unable to create account.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await query(
  `SELECT user_id, name, email, password_hash, role, phone, district, state
   FROM agrisetu.users
   WHERE email = ?`,
  normalizedEmail
);

    if (result.data.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const columns = result.headers.columnNames;
    const values = result.data[0];

    const user = Object.fromEntries(
      columns.map((column, index) => [column, values[index]])
    );

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        userId: String(user.user_id),
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        district: user.district,
        state: user.state,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Unable to log in.",
    });
  }
};
