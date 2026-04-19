import pool from "../config/db.config.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        -- total users
        (SELECT COUNT(*) FROM users) AS total_users,

        -- total farmers
        (SELECT COUNT(*) FROM farmers_profile) AS total_farmers,

        -- open seasons
        (SELECT COUNT(*) FROM seasons WHERE status = 'OPEN') AS open_seasons,

        -- total delivery sessions
        (SELECT COUNT(*) FROM delivery_sessions) AS total_sessions,

        -- total coffee (kg)
        (SELECT COALESCE(SUM(quantity), 0) FROM farmers_data) AS total_coffee_kg,

        -- total farmer payout
        (
          SELECT COALESCE(SUM(fd.quantity * (s.price_per_kg - s.factory_deduction)), 0)
          FROM farmers_data fd
          JOIN seasons s ON fd.season_id = s.id
        ) AS total_farmer_payout
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Dashboard data not found",
      });
    }
    const data = result.rows[0];

    res.status(200).json({
      total_users: parseInt(data.total_users),
      total_farmers: parseInt(data.total_farmers),
      open_seasons: parseInt(data.open_seasons),
      total_sessions: parseInt(data.total_sessions),
      total_coffee_kg: parseInt(data.total_coffee_kg),
      total_farmer_payout: parseInt(data.total_farmer_payout),
    });
  } catch (error) {
    next(error);
  }
};
