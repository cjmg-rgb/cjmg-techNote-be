const express = require('express');
const router = express.Router();

const noteControllers = require('../controllers/noteControllers');

router.route('/')
  .get(noteControllers.getAllNotes)
  .post(noteControllers.createNote)
  .patch()
  .delete(noteControllers.deleteNote)

module.exports = router;