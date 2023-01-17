const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

const User = require('../models/userModel');
const Note = require('../models/noteModel');


// GET
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').lean();
  
  if(!users?.length){
    return res.status(400).json({ error: 'No users found'});
  }
  res.status(200).json(users);
});

// POST
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;
  if(!username || !password || !Array.isArray(roles) || !roles?.length) {
    return res.status(400).json({ error: 'Please fill in all required fields'});
  };
  
  const exists = await User.findOne({ username }).lean().exec();
  if(exists) {
    return res.status(409).json({ error: 'Username already exist'});
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.create({ username, password: hashedPassword, roles}); 
  if(user) {
    res.status(200).json({message: `New user ${username} created`})
  } else {
    res.status(400).json({ error: 'Invalid user data, please try again'});
  }
});

// UPDATE
const updateUser = asyncHandler(async (req, res) => {
  const { _id, username, roles, active, password } = req.body;
  if(!_id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean'){
    return res.status(400).json({ error: 'Please fill in all required fields'});
  }
  const user = await User.findById({_id}).exec();
  if(!user) {
    return res.status(400).json({ error: 'User not found'});
  }
  const exists = await User.findOne({ username }).lean().exec();
  if(exists && exists?._id.toString() !== _id) {
    return res.status(409).json({ error: 'Username already exists'});
  }
  user.username = username;
  user.roles = roles;
  user.active = active;

  if(password) {
    user.password = await bcrypt.hash(password, 10);
  }
  
  const updatedUser = await user.save();
  res.json({ message: `${updatedUser.username} updated`})
});


// DELETE
const deleteUser = asyncHandler(async (req, res) => {
  const { _id } = req.body;
  if(!_id) {
    return res.status(400).json({ error: 'User ID required'});
  }
  const note = await Note.findOne({ user: _id }).lean().exec();

  if(note) {
    return res.status(400).json({ error: 'User has assigned notes'})
  }
  const user = await User.findById({_id}).exec();
  
  if(!user) {
    return res.status(400).json({ error: 'User not found'})
  }
  const result = await user.deleteOne();
  const reply = `Username ${result.username} with ID ${result._id} deleted`;
  res.status(200).json(reply)
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser
}