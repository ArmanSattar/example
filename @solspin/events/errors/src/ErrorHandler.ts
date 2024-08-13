import { Response } from "express";
import { CustomError } from "./CustomError";

export function errorHandler(err: Error, res: Response) {
  console.log(err.message);
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({ errors: err.serializeErrors() }).send();
    return;
  }

  res.status(500).json({ message: "Something went wrong..." }).send();
}
