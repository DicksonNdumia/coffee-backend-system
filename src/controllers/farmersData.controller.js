import pool from "../config/db.config.js";

// CREATE TABLE farmers_data (
//     id SERIAL PRIMARY KEY,

//     farmer_id INTEGER REFERENCES farmers_profile(id) ON DELETE SET NULL,
//     season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
//     delivery_session_id INTEGER REFERENCES delivery_sessions(id),

//     quantity INTEGER NOT NULL CHECK (quantity > 0),
//     grade VARCHAR(50),

//     delivery_date DATE DEFAULT CURRENT_DATE,

//     created_at TIMESTAMP DEFAULT NOW()
// );

export const recordFarmersData = async (req, res, next) => {
    try {

        const { farmer_no } = req.params;

        const { delivery_session_id, quantity, grade } = req.body;

        //  validation
        if ( !delivery_session_id || !quantity) {
            return res.status(400).json({
                message: "Missing required fields",
            });
        }

        if (isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({
                message: "Quantity must be a number greater than 0",
            });
        }

        //  get farmer
        const farmerResult = await pool.query(
            `SELECT id FROM farmers_profile WHERE farmer_no = $1`,
            [farmer_no]
        );

        if (farmerResult.rows.length === 0) {
            return res.status(404).json({
                message: "Farmer not found",
            });
        }

        const farmer_id = farmerResult.rows[0].id;

        //  get session
        const sessionResult = await pool.query(
            `SELECT id, season_id, status FROM delivery_sessions WHERE id = $1`,
            [delivery_session_id]
        );

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({
                message: "Session not found",
            });
        }

        const session = sessionResult.rows[0];

        //  check session status
        if (session.status !== "OPEN") {
            return res.status(400).json({
                message: "Session is not open for delivery",
            });
        }


        const season_id = session.season_id;

        // prevent duplicate delivery same session
        const existingDelivery = await pool.query(
            `SELECT id FROM farmers_data
             WHERE farmer_id = $1 AND delivery_session_id = $2`,
            [farmer_id, delivery_session_id]
        );

        if (existingDelivery.rows.length > 0) {
            return res.status(400).json({
                message: "You have already recorded delivery for this session",
            });
        }

        // ✅ insert
        const insert = await pool.query(
            `INSERT INTO farmers_data 
       (farmer_id, season_id, delivery_session_id, quantity, grade) 
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [farmer_id, season_id, delivery_session_id, quantity, grade]
        );

        return res.status(201).json({
            message: "Delivery recorded successfully",
            data: insert.rows[0],
        });

    } catch (error) {
        next(error);
    }
};
export const getFarmersData = async (req, res, next) => {
    try {
        const { farmer_no } = req.params;

        if (!farmer_no) {
            return res.status(400).json({
                message: "Farmer number is required",
            });
        }



        // 🔥 get farmer internal ID first
        const farmerResult = await pool.query(
            `SELECT id, farmer_no FROM farmers_profile WHERE farmer_no = $1`,
            [farmer_no]
        );

        if (farmerResult.rows.length === 0) {
            return res.status(404).json({
                message: "Farmer not found",
            });
        }

        const farmer_id = farmerResult.rows[0].id;

        // 🔥 get all deliveries for this farmer
        const deliveries = await pool.query(
            `
                SELECT
                    fd.id,
                    fd.quantity,
                    fd.grade,
                    fd.delivery_date,
                    fd.created_at,

                    s.year AS season_year,
                    ds.delivery_date AS session_date,
                    ds.status AS session_status

                FROM farmers_data fd
                         LEFT JOIN delivery_sessions ds
                                   ON ds.id = fd.delivery_session_id
                         LEFT JOIN seasons s
                                   ON s.id = ds.season_id

                WHERE fd.farmer_id = $1
                ORDER BY fd.created_at DESC
            `,
            [farmer_id]
        );

        return res.status(200).json({
            farmer_no,
            total_deliveries: deliveries.rows.length,
            data: deliveries.rows,
        });

    } catch (error) {
        next(error);
    }
};
export const getFarmerPayout = async (req, res, next) => {
    try {
        const { farmer_no } = req.params;
        const { season_id } = req.query;

        if (!farmer_no || !season_id) {
            return res.status(400).json({
                message: "farmer_no and season_id are required",
            });
        }

        // 1. get farmer id
        const farmerResult = await pool.query(
            `SELECT id FROM farmers_profile WHERE farmer_no = $1`,
            [farmer_no]
        );

        if (farmerResult.rows.length === 0) {
            return res.status(404).json({
                message: "Farmer not found",
            });
        }

        const farmer_id = farmerResult.rows[0].id;

        // 2. get season pricing
        const seasonResult = await pool.query(
            `SELECT price_per_kg, factory_deduction 
       FROM seasons 
       WHERE id = $1`,
            [season_id]
        );

        if (seasonResult.rows.length === 0) {
            return res.status(404).json({
                message: "Season not found",
            });
        }

        const { price_per_kg, factory_deduction } = seasonResult.rows[0];

        // 3. get total kg
        const totalResult = await pool.query(
            `SELECT COALESCE(SUM(quantity), 0) AS total_kg
       FROM farmers_data
       WHERE farmer_id = $1 AND season_id = $2`,
            [farmer_id, season_id]
        );

        const total_kg = parseFloat(totalResult.rows[0].total_kg);

        // 4. compute payout
        const net_price = price_per_kg - factory_deduction;
        const total_payout = total_kg * net_price;

        return res.status(200).json({
            farmer_no,
            season_id,
            total_kg,
            price_per_kg,
            factory_deduction,
            net_price_per_kg: net_price,
            total_payout,
        });

    } catch (error) {
        next(error);
    }
};
export const updateFarmerData = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { farmer_no } = req.query;
        const { delivery_session_id, quantity, grade } = req.body;

        // 🔒 Only admin allowed
        if (!req.user || req.user.role_id !== 1) {
            return res.status(403).json({
                message: "Only admin can update farmer data",
            });
        }

        if (!id) {
            return res.status(400).json({
                message: "Delivery record id is required",
            });
        }

        if (!farmer_no) {
            return res.status(400).json({
                message: "farmer_no is required",
            });
        }

        // validate quantity (only if provided)
        if (quantity !== undefined && (isNaN(quantity) || quantity <= 0)) {
            return res.status(400).json({
                message: "Quantity must be a number greater than 0",
            });
        }

        // get farmer_id
        const farmerResult = await pool.query(
            `SELECT id FROM farmers_profile WHERE farmer_no = $1`,
            [farmer_no]
        );

        if (farmerResult.rows.length === 0) {
            return res.status(404).json({
                message: "Farmer not found",
            });
        }

        const farmer_id = farmerResult.rows[0].id;

        // ensure record exists
        const checkIfExist = await pool.query(
            `SELECT * FROM farmers_data WHERE id = $1 AND farmer_id = $2`,
            [id, farmer_id]
        );

        if (checkIfExist.rows.length === 0) {
            return res.status(404).json({
                message: "Delivery not found",
            });
        }

        // validate session if updating
        if (delivery_session_id) {
            const sessionResult = await pool.query(
                `SELECT id, status FROM delivery_sessions WHERE id = $1`,
                [delivery_session_id]
            );

            if (sessionResult.rows.length === 0) {
                return res.status(404).json({
                    message: "Session not found",
                });
            }

            if (sessionResult.rows[0].status !== "OPEN") {
                return res.status(400).json({
                    message: "Session is not open for delivery",
                });
            }
        }

        // update
        const updateDeliveryData = await pool.query(
            `UPDATE farmers_data
             SET
                 delivery_session_id = COALESCE($1, delivery_session_id),
                 quantity = COALESCE($2, quantity),
                 grade = COALESCE($3, grade)
             WHERE id = $4
                 RETURNING *`,
            [delivery_session_id, quantity, grade, id]
        );

        return res.status(200).json({
            message: "Farmer Data Updated",
            data: updateDeliveryData.rows[0],
        });

    } catch (error) {
        next(error);
    }
};
