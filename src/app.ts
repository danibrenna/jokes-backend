import express, { Response as ExResponse,
  Request as ExRequest,
  NextFunction} from 'express';
import {resolve} from 'path';
import 'dotenv/config';
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import { RegisterRoutes } from "../build/routes";
import { createLogger, format, transports, Logger } from 'winston';

const { combine, timestamp, label, printf } = format;
import DailyRotateFile from 'winston-daily-rotate-file';
import { ValidateError } from 'tsoa';

export const app = express();
app.use(cors());

/* log settings */
var logArray = new Array();
logArray.push(new (transports.Console)());
if (process.env.LOG_WRITE_ENABLED === "true") {
  switch (process.env.LOG_LEVEL) {
    case 'info' : {
      logArray.push(new DailyRotateFile({
        filename: resolve(__dirname, process.env.LOG_INFO_FILENAME || ""),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'info'
      }));
      logArray.push(new DailyRotateFile({
        filename: resolve(__dirname, process.env.LOG_ERROR_FILENAME || ""),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error'
      }));
      break;
    }
    case 'error' : {
      logArray.push(new DailyRotateFile({
          filename: resolve(__dirname, process.env.LOG_ERROR_FILENAME || ""),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'error'
      }));
      break;
    }
    default: {
      var transport = new DailyRotateFile({
        filename: resolve(__dirname, process.env.LOG_INFO_FILENAME || ""),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false,
        maxSize: '20m',
        maxFiles: '14d',
        level: process.env.LOG_LEVEL
      })
    
      logArray.push(transport);
      logArray.push(new (transports.File)({ filename: resolve(__dirname, process.env.LOG_INFO_FILENAME || "") }));
      break;
    }
  }
}

const logFormat = printf(({ level, message, timestamp }) => {
  return `${level.toUpperCase()} ${timestamp} ${message}`;
});

const logger:Logger = createLogger({
  transports: logArray,
  exceptionHandlers: logArray,
  format:combine(
    timestamp({
      format: 'DD-MM-YYYY HH:mm:ss'
    }),
    logFormat
  )
});

declare global {
  namespace NodeJS {
    interface Global {
      logger: Logger;
      passport: any;
    }
  }
}

global.logger = logger;

// inizializzo helmet
app.use(helmet())

app.use(function(req, res, next) {
  process.on('unhandledRejection', (reason: Error, p) => {
    logger.error(reason.stack || "", 'Unhandled Rejection at Promise', p);
    return res.status(500).send(reason.message);
  });
  let logMessage = "CALLED API " + req.method + " " + req.path;
  if (req.params != null) {
    logMessage += " PARAMS " + JSON.stringify(req.params);
  }
  if (req.body != null) {
    logMessage += " BODY " + JSON.stringify(req.body);
  }
  if (req.query != null) {
    logMessage += " QUERY PARAMS " + JSON.stringify(req.query);
  }
  global.logger.info(logMessage)
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(bodyParser.json({limit: "10mb"})); // for parsing application/json
app.use(bodyParser.urlencoded({extended: false}));

/** routes */
RegisterRoutes(app);

app.use(function errorHandler(
  err: unknown,
  req: ExRequest,
  res: ExResponse,
  next: NextFunction
): ExResponse | void {
  if (err instanceof ValidateError) {
    logger.error(`Caught Validation Error for ${req.path}:` + JSON.stringify(err.fields));
    return res.status(422).json({
      success: false,
      message: "Validation Failed",
      details: err?.fields,
    });
  } else if (err instanceof Error) {
    logger.error(`Caught Internal Server Error for ${req.path}: stack ` + err.stack);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }

  next();
});

app.use(function notFoundHandler(_req, res: ExResponse) {
  res.status(404).send({
    message: "Not Found",
  });
});