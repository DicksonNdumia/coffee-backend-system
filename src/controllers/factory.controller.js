import pool from "../config/db.config.js";


// CREATE TABLE factory_data (
//     id SERIAL PRIMARY KEY,
//
//     name VARCHAR(150) NOT NULL,
//     location VARCHAR(255),
//     email VARCHAR(100),
//     phone VARCHAR(20),
//
//     motto TEXT,
//     mission TEXT,
//
//     created_at TIMESTAMP DEFAULT NOW(),
//     updated_at TIMESTAMP DEFAULT NOW()
// );

export const factoryData = async (req, res, next) => {
    try {
        const  {name,location,email,phone,motto,mission} = req.body;

        if(!name || !location || !email || !phone || !motto || !mission) {
            return res.status(400).json({
                message: "Please fill every field"
            })
        }

        const  checkIfDataExists = await  pool.query(
            `
        SELECT * FROM public.factory_data WHERE name=$1`,
            [name]
        );

        if(checkIfDataExists.rows.length > 0) {
            return res.status(400).json({
                message: `Factory data already exists`
            })
        }

        const insertData = await pool.query(
            `INSERT INTO public.factory_data 
    (name, location, email, phone, motto, mission) 
VALUES ($1, $2, $3, $4,$5,$6) RETURNING *
`,[name,location,email,phone,motto,mission]
        );

        if(insertData.rows.length === 0) {
            return res.status(400).json({
                message: `Factory Data inserting failed`
            })
        }

        const result = insertData.rows[0];

        return res.status(201).json({
            message: `Factory Data inserted successfully`,
            data: result
        })
    } catch (error) {
        next(error)

    }

};
export const  getFactoryData = async (req, res, next) => {
    try {
        const checkFactory = await pool.query(
            `SELECT * FROM public.factory_data`
        );

        if(checkFactory.rows.length === 0) {
            return res.status(404).json({
                message: "Factory Data not found"

            })
        }

        const  result = checkFactory.rows;

        return res.status(200).json({
            message: `Factory Data fetched successfully`,
            data: result
        })

    }catch (error) {
        next(error)

    }
};
export const getFactoryDataById = async (req, res, next) => {
    try {
        const parsedId = parseInt(req.params.id);

        if(!parsedId) {
            return res.status(400).json({
                message: "Invalid Id data type or missing Id"
            })
        }

        const getResult = await pool.query(
            `SELECT * FROM public.factory_data WHERE id=$1 `,
            [parsedId]

        );

        if(getResult.rows.length === 0) {
            return res.status(404).json({
                message: "Factory Data not found"
            })
        }

        const  result = getResult.rows[0];
        return  res.status(200).json({
            message: "Factory data with id is here",
            data: result
        });
    }catch (error) {
        next(error);

    }
};
export const updateFactoryData = async (req, res, next) => {
  try {
      const parsedId = parseInt(req.params.id);
      if(!parsedId) {
          return res.status(400).json({
              message: "Invalid Id data type or missing Id"
          })
      }

      const checkIfDataExists = await  pool.query(
          `SELECT * FROM public.factory_data WHERE id=$1`,
          [parsedId]
      );

      if(checkIfDataExists.rows.length === 0) {
          return res.status(404).json({
              message: "Factory Data not found",
          })

      }

      const {name,location,email,phone,motto,mission} = req.body;

      const  updateData = await pool.query(
          `UPDATE public.factory_data 
SET 
name = COALESCE($1, name), 
location = COALESCE($2, location), 
email = COALESCE($3, email),
phone = COALESCE($4, phone),
motto = COALESCE($5, motto),
mission = COALESCE($6, mission),
updated_at = NOW()
WHERE id =$7
RETURNING *
`,
          [name,location,email,phone,motto,mission,parsedId]
      )

      if(updateData.rows.length === 0) {
          return res.status(400).json({
              message: `Factory Data not updated`,
          })
      }
      const result = updateData.rows[0]
      return res.status(200).json({
          message: `Factory Data updated successfully`,
          data: result
      })
  }catch (error) {
      next(error)
  }
}
