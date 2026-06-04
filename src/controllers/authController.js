import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

function authResponse(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  };
}

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email, and password are all required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(409)
        .json({ message: 'An account with that email already exists' });
    }

    const user = await User.create({ name, email, password });

    return res.status(201).json(authResponse(user));
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors)[0].message;
      return res.status(400).json({ message: msg });
    }
    return res.status(500).json({ message: 'Server error during registration' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.status(200).json(authResponse(user));
  } catch (err) {
    return res.status(500).json({ message: 'Server error during login' });
  }
}


export async function getMe(req, res) {
  return res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  });
}