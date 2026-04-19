import pool from "../config/db.config.js";
import { generateAccessToken } from "../helper/utils/generateToken.js";
import bcrypt from "bcryptjs";

//Most of these actions are to be done by the admin
//get users
export const getAllUsers = async (req, res, next) => {
  try {
    const { role_id } = req.user;

    // Only allow admin (assuming 1 = admin)
    if (role_id !== 1) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const userDetails = await pool.query(`
      SELECT 
        users.id, 
        users.name AS user_name, 
        users.email,
        users.role_id, 
        roles.name AS role_name
      FROM users 
      LEFT JOIN roles ON users.role_id = roles.id
    `);

    const users = userDetails.rows;

    if (users.length === 0) {
      return res.status(404).json({
        message: "No users found in the database",
      });
    }

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
//delete users
export const deleteUsers = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "missing Id",
      });
    }

    const { role_id } = req.user;

    // Only allow admin (assuming 1 = admin)
    if (role_id !== 1) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    //if user is found continue
    const deleteUser = await pool.query(
      `DELETE FROM  users WHERE id=$1 RETURNING id,role_id,name,email`,
      [id],
    );
    if (!deleteUser) {
      return res.status(400).json({
        message: "Failed to delete users",
      });
    }
    const result = deleteUser.rows[0];

    return res.status(200).json({
      message: "User deleted Successfully",
      user: result,
    });
  } catch (error) {
    next(error);
  }
};
//get user by id
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "missing Id",
      });
    }

    const { role_id } = req.user;

    // Only allow admin (assuming 1 = admin)
    if (role_id !== 1) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    //Bring back the user using the id
    const getUser = await pool.query(`SELECT * FROM users WHERE id=$1  `, [id]);
    const result = getUser.rows[0];

    res.status(200).json({
      message: "Your User is here",
      data: {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role_id,
        age: result.age,
      },
    });
  } catch (error) {
    next(error);
  }
};
//admin add users
export const addUser = async (req, res, next) => {
  try {
    if (req.user.role_id !== 1) {
      return res.status(403).json({ message: "Unauthorized" });
    }

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
        message: "Failed to add user",
      });
    }

    //If it passes do this === give a user their token

    const results = insertUser.rows[0];
    generateAccessToken(res, results.id, results.role_id);

    //success at last
    return res.status(201).json({
      message: "User added successfully",
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
