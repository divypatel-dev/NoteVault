const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const notesRoutes = require('./routes/notes');
const userRoutes = require('./routes/user');

const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect('mongodb://localhost:27017/NotesDB').then(() => {
  console.log("MongoDB Connected");
}).catch(err => {
  console.error("MongoDB connection error:", err);
});

// Routes
app.use('/api/notes', notesRoutes);
app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
