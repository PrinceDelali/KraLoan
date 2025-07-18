import React, { useEffect, useState, useRef } from 'react';
import { api } from '../api';
import { useNotification } from './NotificationProvider';
import FileUploadInput from './FileUploadInput';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function GroupMessagesBoard({ groupId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const notify = useNotification();
  const prevMessagesRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const [typingUsers, setTypingUsers] = useState([]);
  // Add onlineUsers state for future online status support
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    // Fetch chat history first
    api.getGroupMessages(groupId).then(res => {
      if (isMounted) {
        setMessages(res.messages || []);
        prevMessagesRef.current = res.data.messages || [];
      }
    }).catch(() => {
      if (isMounted) setError('Failed to load messages');
    }).finally(() => setLoading(false));
    // --- SOCKET.IO REAL-TIME ---
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('joinRoom', { roomId: groupId, userId: currentUser._id });
    socket.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (msg.user && msg.user._id !== currentUser._id) {
            notify && notify(
          `New message from ${msg.user.name || msg.user.email || 'User'}`,
              'info',
              5000
            );
          }
    });
    // Typing indicators
    socket.on('typing', ({ user }) => {
      if (user._id !== currentUser._id) setTypingUsers((prev) => [...new Set([...prev, user.name || user.email || 'User'])]);
    });
    socket.on('stopTyping', ({ user }) => {
      setTypingUsers((prev) => prev.filter(u => u !== (user.name || user.email || 'User')));
    });
    // Online status (future support)
    socket.on('userOnline', (userId) => {
      setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    });
    socket.on('userOffline', (userId) => {
      setOnlineUsers((prev) => prev.filter(id => id !== userId));
    });
    return () => {
      isMounted = false;
      socket.disconnect();
    };
  }, [groupId, currentUser._id, notify]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    setPosting(true);
    try {
      let msgObj;
      if (file) {
        // Assume api.postGroupMessageWithFile is implemented
        await api.postGroupMessageWithFile(groupId, text, file);
        const res = await api.getGroupMessages(groupId);
        setMessages(res.messages || []);
        msgObj = res.messages[res.messages.length - 1];
      } else {
        // Optimistically emit message
        msgObj = {
          text,
          user: currentUser,
          timestamp: new Date().toISOString(),
        };
        socketRef.current.emit('sendMessage', { roomId: groupId, message: msgObj });
        await api.postGroupMessage(groupId, text);
      }
      setText('');
      setFile(null);
    } catch (err) {
      alert('Failed to post message: ' + (err.message || 'Unknown error'));
    } finally {
      setPosting(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  // Typing event handlers
  let typingTimeout = useRef();
  const handleTyping = (e) => {
    setText(e.target.value);
    if (socketRef.current) {
      socketRef.current.emit('typing', { roomId: groupId, user: currentUser });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socketRef.current.emit('stopTyping', { roomId: groupId, user: currentUser });
      }, 1200);
    }
  };

  if (loading) return <div className="my-4 text-center">Loading messages...</div>;
  if (error) return <div className="my-4 text-center text-red-500">{error}</div>;

  const isAdmin = currentUser && messages.some(m => m.user && m.user._id === currentUser._id && m.user.role === 'Admin');

  return (
    <div className="my-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-h-96 overflow-y-auto">
      <h4 className="font-semibold text-blue-800 mb-2">Group Announcements & Messages</h4>
      <div className="mb-3">
        {messages.length === 0 && <div className="text-gray-500 text-sm">No messages yet.</div>}
        {messages.map((m, idx) => {
          const canEdit = m.user && (m.user._id === currentUser._id || isAdmin);
          const isMe = m.user && m.user._id === currentUser._id;
          const initials = (m.user?.name || m.user?.email || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
          const isOnline = onlineUsers.includes(m.user?._id);
          return (
            <div key={m._id || idx} className={`mb-2 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end gap-2`}>
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700 text-xs relative">
                    {initials}
                    {isOnline && <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border-2 border-white" />}
                  </div>
                )}
                <div className={`rounded px-3 py-2 text-sm shadow ${isMe ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border'}`}>
                  <div className="font-semibold text-xs mb-1">{m.user?.name || m.user?.email || 'User'}</div>
                  <div>{m.text}</div>
                  <div className="text-xs text-gray-400 mt-1 text-right">{new Date(m.timestamp).toLocaleTimeString()}</div>
                  {m.attachment && m.attachment.url && (
                    <div className="mt-2">
                      {m.attachment.mimetype && m.attachment.mimetype.startsWith('image/') ? (
                        <img
                          src={m.attachment.url}
                          alt={m.attachment.originalname || 'attachment'}
                          className="max-h-40 max-w-xs rounded border mt-1"
                        />
                      ) : (
                        <a
                          href={m.attachment.url}
                          download={m.attachment.originalname}
                          className="text-blue-600 underline text-xs"
                          target="_blank" rel="noopener noreferrer"
                        >
                          {m.attachment.originalname || 'Download file'}
                        </a>
                      )}
                    </div>
                  )}
                  {canEdit && (
                    <>
                      <button
                        className="ml-2 text-xs text-blue-500 hover:underline"
                        onClick={() => { setEditingId(m._id); setEditText(m.text); }}
                      >Edit</button>
                      <button
                        className="ml-2 text-xs text-red-500 hover:underline"
                        onClick={async () => {
                          if (!window.confirm('Delete this message?')) return;
                          setActionLoading(m._id + '-delete');
                          try {
                            await api.deleteGroupMessage(groupId, m._id);
                            const res = await api.getGroupMessages(groupId);
                            setMessages(res.messages || []);
                          } catch (err) {
                            alert('Failed to delete message: ' + (err.message || 'Unknown error'));
                          } finally {
                            setActionLoading(null);
                          }
                        }}
                      >Delete</button>
                    </>
                  )}
                </div>
                {isMe && (
                  <div className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700 text-xs relative">
                    {initials}
                    {isOnline && <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border-2 border-white" />}
                </div>
              )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      {typingUsers.length > 0 && (
        <div className="text-xs text-blue-500 mb-2">{typingUsers.join(', ')} typing...</div>
      )}
      <form onSubmit={handlePost} className="flex flex-col gap-2 mt-2">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-2 py-1 rounded border border-blue-200 focus:outline-none"
            placeholder="Write a message..."
            value={text}
            onChange={handleTyping}
            disabled={posting}
          />
          <button
            type="submit"
            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={posting || (!text.trim() && !file)}
          >
            {posting ? 'Posting...' : 'Send'}
          </button>
        </div>
        <FileUploadInput onChange={handleFileChange} accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt" />
        {file && (
          <div className="text-xs text-gray-600">Selected: {file.name} <button type="button" className="ml-2 text-red-500" onClick={() => setFile(null)}>Remove</button></div>
        )}
      </form>
    </div>
  );
}
