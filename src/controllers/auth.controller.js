import bcrypt from "bcryptjs";
import pool from "../config/db.config.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../helper/utils/generateToken.js";

//Registrations
export const registerUser = async (req, res, next) => {
  try {
    //coming from the body request
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

    //Validating the inputs
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
      return res.status(401).json({
        message: "Please input everything",
      });
    }
    //Checking if role_id exists

    const roleCheck = await pool.query("SELECT id FROM roles WHERE id = $1", [
      role_id,
    ]);
    if (roleCheck.rows.length === 0) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    //Checking if user already exists

    const checkIfUserExist = await pool.query(
      `SELECT * FROM users WHERE email=$1`,
      [email],
    );
    if (checkIfUserExist.rows.length > 0) {
      return res.status(400).json({
        message: "user already exist ",
      });
    }

    //Phone number validator
    const checkIfNoExists = await pool.query(
      `
        SELECT * FROM users WHERE phone_number=$1
        `,
      [phone_number],
    );
    if (checkIfNoExists.rows === phone_number) {
      return res.status(400).json({
        message: "Sorry can't have number duplicates ",
      });
    }

    //Hashing the password to secure it
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // After hashing we try inserting the data to the users table
    const insertUser = await pool.query(
      `
        INSERT INTO users (name,email,password,role_id,date_of_birth,location,county,phone_number)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, name,email,role_id`,
      [
        name,
        email,
        hashPassword,
        role_id,
        date_of_birth,
        location,
        county,
        phone_number,
      ],
    );

    //If registration fails
    if (insertUser.rows.length === 0) {
      return res.status(400).json({
        message: "Failed to register user",
      });
    }

    //If it passes do this === give a user their token

    const results = insertUser.rows[0];
    generateAccessToken(res, results.id, results.role_id);

    //success at last
    return res.status(201).json({
      message: "User created successfully",
      data: results,
    });
  } catch (error) {
    //if everything fails hope it does not
    next(error);
  }
};

//Login user
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const userQuery = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    const user = userQuery.rows[0];
    //console.log("User from Database:", user);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User does not exist. Please register." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    //console.log("Token being generated for:", user.id, "with role:", user.role_id);
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
    //We need immeadiately invalidate the access token and  the refresh token
    /**make it empty by using the "" Quotes*/
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
