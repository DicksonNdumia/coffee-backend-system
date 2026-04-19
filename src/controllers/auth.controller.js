import bcrypt from "bcryptjs";
import pool from "../config/db.config.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../helper/utils/generateToken.js";

//Registrations
export const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role_id,
      date_of_birth,
      location,
      county,
      phone_number,
    } = req.body;

    //  Basic required fields check
    if (
        !name ||
        !email ||
        !password ||
        !role_id ||
        !date_of_birth ||
        !location ||
        !county ||
        !phone_number
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    //Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    //Phone validation (Kenya format)
    const phoneRegex = /^(?:\+254|254|0)?7\d{8}$/;
    if (!phoneRegex.test(phone_number)) {
      return res.status(400).json({
        message: "Invalid phone number format",
      });
    }

    //Password validation
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    //Check if role exists
    const roleCheck = await pool.query(
        "SELECT id FROM roles WHERE id = $1",
        [role_id]
    );

    if (roleCheck.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid role selected",
      });
    }

    // Check email uniqueness
    const checkEmail = await pool.query(
        `SELECT id FROM users WHERE email=$1`,
        [email]
    );

    if (checkEmail.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    //Check phone uniqueness
    const checkPhone = await pool.query(
        `SELECT id FROM users WHERE phone_number=$1`,
        [phone_number]
    );

    if (checkPhone.rows.length > 0) {
      return res.status(400).json({
        message: "Phone number already in use",
      });
    }

    //  Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    //  Insert user
    const insertUser = await pool.query(
        `
      INSERT INTO users 
      (name,email,password,role_id,date_of_birth,location,county,phone_number)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id,name,email,role_id
      `,
        [
          name,
          email,
          hashPassword,
          role_id,
          date_of_birth,
          location,
          county,
          phone_number,
        ]
    );

    if (insertUser.rows.length === 0) {
      return res.status(400).json({
        message: "Failed to register user",
      });
    }

    const user = insertUser.rows[0];

    generateAccessToken(res, user.id, user.role_id);

    return res.status(201).json({
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

//Login user
export const loginUser = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    // Normalize email
    email = email.trim().toLowerCase();

    //Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    const userQuery = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    );

    const user = userQuery.rows[0];

    // Prevent timing attacks
    const fakeHash =
        "$2b$10$CwTycUXWue0Thq9StjUM0uJ8rQ8Yp4nH3UX0YPD6/rs24kTx5c5yG";

    const isPasswordCorrect = user
        ? await bcrypt.compare(password, user.password)
        : await bcrypt.compare(password, fakeHash);

    if (!user || !isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.status(200).json({
      message: "Logged in successfully",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        role_id: user.role_id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

//Logout user
export const logoutUser = async (req, res, next) => {
  try {

    res.cookie("access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      expires: new Date(0), //Expires immediately
    });

    res.cookie("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      expires: new Date(0), // Expire immediately
    });

    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    next(error);
  }
};
