const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

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
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const newNote = new Note({
      title: req.body.title,
      content: req.body.content,
      file: req.file ? req.file.filename : undefined,
      userId: req.userId
    });
    const savedNote = await newNote.save();
    res.json(savedNote);
  } catch (err) {
    res.status(500).json({ message: 'Error saving note', error: err.message });
  }
});

// Get all notes
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notes' });
  }
});

// Get note by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching note' });
  }
});

// Update note
router.put('/:id', auth, upload.single('file'), async (req, res) => {
  try {
    console.log('--- PUT REQUEST ---');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    const updateOps = {
      title: req.body.title,
      content: req.body.content
    };
    
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });

    if (req.file) {
      updateOps.file = req.file.filename;
      if (note && note.file) {
        const filePath = path.join(__dirname, '../uploads', note.file);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    } else if (req.body.removeImage === 'true' || req.body.removeImage === true) {
      updateOps.file = '';
      if (note && note.file) {
        const filePath = path.join(__dirname, '../uploads', note.file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: updateOps },
      { new: true }
    );
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ message: 'Error updating note' });
  }
});

// Delete note
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedNote = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deletedNote) return res.status(404).json({ message: 'Note not found' });
    
    if (deletedNote.file) {
      const filePath = path.join(__dirname, '../uploads', deletedNote.file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting note' });
  }
});

module.exports = router;
