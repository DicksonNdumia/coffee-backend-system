import pool from "../config/db.config.js";
import cloudinaryConfig from "../config/cloudinaryConfig.js";
// CREATE TABLE announcements (
//     id SERIAL PRIMARY KEY,
//     title VARCHAR(100) NOT NULL,
//     image_url TEXT NOT NULL,
//     image_public_id TEXT,
//     description TEXT NOT NULL,
//
//     created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
//
//     created_at TIMESTAMP DEFAULT NOW(),
//     updated_at TIMESTAMP DEFAULT NOW()
// );

export const createAnnouncement = async (req, res,next) => {

    try
    {
        if (!req.user || req.user?.role_id !== 1) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const {created_by} = req.user.id;


        if(!req.file) {
            return res.status(400).json({
                error: 'No file uploaded'
            })
        }

        const {title,description} = req.body;

        if(!title || !description) {
            return res.status(400).json({
                error: 'Missing required field'
            })

        }

        const result = await cloudinaryConfig.upload(req.file.path, {
            folder: "Library"
        });

        const insertIntoAnnouncement = await pool.query(
            `INSERT INTO public.announcements (title,description,image_url,created_by)
VALUES ($1,$2,$3,$4)
RETURNING *
`,
            [title,description,description,result.secure_url,created_by]
        );

        if(insertIntoAnnouncement.rows.length === 0) {
            return res.status(400).json({
                message: "Failed to add the announcement"
            })
        }

        const announcementRes = insertIntoAnnouncement.rows[0];

        return  res.status(201).json({
            message:"Successfully added the announcement",
            data:announcementRes,
        })
    }
    catch (error) {
        next(error)
    }
}


