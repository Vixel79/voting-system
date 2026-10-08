const express = require('express');

const cors = require('cors');

const helmet = require('helmet');

const compression = require('compression');

const morgan = require('morgan');

const cookieParser = require('cookie-parser');

const env = require('./config/env');

const publicRoutes = require('./routes/publicRoutes');

const adminRoutes = require('./routes/adminRoutes');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

const corsOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes('*')) {
        return callback(null, true);
      }

      if (corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(compression());

app.use(express.json({ limit: '10kb' }));

app.use(cookieParser());

if (env.nodeEnv !== 'test') {
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
}

app.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));

app.use('/api', publicRoutes);

app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

module.exports = app;