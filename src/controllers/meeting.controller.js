import pool from "../config/db.config.js";

// CREATE TABLE meetings (
//     id SERIAL PRIMARY KEY,
//     title VARCHAR(100) NOT NULL,
//     description TEXT NOT NULL,
//     attendance INTEGER DEFAULT 0,
//
//     created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
//
//     created_at TIMESTAMP DEFAULT NOW(),
//     updated_at TIMESTAMP DEFAULT NOW()
// );

export const createMeeting = async (req, res, next) => {
  try {
    const parsedCreatedBy = parseInt(req.user.id);

    if (!parsedCreatedBy) {
      return res.status(400).json({
        message: "The user should have an account",
      });
    }

    if (req.user.role_id !== 1) {
      return res.status(403).json({
        message: "Sorry you dont have permission",
      });
    }

    const { title, description, attendance } = req.body;

    if (!title || !description || !attendance) {
      return res.status(400).json({
        message: "Please enter the necessary fields",
      });
    }

    if (attendance <= 5) {
      return res.status(400).json({
        message: "Attendance must be greater than 5",
      });
    }

    const insert = await pool.query(
      `INSERT INTO public.meetings (title, description,attendance, created_by) VALUES ($1, $2,$3, $4)
RETURNING *
`,
      [title, description, attendance, parsedCreatedBy],
    );

    if (insert.rows.length === 0) {
      return res.status(400).json({
        message: "Failed to add the Meeting",
      });
    }

    const result = insert.rows[0];

    return res.status(201).json({
      message: "Successfully added the Meeting",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const getMeeting = async (req, res, next) => {
  try {
    const getMeeting = await pool.query(`SELECT * FROM public.meetings`);

    if (getMeeting.rows.length === 0) {
      return res.status(404).json({
        message: "Not Found",
      });
    }

    const results = getMeeting.rows;

    return res.status(200).json({
      message: "Successfully found the Meeting",
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
export const getMeetingById = async (req, res, next) => {
  try {
    const parsedId = req.params.id;
    if (!parsedId) {
      return res.status(400).json({
        message: "Please input a valid id",
      });
    }

    const checkIfIdExists = await pool.query(
      `SELECT * FROM public.meetings WHERE id=$1`,
      [parsedId],
    );

    if (checkIfIdExists.rows.length === 0) {
      return res.status(404).json({
        message: "Meeting not found!",
      });
    }

    const result = checkIfIdExists.rows[0];

    return res.status(200).json({
      message: "Meeting fetched successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteMeeting = async (req, res, next) => {
  try {
    const parsedId = req.params.id;
    const created_by = req.user.id;
    if (!parsedId) {
      return res.status(400).json({
        message: "Please input a valid id",
      });
    }

    //check validity
    const validity = await pool.query(
      `SELECT * FROM public.meetings WHERE id=$1 AND created_by=$2`,
      [parsedId, created_by],
    );
    if (validity.rows.length === 0) {
      return res.status(400).json({
        message: "Missing Or You can't delete Meeting",
      });
    }

    const deleteMeeting = await pool.query(
      `DELETE FROM public.meetings WHERE id=$1 RETURNING *`,
      [parsedId],
    );

    if (deleteMeeting.rows.length === 0) {
      return res.status(400).json({
        message: "Meeting not deleted!",
      });
    }

    const result = deleteMeeting.rows[0];

    return res.status(200).json({
      message: "Meeting deleted successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const updateMeeting = async (req, res, next) => {
  try {
    const parsedId = req.params.id;
    const created_by = req.user.id;
    if (!parsedId) {
      return res.status(400).json({
        message: "Please input a valid id",
      });
    }

    const checkIfMeetingExists = await pool.query(
      `SELECT * FROM public.meetings WHERE id=$1 AND created_by=$2`,
      [parsedId, created_by],
    );

    if (checkIfMeetingExists.rows.length === 0) {
      return res.status(400).json({
        message: "You can't update Meeting",
      });
    }

    const { title, description, attendance } = req.body;

    if (attendance <= 5) {
      return res.status(400).json({
        message: "Attendance must be greater than 5",
      });
    }
    const updateMeeting = `UPDATE public.meetings SET
            title = COALESCE($1,title),
            description = COALESCE($2,description),
            attendance = COALESCE($3,attendance),
            updated_at = NOW()
            WHERE id = $4
           RETURNING *
                           `;

    const finalUpdate = await pool.query(updateMeeting, [
      title,
      description,
      attendance,
      parsedId,
    ]);

    if (finalUpdate.rows.length === 0) {
      return res.status(400).json({
        message: "Announcement not Created!",
      });
    }

    return res.status(200).json({
      message: "Event updated Successfully",
      data: finalUpdate.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
