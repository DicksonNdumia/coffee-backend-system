import pool from "../config/db.config.js";



export const createSeason = async (req, res, next) => {
  try {
    const { name, start_date, end_date, year } = req.body;

    if (!name || !start_date || !end_date || !year) {
      return res.status(400).json({
        message: "Please input all required fields!",
      });
    }

    //  one season per year
    const existing = await pool.query(
      `SELECT id FROM seasons WHERE year = $1`,
      [year],
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "Season for this year already exists!",
      });
    }

    const insertSeason = await pool.query(
      `INSERT INTO seasons (name, start_date, end_date, year)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, start_date, end_date, year`,
      [name, start_date, end_date, year],
    );

    return res.status(201).json({
      message: "Season created successfully",
      data: insertSeason.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
export const getAllSeasons = async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT * FROM seasons ORDER BY year DESC`);

    return res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};
export const getSeasonByYear = async (req, res, next) => {
  try {
    const { year } = req.params;

    const result = await pool.query(`SELECT * FROM seasons WHERE year = $1`, [
      year,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Season not found",
      });
    }

    return res.status(200).json({
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
export const updateSeasonPricing = async (req, res, next) => {
  try {
    const { year } = req.params;
    const { price_per_kg, factory_deduction } = req.body;

    const result = await pool.query(
      `UPDATE seasons 
       SET price_per_kg = $1, factory_deduction = $2
       WHERE year = $3
       RETURNING *`,
      [price_per_kg, factory_deduction, year],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Season not found",
      });
    }

    return res.status(200).json({
      message: "Season pricing updated",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
export const closeSeason = async (req, res, next) => {
  try {
    const { year } = req.params;

    const result = await pool.query(
      `UPDATE seasons 
       SET is_closed = TRUE
       WHERE year = $1
       RETURNING *`,
      [year],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Season not found",
      });
    }

    return res.status(200).json({
      message: "Season closed successfully",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

