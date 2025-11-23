// server/controllers/authController.js
const User = require('../models/User');
const generateToken = require('../config/jwt');

const registerUser = async (req, res) => {
    const { name, email, password, role, walletAddress } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' }); // User exists check working
        }
        
        const user = await User.create({ name, email, password, role, walletAddress });
        res.status(201).json({
            _id: user._id, name: user.name, email: user.email, role: user.role, 
            walletAddress: user.walletAddress, token: generateToken(user._id),
        });
    } catch (error) {
        res.status(400).json({ message: 'Invalid user data.', error: error.message });
    }
};

const authUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id, name: user.name, email: user.email, role: user.role, 
            walletAddress: user.walletAddress, token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

const updateProfile = async (req, res) => {
    const { name, email, walletAddress } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = name || user.name;
        user.email = email || user.email;
        user.walletAddress = walletAddress || user.walletAddress;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id, name: updatedUser.name, role: updatedUser.role, 
            walletAddress: updatedUser.walletAddress, token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = { registerUser, authUser, updateProfile };