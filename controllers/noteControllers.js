const User = require('../models/userModel');
const Note = require('../models/noteModel');

const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// CREATE
const createNote = asyncHandler( async(req, res) => {
  const { _id, title, text } = req.body;
  if(!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ error: 'Invalid ID'});
  }
  if(!title || !text || !_id) {
    return res.status(400).json({ error: 'Please fill in all required fields'});
  }
  const duplicate = await Note.findOne({ title }).lean().exec()
  if (duplicate) {
    return res.status(409).json({ message: 'Duplicate note title' })
  }
  const user = await User.findOne({_id}).lean();
  if(!user) {
    return res.status(400).json({ error: 'User not found'});
  }
  const note = await Note.create({ user: _id, title, text });
  if(!note) {
    return res.status(400).json({ error: 'Invalid data, please try again'});
  }
  res.status(200).json(note);
});

// READ
const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({}).lean().exec();
  if(!notes?.length) {
    return res.status(400).json({ message: 'No notes yet' });
  }
  const notesWithUser = await Promise.all(notes.map(async (note) => {
    const user = await User.findById(note.user).lean().exec()
    return { ...note, username: user.username }
  }))
  res.status(200).json(notesWithUser);
});

// UPDATE
const updateNote = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body

    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    const duplicate = await Note.findOne({ title }).lean().exec()

    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save()

    res.json(`'${updatedNote.title}' updated`)
});

// DELETE
const deleteNote = asyncHandler(async (req, res) => {
  const { _id } = req.body;
  if(!_id) {
    return res.status(400).json({ error: 'ID is required'});
  } 
  if(!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ error: 'Invalid ID'});
  };
  const note = await Note.findOneAndDelete({_id});
  if(!note) {
    return res.status(400).json({ error: 'Note not found'});
  }
  res.status(200).json({ message: 'Note DELETED'})
});

module.exports = {
  createNote,
  getAllNotes,
  deleteNote
}