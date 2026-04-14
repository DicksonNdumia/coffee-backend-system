import chalk from "chalk";

export const myLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    // Status color
    const statusColor =
      res.statusCode >= 500
        ? chalk.red
        : res.statusCode >= 400
          ? chalk.yellow
          : res.statusCode >= 404
            ? chalk.red
            : res.statusCode >= 403
              ? chalk.red
              : chalk.green;

    // Method color
    const methodColor =
      req.method === "GET"
        ? chalk.blue
        : req.method === "POST"
          ? chalk.magenta
          : req.method === "PUT"
            ? chalk.cyan
            : req.method === "DELETE"
              ? chalk.red
              : chalk.white;

    console.log(
      `${methodColor(req.method)} ${chalk.white(`http://localhost:3000${req.url}`)} ` +
        statusColor(res.statusCode) +
        chalk.gray(` - ${duration}ms`),
    );
  });

  next();
};
