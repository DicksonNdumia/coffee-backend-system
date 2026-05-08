import { error } from "@actions/core";
import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 100 requests per windowMs
  handler: (req, res, next) => {
    res.status(429).json({
      error: "Too Many Requests",
      message: "You have exceeded the rate limit. Please try again later.",
      retryAfter: req.rateLimit.resetTime,
    });
  },
});
