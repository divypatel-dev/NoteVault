import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import logo from './logo.png';

const API_NOTES = 'http://localhost:5000/api/notes';
const API_USER = 'http://localhost:5000/api/user';
const UPLOADS = 'http://localhost:5000/uploads/';

/* ========== Toast System ========== */
function ToastContainer({ toasts }) {
  return (
    <div className="toast-container" id="toast-container">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className={`toast ${t.type}`}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <span className="toast-icon">
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
            </span>
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ========== Profile Modal ========== */
function ProfileModal({ user, onSave, onCancel, isSaving, setUser, showToast, fetchData }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [picFile, setPicFile] = useState(null);
  const [preview, setPreview] = useState(user?.profilePicture ? `${UPLOADS}${user.profilePicture}` : null);
  const [showConfirmPhoto, setShowConfirmPhoto] = useState(false);
  const [removePhoto, setRemovePhoto] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRemovePhoto = () => {
    setShowConfirmPhoto(true);
  };

  const confirmRemovePhoto = () => {
    setPreview(null);
    setPicFile(null);
    setRemovePhoto(true);
    setShowConfirmPhoto(false);
    showToast('Photo removed from preview. Click Save Profile to apply.', 'info');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPicFile(file);
      setPreview(URL.createObjectURL(file));
      setRemovePhoto(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, picFile, removePhoto });
  };

  return (
    <motion.div 
      className="modal-overlay" 
      onClick={onCancel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence>
        {showConfirmPhoto && (
          <motion.div 
            className="modal-overlay" 
            style={{ zIndex: 1100 }} 
            onClick={() => setShowConfirmPhoto(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-card" 
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <h3>Remove Photo</h3>
              <p>Are you sure you want to remove your profile photo?</p>
              <div className="modal-actions">
                <motion.button type="button" className="btn-modal-cancel" onClick={() => setShowConfirmPhoto(false)} whileHover={{ backgroundColor: 'var(--bg-tertiary)' }} whileTap={{ scale: 0.95 }}>Cancel</motion.button>
                <motion.button type="button" className="btn-modal-delete" onClick={confirmRemovePhoto} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>Remove</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div 
        className="modal-card profile-modal" 
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <h3>Edit Profile</h3>
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-pic-container">
            <div className="profile-pic-preview">
              {preview ? <img src={preview} alt="Profile" /> : <div className="pic-placeholder">{formData.name.charAt(0)}</div>}

              <div className="profile-pic-actions">
                <label className="pic-action-btn upload" title="Update Photo">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                </label>
                {preview && (
                  <motion.button 
                    type="button" 
                    className="pic-action-btn remove" 
                    onClick={handleRemovePhoto} 
                    title="Remove Photo"
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </motion.button>
                )}
              </div>
            </div>
            <p className="pic-hint">Update or remove your profile picture</p>
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890" />
          </div>

          <div className="modal-actions">
            <motion.button type="button" className="btn-modal-cancel" onClick={onCancel} whileHover={{ backgroundColor: 'var(--bg-tertiary)' }} whileTap={{ scale: 0.95 }}>Cancel</motion.button>
            <motion.button type="submit" className="btn-save" disabled={isSaving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
              {isSaving ? 'Saving...' : 'Save Profile'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ========== Delete Confirmation Modal ========== */
function DeleteModal({ note, onConfirm, onCancel }) {
  return (
    <motion.div 
      className="modal-overlay" 
      onClick={onCancel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
      >
        <h3>Delete Note</h3>
        <p>Are you sure you want to delete "<strong>{note.title}</strong>"?</p>
        <div className="modal-actions">
          <motion.button className="btn-modal-cancel" onClick={onCancel} whileHover={{ backgroundColor: 'var(--bg-tertiary)' }} whileTap={{ scale: 0.95 }}>Cancel</motion.button>
          <motion.button className="btn-modal-delete" onClick={onConfirm} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>Delete</motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ========== Sidebar Component ========== */
function Sidebar({
  notes,
  selectedNoteId,
  onSelectNote,
  onNewNote,
  searchQuery,
  onSearchChange,
  isOpen,
  onClose,
  user,
  onOpenProfile
}) {
  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src={logo} alt="Logo" className="sidebar-logo" />
            <div className="brand-text">
              <h1>NoteVault</h1>
            </div>
          </div>
        </div>

        <div className="sidebar-search">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        <div className="sidebar-new-note">
          <motion.button 
            className="btn-new-note" 
            onClick={onNewNote}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            layout
          >
            <span className="plus-icon">+</span> New Note
          </motion.button>
        </div>

        <div className="sidebar-notes-header">
          <h3>Recent Notes</h3>
          <span className="note-count">{filteredNotes.length}</span>
        </div>

        <motion.div 
          className="sidebar-notes-list"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          initial="hidden"
          animate="show"
        >
          {filteredNotes.length === 0 ? (
            <div className="sidebar-empty">📄<p>No notes found.</p></div>
          ) : (
            filteredNotes.map(note => (
              <motion.div
                key={note._id}
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  show: { opacity: 1, x: 0 }
                }}
                whileHover={{ x: 4, backgroundColor: 'var(--bg-tertiary)' }}
                whileTap={{ scale: 0.98 }}
                className={`sidebar-note-item ${selectedNoteId === note._id ? 'active' : ''}`}
                onClick={() => onSelectNote(note._id)}
                layout
              >
                <div className="note-item-title">{note.title}</div>
                <div className="note-item-preview">{note.content.substring(0, 50)}...</div>
              </motion.div>
            ))
          )}
        </motion.div>

        <div className="sidebar-footer" onClick={onOpenProfile} style={{ cursor: 'pointer' }}>
          <div className="footer-avatar">
            {user?.profilePicture ? (
              <img src={`${UPLOADS}${user.profilePicture}`} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              user?.name?.charAt(0) || 'U'
            )}
          </div>
          <div className="footer-info">
            <div className="footer-name">{user?.name || 'Guest User'}</div>
          </div>
          <div className="settings-cog">⚙️</div>
        </div>
      </aside>
    </>
  );
}

/* ========== Note Editor Component ========== */
function NoteEditor({ note, isNew, onSave, onCancel, onDelete, isSaving }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(note?.file ? `${UPLOADS}${note.file}` : null);

  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
    setPreview(note?.file ? `${UPLOADS}${note.file}` : null);
    setImageFile(null);
  }, [note]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSave({ title: title.trim(), content: content.trim(), imageFile });
  };

  return (
    <motion.form 
      className="note-editor-area" 
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
    >
      <input
        className="note-editor-title"
        placeholder="Untitled Note"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="editor-toolbar">
        <label className="toolbar-btn">
          <span>📎</span> Attach Image
          <input type="file" accept="image/*" onChange={(e) => {
            const file = e.target.files[0];
            setImageFile(file);
            if (file) setPreview(URL.createObjectURL(file));
          }} hidden />
        </label>
      </div>
      <textarea
        className="note-editor-content"
        placeholder="Keep your thoughts here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      {preview && (
        <div className="editor-image-preview">
          <img src={preview} alt="Attachment" />
          <button type="button" className="remove-image" onClick={() => { setPreview(null); setImageFile(null); }}>✕</button>
        </div>
      )}
      <div className="editor-actions">
        {!isNew && <motion.button type="button" className="btn-cancel" onClick={onDelete} style={{ color: 'var(--danger)', marginRight: 'auto' }} whileHover={{ backgroundColor: 'rgba(239,68,68,0.1)' }} whileTap={{ scale: 0.95 }}>🗑 Delete</motion.button>}
        <motion.button type="button" className="btn-cancel" onClick={onCancel} whileHover={{ backgroundColor: 'var(--bg-tertiary)' }} whileTap={{ scale: 0.95 }}>Cancel</motion.button>
        <motion.button type="submit" className="btn-save" disabled={isSaving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>{isSaving ? 'Saving...' : 'Save Note'}</motion.button>
      </div>
    </motion.form>
  );
}

/* ========== Note View Component ========== */
function NoteView({ note }) {
  return (
    <motion.div 
      className="note-view-area"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
    >
      <h2 className="note-view-title">{note.title}</h2>
      <div className="note-view-meta">Created {new Date(note.createdAt).toLocaleDateString()}</div>
      <div className="note-view-content">{note.content}</div>
      {note.file && <div className="note-view-image"><img src={`${UPLOADS}${note.file}`} alt="Attach" /></div>}
    </motion.div>
  );
}

/* ========== Welcome State ========== */
function WelcomeState({ onNewNote }) {
  return (
    <motion.div 
      className="welcome-state"
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="welcome-icon">
        <img src={logo} alt="Logo" className="welcome-icon-img" />
      </div>
      <h2>Your Ideas, Secured.</h2>
      <p>Welcome to NoteVault. Capture everything that matters in one place.</p>
      <motion.button 
        className="btn-get-started" 
        onClick={onNewNote}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        + Create First Note
      </motion.button>
    </motion.div>
  );
}

/* ========== App Root ========== */
function App() {
  const [notes, setNotes] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [mode, setMode] = useState('view');
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'profile' | 'delete'
  const [toasts, setToasts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [notesRes, userRes] = await Promise.all([
        axios.get(API_NOTES),
        axios.get(API_USER)
      ]);
      setNotes(notesRes.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
      setUser(userRes.data);
    } catch (err) {
      showToast('Connection error', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', theme === 'dark' ? '#0f0f14' : '#ffffff');
  }, [fetchData, theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleProfileSave = async (data) => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    if (data.picFile) formData.append('profilePicture', data.picFile);
    if (data.removePhoto) formData.append('removePhoto', 'true');

    try {
      const res = await axios.put(API_USER, formData);
      const updatedUser = res.data;
      setUser(updatedUser);

      await fetchData(); 
      showToast('Profile updated!', 'success');
      setModalType(null);
    } catch (err) {
      showToast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNoteSave = async (data) => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.imageFile) formData.append('file', data.imageFile);

    try {
      if (mode === 'new') {
        const res = await axios.post(API_NOTES, formData);
        setSelectedNoteId(res.data._id);
      } else {
        await axios.put(`${API_NOTES}/${selectedNoteId}`, formData);
      }
      await fetchData();
      setMode('view');
      showToast('Note saved!', 'success');
    } catch (err) {
      showToast('Error saving note', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedNote = notes.find(n => n._id === selectedNoteId);

  return (
    <div className="app-layout">
      <Sidebar
        notes={notes}
        selectedNoteId={selectedNoteId}
        onSelectNote={id => { setSelectedNoteId(id); setMode('view'); setSidebarOpen(false); }}
        onNewNote={() => { setMode('new'); setSelectedNoteId(null); setSidebarOpen(false); }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onOpenProfile={() => setModalType('profile')}
      />

      <main className="main-content">
        <motion.header 
          className="top-bar"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="top-bar-left">
            <motion.button className="btn-menu-toggle" onClick={() => setSidebarOpen(true)} whileTap={{ scale: 0.9 }}>☰</motion.button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {!selectedNote && <img src={logo} alt="Logo" className="top-bar-logo" />}
              <span className="top-bar-title">{selectedNote?.title || 'NoteVault'}</span>
            </div>
          </div>
          <div className="top-bar-right">
            <motion.button className="btn-icon theme-toggle" onClick={toggleTheme} title="Toggle Theme" whileHover={{ y: -2 }} whileTap={{ scale: 0.9, rotate: 180 }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </motion.button>
            {selectedNote && mode === 'view' && (
              <>
                <motion.button className="btn-icon" onClick={() => setMode('edit')} whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }}>✏️</motion.button>
                <motion.button className="btn-icon danger" onClick={() => setModalType('delete')} whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }}>🗑</motion.button>
              </>
            )}
          </div>
        </motion.header>

        <AnimatePresence mode="wait">
          {mode === 'new' ? (
            <NoteEditor key="new" isNew onSave={handleNoteSave} onCancel={() => setMode('view')} isSaving={isSaving} />
          ) : mode === 'edit' && selectedNote ? (
            <NoteEditor key={`edit-${selectedNote._id}`} note={selectedNote} onSave={handleNoteSave} onCancel={() => setMode('view')} onDelete={() => setModalType('delete')} isSaving={isSaving} />
          ) : selectedNote ? (
            <NoteView key={`view-${selectedNote._id}`} note={selectedNote} />
          ) : (
            <WelcomeState key="welcome" onNewNote={() => setMode('new')} />
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {modalType === 'profile' && (
          <ProfileModal
            user={user}
            onSave={handleProfileSave}
            onCancel={() => setModalType(null)}
            isSaving={isSaving}
            setUser={setUser}
            showToast={showToast}
            fetchData={fetchData}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalType === 'delete' && selectedNote && (
          <DeleteModal note={selectedNote} onCancel={() => setModalType(null)} onConfirm={async () => {
            await axios.delete(`${API_NOTES}/${selectedNoteId}`);
            await fetchData();
            setSelectedNoteId(null);
            setModalType(null);
            showToast('Note deleted');
          }} />
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default App;
