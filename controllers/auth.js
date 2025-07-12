import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashed, role });
  await user.save();
  res.status(201).json({ message: 'User registered' });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
  res.json({ token, role: user.role });
};