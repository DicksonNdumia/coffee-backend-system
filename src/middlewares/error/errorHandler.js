import chalk from "chalk";

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  console.error(chalk.blue(`[Error] ${err.message}`));

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
