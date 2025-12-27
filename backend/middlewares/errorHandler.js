const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Prisma validation error
  if (err.name === "PrismaClientValidationError") {
    return res.status(400).json({
      success: false,
      message: "Invalid data provided",
    });
  }

  // Prisma unique constraint error
  if (err.code === "P2002") {
    return res.status(400).json({
      success: false,
      message: "Duplicate field value entered",
    });
  }

  // Prisma record not found
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Record not found",
    });
  }

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File size too large. Maximum 10MB allowed",
    });
  }

  // Multer file type error
  if (err.message === "Only image files are allowed") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
