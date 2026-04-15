import pool from "../config/db.config.js";




export const createDeliverySession = async (req, res, next) => {
    try {
        const { season_id } = req.params;
        const { delivery_date, notes } = req.body;

        // 🔒 validate input
        if (!season_id) {
            return res.status(400).json({
                message: "Season ID is required",
            });
        }

        if (!delivery_date || !notes) {
            return res.status(400).json({
                message: "Please fill out all fields",
            });
        }

        const parsedSeasonId = parseInt(season_id);

        // ✅ check season exists
        const checkSeason = await pool.query(
            `SELECT id FROM seasons WHERE id = $1 AND is_closed = FALSE`,
            [parsedSeasonId]
        );

        if (checkSeason.rows.length === 0) {
            return res.status(400).json({
                message: "Season not found or already closed",
            });
        }

        // ❌ FIX: ensure uniqueness per season (not global date)
        const existingSession = await pool.query(
            `SELECT id FROM delivery_sessions
             WHERE season_id = $1 AND delivery_date = $2`,
            [parsedSeasonId, delivery_date]
        );

        if (existingSession.rows.length > 0) {
            return res.status(400).json({
                message: "Session already exists for this season on this date",
            });
        }

        // ✅ insert
        const createDelivery = await pool.query(
            `INSERT INTO delivery_sessions (season_id, delivery_date, notes)
             VALUES ($1, $2, $3)
                 RETURNING *`,
            [parsedSeasonId, delivery_date, notes]
        );

        return res.status(201).json({
            message: "Successfully created delivery session",
            data: createDelivery.rows[0],
        });

    } catch (error) {
        next(error);
    }
};
export const  getDeliverySession = async(req,res,next) => {
    const getDelivery_sessions = await pool.query(
        `SELECT * FROM delivery_sessions`,
    );

    const  results = getDelivery_sessions.rows;

    return res.status(200).json({
        message: "Successfully get delivery session",
        data : results

    });
}
export const closeDeliverySession = async (req, res, next) => {
    try {
        const { id } = req.params;

        // check the specific session
        const sessionCheck = await pool.query(
            `SELECT * FROM delivery_sessions WHERE id = $1`,
            [id]
        );

        if (sessionCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Session not found",
            });
        }

        const session = sessionCheck.rows[0];

        if (!session.is_open) {
            return res.status(400).json({
                message: "Delivery session is already closed",
            });
        }

        // now update
        const result = await pool.query(
            `UPDATE delivery_sessions 
       SET is_open = FALSE 
       WHERE id = $1 
       RETURNING *`,
            [id]
        );

        return res.status(200).json({
            message: "Successfully closed session",
            data: result.rows[0],
        });
    } catch (err) {
        next(err);
    }
};
export const deleteDeliverySession = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "No such session",
            });
        }

        //  check the specific session
        const sessionCheck = await pool.query(
            `SELECT * FROM delivery_sessions WHERE id = $1`,
            [id]
        );

        if (sessionCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Session not found",
            });
        }

        const session = sessionCheck.rows[0];

        // if still open → block delete
        if (session.is_open) {
            return res.status(400).json({
                message: "Session not closed yet, you can't delete",
            });
        }

        // ✅ delete only if closed
        const deleteResult = await pool.query(
            `DELETE FROM delivery_sessions 
       WHERE id = $1 
       RETURNING *`,
            [id]
        );

        return res.status(200).json({
            message: "Successfully deleted session",
            data: deleteResult.rows[0],
        });

    } catch (error) {
        next(error);
    }
};
