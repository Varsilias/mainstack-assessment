import express, { NextFunction, Request, Response } from "express";
import { EnvConfig } from "./config/env.config";
import { HttpStatus } from "./enums";
import { logger } from "./config/logger.config";
import { v1Routes } from "./v1/modules/route-index";
import cors from "cors";
import bodyParser from "body-parser";
import { connect } from "./database/mongo";

const app = express();

const config = new EnvConfig();

connect(config.DB_URL);

app.use(cors());
app.use(bodyParser.urlencoded({ limit: "15mb", extended: true }));
app.use(bodyParser.json({ limit: "15mb" }));
app.use(bodyParser.raw({ limit: "45mb" }));

app.get("/health-check", (req, res) => {
  res.send("All Systems Up");
});

app.use("/api/v1", v1Routes);

// eslint-disable-next-line  @typescript-eslint/no-unused-vars
app.use(async (error: any, __: Request, res: Response, _: NextFunction) => {
  logger.error(
    `[MainstackException] - [ExceptionHandler] --> [Location]: "${error.errorCode}" ---- ${error.customMessage}`,
  );
  res.status(error.statusCode).json({
    status: false,
    message: error.customMessage,
    details: {
      type: error.errorCode,
      detail: error.data,
    },
  });
});

app.get("*", function (_, res) {
  res
    .status(HttpStatus.NOT_FOUND)
    .json({ message: "Resource not found, check the URL or REQUEST METHOD and try again" });
});

export default app;
