
import createError from 'http-errors';
import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'node:path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';

const app = express();

// View engine setup
app.set('views', path.join(process.cwd(), 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Catch 404
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(createError(404));
});

// Error handler
app.use((
  err: { status?: number; message?: string },
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  res.locals.message = err.message ?? 'Internal Server Error';
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status ?? 500);
  res.render('error');
});

export default app;
