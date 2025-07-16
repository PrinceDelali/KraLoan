import React, { useEffect, useState, useRef } from 'react';
import { api } from '../api';
import { useNotification } from './NotificationProvider';
import FileUploadInput from './FileUploadInput';

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

  useEffect(() => {
    let isMounted = true;
    let lastMessages = [];
    const fetchMessages = async () => {
      try {
        const res = await api.getGroupMessages(groupId);
        if (!isMounted) return;
        // Only update if changed
        const newMsgs = res.messages || [];
        // Detect new message from other user
        const prevMsgs = prevMessagesRef.current;
        if (prevMsgs.length && newMsgs.length > prevMsgs.length) {
          const lastMsg = newMsgs[newMsgs.length - 1];
          if (lastMsg.user && lastMsg.user._id !== currentUser._id) {
            notify && notify(
              `New message from ${lastMsg.user.name || lastMsg.user.email || 'User'}`,
              'info',
              5000
            );
          }
        }
        prevMessagesRef.current = newMsgs;
        if (JSON.stringify(newMsgs) !== JSON.stringify(lastMessages)) {
          setMessages(newMsgs);
          lastMessages = newMsgs;
        }
      } catch (err) {
        if (isMounted) setError('Failed to load messages');
      }
    };
    setLoading(true);
    fetchMessages().finally(() => setLoading(false));
    const interval = setInterval(fetchMessages, 5000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [groupId]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    setPosting(true);
    try {
      if (file) {
        // Assume api.postGroupMessageWithFile is implemented
        await api.postGroupMessageWithFile(groupId, text, file);
      } else {
        await api.postGroupMessage(groupId, text);
      }
      const res = await api.getGroupMessages(groupId);
      setMessages(res.messages || []);
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
          return (
            <div key={m._id || idx} className={`mb-2 text-left ${m.user && m.user._id === currentUser._id ? 'text-blue-700' : 'text-gray-800'}`}>
              <span className="font-semibold text-xs">{m.user?.name || m.user?.email || 'User'}</span>
              <span className="mx-2 text-gray-400 text-xs">{new Date(m.timestamp).toLocaleString()}</span>
              {editingId === m._id ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setActionLoading(m._id + '-edit');
                    try {
                      await api.editGroupMessage(groupId, m._id, editText);
                      const res = await api.getGroupMessages(groupId);
                      setMessages(res.messages || []);
                      setEditingId(null);
                    } catch (err) {
                      alert('Failed to edit message: ' + (err.message || 'Unknown error'));
                    } finally {
                      setActionLoading(null);
                    }
                  }}
                  className="flex gap-2 mt-1"
                >
                  <input
                    className="flex-1 px-2 py-1 rounded border border-blue-200 focus:outline-none"
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    disabled={actionLoading === m._id + '-edit'}
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                    disabled={actionLoading === m._id + '-edit' || !editText.trim()}
                  >Save</button>
                  <button
                    type="button"
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                    onClick={() => setEditingId(null)}
                  >Cancel</button>
                </form>
              ) : (
                <div className="text-sm bg-white rounded px-2 py-1 inline-block mt-1 shadow-sm">
                  {m.text}
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
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handlePost} className="flex flex-col gap-2 mt-2">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-2 py-1 rounded border border-blue-200 focus:outline-none"
            placeholder="Write a message..."
            value={text}
            onChange={e => setText(e.target.value)}
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
