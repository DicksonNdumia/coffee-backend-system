import pool from "../config/db.config.js";

import cloudinary from "../config/cloudinaryConfig.js";
import fs from "fs";
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

export const createAnnouncement = async (req, res, next) => {
  try {
    if (!req.user || req.user?.role_id !== 1) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const created_by = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        error: "Missing required field",
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "Library",
    });

    const insertIntoAnnouncement = await pool.query(
      `INSERT INTO public.announcements (title,description,image_url,created_by)
VALUES ($1,$2,$3,$4)
RETURNING *
`,
      [title, description, result.secure_url, created_by],
    );

    if (insertIntoAnnouncement.rows.length === 0) {
      return res.status(400).json({
        message: "Failed to add the announcement",
      });
    }

    const announcementRes = insertIntoAnnouncement.rows[0];

    return res.status(201).json({
      message: "Successfully added the announcement",
      data: announcementRes,
    });
  } catch (error) {
    next(error);
  }
};
export const getAnnouncements = async (req, res, next) => {
  try {
    const getAnnouncement = await pool.query(
      `SELECT * FROM public.announcements `,
    );

    if (getAnnouncement.rows.length === 0) {
      return res.status(404).json({
        message: "Announcements not found!",
      });
    }

    const result = getAnnouncement.rows;

    return res.status(200).json({
      message: "Announcements fetched successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const getAnnouncementById = async (req, res, next) => {
  try {
    const parsedId = req.params.id;
    if (!parsedId) {
      return res.status(400).json({
        message: "Please input a valid id",
      });
    }

    const checkIfIdExists = await pool.query(
      `SELECT * FROM public.announcements WHERE id=$1`,
      [parsedId],
    );

    if (checkIfIdExists.rows.length === 0) {
      return res.status(404).json({
        message: "Announcement not found!",
      });
    }

    const result = checkIfIdExists.rows[0];

    return res.status(200).json({
      message: "Announcement fetched successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteAnnouncement = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const parsedId = parseInt(req.params.id);
    const created_by = req.user.id;
    if (isNaN(parsedId)) {
      return res.status(400).json({
        message: "Please input a valid id",
      });
    }

    // Check ownership
    const validity = await pool.query(
      `SELECT id FROM public.announcements WHERE id=$1 AND created_by=$2`,
      [parsedId, created_by],
    );

    if (validity.rows.length === 0) {
      return res.status(403).json({
        message: "You can't delete this announcement",
      });
    }

    const deleteAnnouncement = await pool.query(
      `DELETE FROM public.announcements WHERE id=$1 AND announcements.created_by=$2 RETURNING *`,
      [parsedId, created_by],
    );

    const result = deleteAnnouncement.rows[0];

    return res.status(200).json({
      message: "Announcement deleted successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const updateAnnouncement = async (req, res, next) => {
  try {
    // Auth first
    if (!req.user || req.user.role_id !== 1) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parsedId = parseInt(req.params.id);
    const created_by = req.user.id;

    if (isNaN(parsedId)) {
      return res.status(400).json({
        message: "Please input a valid id",
      });
    }

    // Get existing (with ownership)
    const existingQuery = await pool.query(
      `SELECT * FROM public.announcements WHERE id=$1 AND created_by=$2`,
      [parsedId, created_by],
    );

    if (existingQuery.rows.length === 0) {
      return res.status(403).json({
        message: "Not found or not yours",
      });
    }

    const existingAnnouncement = existingQuery.rows[0];

    const { title, description } = req.body;

    let imageUrl = existingAnnouncement.image_url;
    let publicId = existingAnnouncement.image_public_id;

    // Handle image update
    if (req.file) {
      const imageResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "Library",
      });

      // delete old image
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }

      imageUrl = imageResult.secure_url;
      publicId = imageResult.public_id;

      fs.unlinkSync(req.file.path);
    }

    // Update with ownership enforced
    const finalUpdate = await pool.query(
      `UPDATE public.announcements SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        image_url = $3,
        image_public_id = $4,
        updated_at = NOW()
       WHERE id = $5 AND created_by = $6
       RETURNING *`,
      [title, description, imageUrl, publicId, parsedId, created_by],
    );

    return res.status(200).json({
      message: "Announcement updated successfully",
      data: finalUpdate.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
