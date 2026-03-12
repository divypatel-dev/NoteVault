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
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Create a note
router.post('/', auth, (req, res) => {
  upload.single('file')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer Error:', err);
      return res.status(400).json({ message: 'File upload error', error: err.message });
    } else if (err) {
      console.error('Unknown Upload Error:', err);
      return res.status(500).json({ message: 'Server error during upload', error: err.message });
    }

    try {
      console.log('--- CREATE NOTE REQUEST ---');
      console.log('User ID:', req.userId);
      console.log('Body:', req.body);
      console.log('File:', req.file);

      const { title, content } = req.body;

      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }

      const newNote = new Note({
        title,
        content,
        file: req.file ? req.file.filename : undefined,
        userId: req.userId
      });

      const savedNote = await newNote.save();
      console.log('Note saved successfully:', savedNote._id);
      res.status(201).json(savedNote);
    } catch (dbErr) {
      console.error('Database Error:', dbErr);
      res.status(500).json({ message: 'Error saving to database', error: dbErr.message });
    }
  });
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
router.put('/:id', auth, (req, res) => {
  upload.single('file')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer Error during update:', err);
      return res.status(400).json({ message: 'File upload error', error: err.message });
    } else if (err) {
      console.error('Unknown Upload Error during update:', err);
      return res.status(500).json({ message: 'Server error during upload', error: err.message });
    }

    try {
      console.log('--- UPDATE NOTE REQUEST ---');
      console.log('req.body:', req.body);
      console.log('req.file:', req.file);

      const { title, content, removeImage } = req.body;
      const updateOps = { title, content };

      const note = await Note.findOne({ _id: req.params.id, userId: req.userId });

      if (req.file) {
        updateOps.file = req.file.filename;
        if (note && note.file) {
          const filePath = path.join(__dirname, '../uploads', note.file);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      } else if (removeImage === 'true' || removeImage === true) {
        updateOps.file = '';
        if (note && note.file) {
          const filePath = path.join(__dirname, '../uploads', note.file);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      }

      const updatedNote = await Note.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        { $set: updateOps },
        { new: true }
      );

      if (!updatedNote) {
        return res.status(404).json({ message: 'Note not found' });
      }

      console.log('Note updated successfully:', updatedNote._id);
      res.json(updatedNote);
    } catch (dbErr) {
      console.error('Database Error during update:', dbErr);
      res.status(500).json({ message: 'Error updating database', error: dbErr.message });
    }
  });
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
