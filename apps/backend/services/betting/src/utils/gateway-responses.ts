/**
 * Creates a success response object with the specified data and status code.
 *
 * - Provides a consistent structure for success responses throughout the application.
 * - Allows for easy customisation of the status code, with a default value of 200 (OK).
 * - Serialises the response data to JSON format for compatibility and ease of consumption by clients.
 *
 * @param data The data to be included in the success response.
 * @param statusCode The HTTP status code for the success response (default: 200).
 * @returns The success response object.
 */
export const successResponse = (data: any, statusCode: number = 200) => {
  return {
    statusCode,
    body: JSON.stringify(data),
  };
};

/**
 * Creates an error response object with the specified error and status code.
 *
 * - Provides a consistent structure for error responses throughout the application.
 * - Allows for easy customisation of the status code, with a default value of 500 (Internal Server Error).
 * - Serialises the error message to JSON format for clear communication of the error to clients.
 * - Omits sensitive error details, such as stack traces, to avoid exposing unnecessary information.
 *
 * @param error The error object representing the encountered error.
 * @param statusCode The HTTP status code for the error response (default: 500).
 * @returns The error response object.
 */
export const errorResponse = (error: Error, statusCode: number = 500) => {
  return {
    statusCode,
    body: JSON.stringify({
      error: error.message,
    }),
  };
};
