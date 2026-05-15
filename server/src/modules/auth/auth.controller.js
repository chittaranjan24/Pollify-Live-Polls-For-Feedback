import User from './auth.model.js';
import jwt from 'jsonwebtoken';

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    const token = jwt.sign({ 
        id: user._id, 
        email: user.email, 
        username: user.name
      }, process.env.JWT_SECRET, { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ 
        id: user._id, 
        email: user.email, 
        username: user.name
      }, process.env.JWT_SECRET, { expiresIn: '7d' }
    );
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

async function getMe(req, res) {
  try {
    return res.status(200).json({ 
      message: "User fetched successfully",
      user: req.user 
    });        
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  register,
  login,
  getMe
};