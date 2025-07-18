import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { api } from '../api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function DirectChat({ currentUser, targetUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const [typing, setTyping] = useState(false);
  const [readUpTo, setReadUpTo] = useState(null);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    let isMounted = true;
    // Fetch direct chat history first
    api.get(`/users/${targetUser._id}/direct-messages`).then(res => {
      if (isMounted) setMessages(res.data.messages || []);
    });
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('registerUser', currentUser._id);
    socket.on('receiveDirectMessage', (msg) => {
      if (
        (msg.from === targetUser._id && msg.to === currentUser._id) ||
        (msg.from === currentUser._id && msg.to === targetUser._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    // Typing indicators
    socket.on('typingDirect', ({ user }) => {
      if (user._id === targetUser._id) setTyping(true);
    });
    socket.on('stopTypingDirect', ({ user }) => {
      if (user._id === targetUser._id) setTyping(false);
    });
    // Online status
    socket.on('userOnline', (userId) => {
      if (userId === targetUser._id) setOnline(true);
    });
    socket.on('userOffline', (userId) => {
      if (userId === targetUser._id) setOnline(false);
    });
    // Read receipts
    socket.on('directMessagesRead', ({ from, to }) => {
      if (from === currentUser._id && to === targetUser._id) {
        setReadUpTo(Date.now());
      }
    });
    // Emit read receipt when chat is opened
    socket.emit('readDirectMessages', { fromUserId: targetUser._id, toUserId: currentUser._id });
    return () => { isMounted = false; socket.disconnect(); };
  }, [currentUser._id, targetUser._id]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    // Emit read receipt when new messages arrive
    if (socketRef.current) {
      socketRef.current.emit('readDirectMessages', { fromUserId: targetUser._id, toUserId: currentUser._id });
    }
  }, [messages, targetUser._id, currentUser._id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const msgObj = {
      from: currentUser._id,
      to: targetUser._id,
      text,
      timestamp: new Date().toISOString(),
      fromName: currentUser.name || currentUser.email,
      toName: targetUser.name || targetUser.email,
    };
    socketRef.current.emit('sendDirectMessage', { toUserId: targetUser._id, message: msgObj });
    setMessages((prev) => [...prev, msgObj]);
    setText('');
    // Persist to backend
    await api.post(`/users/${targetUser._id}/direct-messages`, { to: targetUser._id, text });
  };

  // Typing event handlers
  let typingTimeout = useRef();
  const handleTyping = (e) => {
    setText(e.target.value);
    if (socketRef.current) {
      socketRef.current.emit('typingDirect', { toUserId: targetUser._id, user: currentUser });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socketRef.current.emit('stopTypingDirect', { toUserId: targetUser._id, user: currentUser });
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-4 flex flex-col relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500" onClick={onClose}>&times;</button>
        <div className="font-bold text-lg mb-2 text-blue-700 flex items-center gap-2">
          <span className={`inline-block w-3 h-3 rounded-full ${online ? 'bg-green-500' : 'bg-gray-300'}`}></span>
          Chat with {targetUser.name || targetUser.email}
        </div>
        <div className="flex-1 overflow-y-auto mb-2 max-h-80 border rounded p-2 bg-blue-50">
          {messages.length === 0 && <div className="text-gray-400 text-sm text-center">No messages yet.</div>}
          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-2 flex ${msg.from === currentUser._id ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end gap-2`}>
                {msg.from !== currentUser._id && (
                  <div className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700 text-xs">
                    {(targetUser.name || targetUser.email || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                )}
                <div className={`rounded px-3 py-2 text-sm shadow ${msg.from === currentUser._id ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border'}`}>
                  <div>{msg.text}</div>
                  <div className="text-xs text-gray-400 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                  {msg.from === currentUser._id && idx === messages.length - 1 && (
                    <div className="text-[10px] text-right mt-1">
                      {readUpTo ? <span className="text-green-500">Seen</span> : <span className="text-gray-400">Sent</span>}
                    </div>
                  )}
                </div>
                {msg.from === currentUser._id && (
                  <div className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700 text-xs">
                    {(currentUser.name || currentUser.email || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        {typing && (
          <div className="text-xs text-blue-500 mb-2">{targetUser.name || targetUser.email} is typing...</div>
        )}
        <form onSubmit={handleSend} className="flex gap-2 mt-2">
          <input
            type="text"
            className="flex-1 px-2 py-1 rounded border border-blue-200 focus:outline-none"
            placeholder="Type a message..."
            value={text}
            onChange={handleTyping}
          />
          <button
            type="submit"
            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={!text.trim()}
          >Send</button>
        </form>
      </div>
    </div>
  );
} 