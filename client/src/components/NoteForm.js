import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/notes";

function NoteForm({ addNote }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (file) formData.append("file", file);

    try {
      const res = await axios.post(API_URL, formData);
      addNote(res.data);
      setTitle("");
      setContent("");
      setFile(null);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      ></textarea>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button type="submit">Add Note</button>
    </form>
  );
}

export default NoteForm;
