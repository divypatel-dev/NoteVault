const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const multer = require('multer');
const path = require('path');

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Create a note
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const newNote = new Note({
      title: req.body.title,
      content: req.body.content,
      file: req.file ? req.file.filename : undefined
    });
    const savedNote = await newNote.save();
    res.json(savedNote);
  } catch (err) {
    res.status(500).json({ message: 'Error saving note', error: err.message });
  }
});

// Get all notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notes' });
  }
});

// Get note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching note' });
  }
});

// Update note
router.put('/:id', upload.single('file'), async (req, res) => {
  try {
    const updatedData = {
      title: req.body.title,
      content: req.body.content
    };
    if (req.file) updatedData.file = req.file.filename;

    const updatedNote = await Note.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ message: 'Error updating note' });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.id);
    if (!deletedNote) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting note' });
  }
});

module.exports = router;
