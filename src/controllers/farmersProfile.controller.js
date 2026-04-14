import pool from "../config/db.config.js";
// CREATE TABLE farmers_profile (
//     id SERIAL PRIMARY KEY,

//     farmer_no VARCHAR(50) UNIQUE NOT NULL, -- like 1333
//     user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
// );

export const createFarmerProfile = async (req, res, next) => {
  try {
    const { user_id, farmer_no } = req.body;

    if (!user_id || !farmer_no) {
      return res.status(400).json({
        message: "Please input the necessary fields!",
      });
    }
    const user = await pool.query(
      `SELECT id FROM users WHERE id=$1 AND role_id=3`,
      [user_id],
    );

    if (user.rows.length === 0) {
      return res.status(400).json({
        message: "User must exist and have farmer role",
      });
    }
    const existing = await pool.query(
      `SELECT id FROM farmers_profile WHERE user_id=$1 OR farmer_no=$2`,
      [user_id, farmer_no],
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "Farmer profile already exists",
      });
    }

    const insertFarmer = await pool.query(
      `INSERT INTO farmers_profile (farmer_no,user_id) 
       VALUES($1, $2) 
       RETURNING id, farmer_no,user_id`,
      [farmer_no, user_id],
    );

    return res.status(201).json({
      message: "Farmer created successfully!",
      data: insertFarmer.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
export const getFarmersProfiles = async (req, res, next) => {
  try {
    const userRes = await pool.query(`
      SELECT
        users.id,
        users.name AS farmer_name,
        users.email,
        users.location,
        users.county,
        users.phone_number,
        users.date_of_birth,
        farmers_profile.farmer_no
      FROM users
      INNER JOIN farmers_profile 
        ON users.id = farmers_profile.user_id
    `);

    const users = userRes.rows;

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
export const getFarmersProfilesById = async (req, res, next) => {
  try {
    const { farmer_no } = req.params;

    const userRes = await pool.query(
      `
      SELECT
        users.id,
        users.name AS farmer_name,
        users.email,
        users.location,
        users.county,
        users.phone_number,
        users.date_of_birth,
        farmers_profile.farmer_no
      FROM users
      INNER JOIN farmers_profile 
        ON users.id = farmers_profile.user_id
      WHERE farmers_profile.farmer_no = $1
      `,
      [farmer_no],
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({
        message: "Farmer not found",
      });
    }

    return res.status(200).json({
      message: "Farmer fetched successfully",
      data: userRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
export const deleteFarmerProfile = async (req, res, next) => {
  try {
    const { farmer_no } = req.params;

    if (!farmer_no) {
      return res.status(400).json({
        message: "Please provide farmer number",
      });
    }

    // Check if farmer exists
    const checkFarmer = await pool.query(
      `SELECT id FROM farmers_profile WHERE farmer_no = $1`,
      [farmer_no],
    );

    if (checkFarmer.rows.length === 0) {
      return res.status(404).json({
        message: "Farmer not found",
      });
    }

    //  Delete farmer profile
    const deleted = await pool.query(
      `DELETE FROM farmers_profile 
       WHERE farmer_no = $1
       RETURNING id, farmer_no, user_id`,
      [farmer_no],
    );

    return res.status(200).json({
      message: "Farmer deleted successfully",
      data: deleted.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
