import React from "react";

const API_BASE = "http://localhost:5000/uploads/";

function NoteList({ notes, deleteNote, setEditingNote }) {
  return (
    <div className="note-list">
      {notes.map((note) => (
        <div className="note-card" key={note._id}>
          <h3>{note.title}</h3>
          <p>{note.content}</p>
          {note.file && (
            <a href={`${API_BASE}${note.file}`} target="_blank" rel="noreferrer">
              View File
            </a>
          )}
          <div className="note-actions">
            <button onClick={() => setEditingNote(note)}>Edit</button>
            <button onClick={() => deleteNote(note._id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NoteList;
