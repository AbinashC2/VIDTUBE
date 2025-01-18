import mongoose from "mongoose"; // Import mongoose correctly
import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  let error = err;

  // If the error is not an instance of ApiError, create one
  if (!(error instanceof ApiError)) {
    const statusCode = error instanceof mongoose.Error ? 400 : 500; // Use mongoose.Error
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error.errors || [], error.stack);
  }

  // Ensure statusCode is set
  const statusCode = error.statusCode || 500;

  // Prepare the response object
  const response = {
    message: error.message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  // Send the response
  res.status(statusCode).json(response);
};

export { errorHandler };
