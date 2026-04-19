import pool from "../config/db.config.js";

export const addMinutes = async (req, res, next) => {
  try {
    const { meeting_id } = req.params;

    if (!meeting_id) {
      return res.status(400).send({
        message: "meetingId is required",
      });
    }

    //validate existence of meeting
    const checkIfMeetingExists = await pool.query(
      `SELECT * FROM meetings WHERE id = $1`,
      [meeting_id],
    );
    if (checkIfMeetingExists.rows.length === 0) {
      return res.status(404).json({
        message: "Meetings not found",
      });
    }

    //Destructuring the body request
    const {
      title,
      leader_present,
      leader_absent,
      members_present,
      members_absent,
      agenda_one,
      agenda_two,
      agenda_three,
      agenda_four,
      aob,
      presided_by,
    } = req.body;

    //Validating all the inputs are there
    if (
      !title ||
      !leader_present ||
      !leader_absent ||
      !members_present ||
      !members_absent ||
      !agenda_one ||
      !agenda_two ||
      !agenda_three ||
      !agenda_four ||
      !aob ||
      !presided_by
    ) {
      return res.status(400).send({
        message: "All fields are required",
      });
    }

    //Ensuring at least all three leaders have attended
    if (leader_present <= 5) {
      return res.status(400).json({
        message: "Leader present must be greater than 5",
      });
    }

    //Check if the members are at least ten
    if (members_present <= 10) {
      return res.status(400).json({
        message: "Members present must be greater than 10 members",
      });
    }

    //Check if the entered presided by is a number!
    if (typeof presided_by !== "number") {
      return res.status(400).json({
        message: "Presided_by must be a number",
      });
    }

    //Checking if minutes of a meeting already exists
    const checkIfMinutes = await pool.query(
      `SELECT *  FROM minutes WHERE meeting_id= $1`,
      [meeting_id],
    );

    //This helps avoid duplicates
    if (checkIfMinutes.rows.length > 0) {
      return res.status(400).json({
        message: "Minutes already exists",
      });
    }

    const insertIntoMinutes = await pool.query(
      `INSERT INTO minutes (meeting_id, title,leader_present,leader_absent,members_present,members_absent, agenda_one, agenda_two, agenda_three, agenda_four, aob, presided_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
RETURNING *`,
      [
        meeting_id,
        title,
        leader_present,
        leader_absent,
        members_present,
        members_absent,
        agenda_two,
        agenda_two,
        agenda_three,
        agenda_four,
        aob,
        presided_by,
      ],
    );

    if (insertIntoMinutes.rows.length === 0) {
      return res.status(400).send({
        message: "Minute not created",
      });
    }

    const results = insertIntoMinutes.rows[0];

    return res.status(201).json({
      message: "Minutes created",
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
export const getMinutes = async (req, res, next) => {
  try {
    const queryMinutes = await pool.query(`SELECT * FROM minutes`);

    if (queryMinutes.rows.length === 0) {
      return res.status(404).send({
        message: "Minutes not found",
      });
    }

    const result = queryMinutes.rows;
    return res.status(200).json({
      message: "Meetings  found",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const getMinuteById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({
        message: "Please input the id",
      });
    }

    if (typeof id === "number") {
      return res.status(400).send({
        message: "Id must be a number",
      });
    }

    const getMinute = await pool.query(`SELECT * FROM minutes WHERE id= $1`, [
      id,
    ]);

    if (getMinute.rows.length === 0) {
      return res.status(404).send({
        message: "Minute by id not found",
      });
    }

    const result = getMinute.rows[0];
    return res.status(200).json({
      message: "Minutes found",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteMinuteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send({
        message: "Please input the id",
      });
    }

    //check if meeting exist
    const checkIfExistMinutes = await pool.query(
      `SELECT * FROM minutes WHERE id= $1`,
      [id],
    );
    if (checkIfExistMinutes.rows.length === 0) {
      return res.status(400).send({
        message: "Minute not Found",
      });
    }

    //if it exists
    const deleteMinute = await pool.query(
      `DELETE FROM minutes WHERE id= $1 RETURNING *`,
      [id],
    );

    if (!deleteMinute) {
      return res.status(400).send({
        message: "Minute not deleted",
      });
    }

    const results = deleteMinute.rows[0];
    return res.status(200).json({
      message: "Minutes deleted",
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
export const updateMinuteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send({
        message: "Please input the id",
      });
    }

    const {
      title,
      leader_present,
      leader_absent,
      members_present,
      members_absent,
      agenda_one,
      agenda_two,
      agenda_three,
      agenda_four,
      aob,
      presided_by,
    } = req.body;

    const updateMinutes = `UPDATE minutes
             SET
                 title = COALESCE($1, title),
                 leader_present = COALESCE($2, leader_present),
                 leader_absent = COALESCE($3, leader_absent),
                 members_present = COALESCE($4, members_present),
                 members_absent = COALESCE($5, members_absent),
                 agenda_one = COALESCE($6, agenda_one),
                 agenda_two = COALESCE($7, agenda_two),
                 agenda_three = COALESCE($8, agenda_three),
                 agenda_four = COALESCE($9, agenda_four),
                 aob = COALESCE($10, aob),
                 presided_by = COALESCE($11, presided_by)
             WHERE id = $12
             RETURNING *;
                
                `;

    const finalUpdate = await pool.query(updateMinutes, [
      title,
      leader_present,
      leader_absent,
      members_present,
      members_absent,
      agenda_one,
      agenda_two,

      agenda_three,
      agenda_four,
      aob,
      presided_by,
      id,
    ]);

    if (finalUpdate.rows.length === 0) {
      return res.status(400).send({
        message: "Minute not Updated",
      });
    }

    const result = finalUpdate.rows[0];

    return res.status(200).json({
      message: "Minutes updated",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
