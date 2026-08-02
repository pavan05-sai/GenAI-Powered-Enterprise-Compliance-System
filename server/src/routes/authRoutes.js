import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'compliancegraph_secret';

// Helper: check if MongoDB is connected
function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database not connected. Please configure MongoDB URI in server/.env to enable registration.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'Compliance Officer'
    });

    const token = jwt.sign(
      { userId: user._id.toString(), name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || ''
      },
      token
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Failed to register user.' });
  }
});

// Login — real DB-backed authentication, no hardcoded demo bypass
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (!isDbConnected()) {
      return res.status(503).json({
        error: 'Database not connected. Please configure MONGODB_URI in server/.env to enable full authentication.'
      });
    }

    // Real DB authentication
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || ''
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server authentication error.' });
  }
});

// GET /api/auth/me — decode token and return actual user data
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided. Please sign in.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Token invalid or expired. Please sign in again.' });
    }

    // If DB is connected, fetch freshest user data from DB
    if (isDbConnected() && decoded.userId !== 'usr_demo_001') {
      const user = await User.findById(decoded.userId).select('-passwordHash');
      if (!user) {
        return res.status(401).json({ error: 'User not found.' });
      }
      return res.json({
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl || ''
        }
      });
    }

    // Fallback: return data embedded in the token itself
    return res.json({
      user: {
        id: decoded.userId,
        name: decoded.name || 'Riya Sharma',
        email: decoded.email,
        role: decoded.role || 'Compliance Officer',
        avatarUrl: ''
      }
    });
  } catch (err) {
    console.error('/me error:', err);
    return res.status(401).json({ error: 'Authentication failed.' });
  }
});

export default router;
