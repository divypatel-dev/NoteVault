import React, { useState } from "react";

function NoteUpdateModal({ note, updateNote, closeModal }) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateNote(note._id, { title, content });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Note</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
          <button type="submit">Update</button>
          <button type="button" onClick={closeModal} className="close-btn">
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default NoteUpdateModal;
