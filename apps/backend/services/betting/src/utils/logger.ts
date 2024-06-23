/**
 * Enum representing the available log levels.
 *
 * - Allows for clear categorisation and differentiation of log messages based on their severity or importance.
 * - Provides a standardised set of log levels to ensure consistency across the application.
 */
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

/**
 * Interface defining the structure of a logger instance.
 *
 * - Specifies the contract that a logger instance must adhere to.
 * - Ensures that all logger instances have the necessary methods for logging messages at different levels.
 */
export interface Logger {
  /**
   * Logs a debug message with optional metadata.
   *
   * - Used for detailed debugging information that is typically not needed in production.
   * - Allows for attaching additional metadata to provide more context about the log entry.
   *
   * @param message The message to be logged.
   * @param metadata Optional metadata related to the log entry.
   */
  debug(message: string, metadata?: Record<string, unknown>): void;

  /**
   * Logs an info message with optional metadata.
   *
   * - Used for general information about the application's execution flow.
   * - Helps in understanding the state and progress of the application.
   *
   * @param message The message to be logged.
   * @param metadata Optional metadata related to the log entry.
   */
  info(message: string, metadata?: Record<string, unknown>): void;

  /**
   * Logs a warning message with optional metadata.
   *
   * - Used for non-critical issues or unusual situations that may require attention.
   * - Helps in identifying potential problems or areas that need investigation.
   *
   * @param message The message to be logged.
   * @param metadata Optional metadata related to the log entry.
   */
  warn(message: string, metadata?: Record<string, unknown>): void;

  /**
   * Logs an error message with optional metadata.
   *
   * - Used for critical errors or exceptions that prevent normal execution of the application.
   * - Helps in identifying and debugging issues that require immediate attention.
   *
   * @param message The message to be logged.
   * @param metadata Optional metadata related to the log entry.
   */
  error(message: string, metadata?: Record<string, unknown>): void;
}

/**
 * Creates a logger instance with the specified name and log level.
 *
 * - Allows for creating multiple logger instances with different names and log levels.
 * - Provides flexibility in controlling the verbosity of logging for different parts of the application.
 *
 * @param name The name of the logger instance.
 * @param level The minimum log level for the logger (default: INFO).
 * @returns The logger instance.
 */
export const getLogger = (name: string, level: LogLevel = LogLevel.INFO): Logger => {
  /**
   * Logs a message with the specified log level, message, and metadata.
   *
   * - Checks if the log level of the message meets the minimum level requirement set for the logger.
   * - Generates a timestamp to provide temporal context for the log entry.
   * - Stringifies the metadata, if provided, to include additional information related to the log entry.
   * - Logs the formatted log entry to the console for visibility and debugging purposes.
   *
   * @param logLevel The log level of the message.
   * @param message The message to be logged.
   * @param metadata Optional metadata related to the log entry.
   */
  const log = (logLevel: LogLevel, message: string, metadata?: Record<string, unknown>) => {
    if (Object.values(LogLevel).indexOf(logLevel) >= Object.values(LogLevel).indexOf(level)) {
      const timestamp = new Date().toISOString();
      const metadataString = metadata ? ` ${JSON.stringify(metadata)}` : "";
      console.log(
        `[${timestamp}] [${logLevel.toUpperCase()}] [${name}] ${message}${metadataString}`
      );
    }
  };

  return {
    debug: (message: string, metadata?: Record<string, unknown>) =>
      log(LogLevel.DEBUG, message, metadata),
    info: (message: string, metadata?: Record<string, unknown>) =>
      log(LogLevel.INFO, message, metadata),
    warn: (message: string, metadata?: Record<string, unknown>) =>
      log(LogLevel.WARN, message, metadata),
    error: (message: string, metadata?: Record<string, unknown>) =>
      log(LogLevel.ERROR, message, metadata),
  };
};
