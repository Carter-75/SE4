// --- Environment and Dependencies ---
const path = require('path');
const fs = require('fs');
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const resolveEnvPath = () => {
  const candidates = [
    path.join(process.cwd(), '.env.local'), 
    path.join(process.cwd(), 'backend', '.env.local'),
    path.join(__dirname, '../.env.local')
  ];
  for (const c of candidates) { if (fs.existsSync(c)) return c; }
  return null;
};
const envPath = resolveEnvPath();
if (envPath) require('dotenv').config({ path: envPath });
else require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');

const app = express();

// --- Configuration ---
const isProd = process.env.PRODUCTION === 'true' || process.env.VERCEL === '1';
const prodUrl = process.env.PROD_FRONTEND_URL;
const PROJECT_NAME = process.env.PROJECT_NAME || 'Appointment-Booker';

// Trust proxy for secure cookies on Vercel
if (isProd) {
  app.set('trust proxy', 1);
}

// --- Models & Passport Config ---
require('./config/passport')(passport);

// --- Routers ---
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');

// --- Diagnostic Routes ---
app.get('/api/health', async (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'online',
    database: isConnected ? 'Connected' : 'Disconnected',
    env: isProd ? 'production' : 'development',
    timestamp: new Date().toISOString()
  });
});

// --- MongoDB Setup ---
const mongoURI = process.env.MONGODB_URI;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  if (!mongoURI) {
    console.warn('WARN: No MONGODB_URI found in environment!');
    return;
  }

  try {
    console.log('INFO: Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    console.log('OK: Connected to MongoDB');
  } catch (err) {
    console.error('ERROR: MongoDB Connection Failed:', err.message);
  }
};

// Initial connection
connectDB();

// --- Middlewares ---

// Wait for DB middleware
const dbCheck = async (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  if (mongoose.connection.readyState === 0) await connectDB();
  
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    if (mongoose.connection.readyState === 1) {
      clearInterval(interval);
      return next();
    }
    if (attempts >= 30) {
      clearInterval(interval);
      return res.status(503).json({ 
        error: 'Database connection timeout. Please refresh or check MONGODB_URI.' 
      });
    }
  }, 100);
};

app.use(helmet({
  frameguard: false,
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: true,
  credentials: true
}));

// Apply DB check to all /api routes
app.use('/api', dbCheck);

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax'
    }
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send(`API for ${PROJECT_NAME} is running`);
});

// Mount at both /api and root to handle Vercel Service prefix stripping
app.use('/api', indexRouter);
app.use('/', indexRouter);

app.use('/api/auth', authRouter);
app.use('/auth', authRouter);

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message,
    error: isProd ? {} : err
  });
});

module.exports = app;
