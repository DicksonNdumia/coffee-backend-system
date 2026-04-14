import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token expired or invalid" });
  }
};

export const isAdmin = (req, res, next) => {
  //console.log("Current User Data from Token:", req.user);
  if (req.user && req.user.role_id === 1) {
    next(); // They are admin! Move to the next function.
  } else {
    return res.status(403).json({
      success: false,
      message: "Access Denied: You do not have admin privileges.",
    });
  }
};

export const isDirector = (req, res, next) => {
  if (req.user && req.user.role_id === 2) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access Denied: You do not have moderator privileges.",
    });
  }
};
export const isFarmer = (req, res, next) => {
  if (req.user && req.user.role_id === 3) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access Denied is only users who have this right",
    });
  }
};

export const isFarmerOrIsDirector = (req, res, next) => {
  if ((req.user && req.user.role_id === 2) || 3) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access Denied",
    });
  }
};

export const DirectorOrAdmin = (req, res, next) => {
  if ((req.user && req.user.role_id === 1) || 2) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access Denied You are not an Admin or a moderator",
    });
  }
};
