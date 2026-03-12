import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import '../../client/src/styles/App.css';
import logo from './images/logo.png';
import Login from './components/Login';
import Register from './components/Register';

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : 'http://localhost:5000';

const API_AUTH = `${BASE_URL}/api/auth`;
const API_NOTES = `${BASE_URL}/api/notes`;
const UPLOADS = `${BASE_URL}/uploads/`;

// Configure axios to include token in all requests
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

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
        className="modal-card confirm-modal" 
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="modal-icon-wrapper danger-glow">
          <span className="modal-icon">⚠️</span>
        </div>
        <div className="modal-content-center">
          <h3>Delete Note</h3>
          <p>This action cannot be undone. Are you sure you want to delete "<strong>{note.title}</strong>"?</p>
        </div>
        <div className="modal-footer-actions">
          <motion.button 
            className="btn-modal-secondary" 
            onClick={onCancel}
            whileHover={{ y: -1, backgroundColor: 'var(--bg-tertiary)' }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          <motion.button 
            className="btn-modal-danger" 
            onClick={onConfirm}
            whileHover={{ y: -1, scale: 1.02, boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}
            whileTap={{ scale: 0.98 }}
          >
            Delete Permanently
          </motion.button>
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
  username,
  onLogout
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
              <span>{username}</span>
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

        <div className="sidebar-footer">
          <motion.button 
            className="btn-sidebar-logout" 
            onClick={onLogout}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            ⏻&nbsp; Logout
          </motion.button>
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
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
    setPreview(note?.file ? `${UPLOADS}${note.file}` : null);
    setImageFile(null);
    setRemoveImage(false);
  }, [note]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSave({ title: title.trim(), content: content.trim(), imageFile, removeImage });
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
            if (file) {
              setPreview(URL.createObjectURL(file));
              setRemoveImage(false);
            }
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
          <button type="button" className="remove-image" onClick={() => { setPreview(null); setImageFile(null); setRemoveImage(true); }}>✕</button>
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
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [mode, setMode] = useState('view');
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'delete'
  const [toasts, setToasts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      if (savedUser && savedToken) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setAuthToken(savedToken);
          setUser(parsedUser);
        } catch (err) {
          localStorage.clear();
        }
      }
      setIsInitializing(false);
    };
    initAuth();
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const notesRes = await axios.get(API_NOTES);
      setNotes(notesRes.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
        showToast('Session expired. Please login again.', 'error');
      } else {
        showToast('Connection error', 'error');
      }
    }
  }, [user, showToast]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
    document.documentElement.setAttribute('data-theme', theme);
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute('content', theme === 'dark' ? '#0f0f14' : '#ffffff');
    }
  }, [fetchData, theme, user]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLogin = (data) => {
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
    setAuthToken(data.token);
    setUser(data.user);
    showToast(`Welcome back, ${data.user.username}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
    setNotes([]);
    setSelectedNoteId(null);
    setMode('view');
  };

  const handleNoteSave = async (data) => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.imageFile) formData.append('file', data.imageFile);
    if (data.removeImage) formData.append('removeImage', 'true');

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

  // Protected Route: Don't render anything until auth state is checked
  if (isInitializing) {
    return (
      <div className="initializing-screen">
        <motion.img 
          src={logo} 
          alt="Loading..." 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
        />
      </div>
    );
  }

  // Auth Screen
  if (!user) {
    return (
      <div className="app-auth-wrapper">
        {authMode === 'login' ? (
          <Login 
            logo={logo} 
            apiAuth={API_AUTH}
            onLogin={handleLogin} 
            onSwitchToRegister={() => setAuthMode('register')} 
          />
        ) : (
          <Register 
            logo={logo} 
            apiAuth={API_AUTH}
            onRegisterSuccess={() => {
              setAuthMode('login');
              showToast('Registration successful! Please login.', 'success');
            }}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        )}
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

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
        username={user.username}
        onLogout={handleLogout}
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

