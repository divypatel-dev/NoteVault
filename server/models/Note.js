const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  file: { type: String }, // path to uploaded file
}, { timestamps: true });

module.exports = mongoose.model('Note', NoteSchema);
