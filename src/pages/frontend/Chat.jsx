import { useState, useEffect } from 'react';
import supabase from '../../config/supabase';
import { useAuth } from '../../context/SupabaseAuthContext';
import './Chat.css';

const Chat = () => {
  const { currentUser, userData } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fallbackConversations = [
    { id: '1', participantName: 'Green Farm', lastMessage: 'Your order has been shipped', lastTime: '2 hours ago', unread: 2, avatar: 'G' },
    { id: '2', participantName: 'Tropical Fruits', lastMessage: 'Thank you for your purchase!', lastTime: '1 day ago', unread: 0, avatar: 'T' }
  ];

  const fallbackMessages = [
    { id: '1', sender: 'seller', text: 'Hello! How can I help you?', time: '10:30 AM' },
    { id: '2', sender: 'buyer', text: 'I want to know about the freshness of your products', time: '10:32 AM' },
    { id: '3', sender: 'seller', text: 'All our products are fresh from the farm. We deliver within 24 hours of harvest.', time: '10:35 AM' }
  ];

  useEffect(() => {
    if (!currentUser) {
      setConversations(fallbackConversations);
      setLoading(false);
      return;
    }

    const chatRoomsRef = collection(db, 'chatRooms');
    const q = query(
      chatRoomsRef,
      where('participants', 'array-contains', currentUser.uid),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const convs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setConversations(convs);
      } else {
        setConversations(fallbackConversations);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const loadMessages = (conversation) => {
    if (!currentUser) {
      setMessages(fallbackMessages);
      return;
    }

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('conversationId', '==', conversation.id),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(msgs);
      } else {
        setMessages(fallbackMessages);
      }
    });

    setActiveChat(conversation);
    return () => unsubscribe();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      conversationId: activeChat?.id,
      senderId: currentUser?.uid || 'guest',
      senderName: userData?.name || 'Guest',
      text: newMessage,
      createdAt: serverTimestamp(),
      read: false
    };

    try {
      if (currentUser) {
        await addDoc(collection(db, 'messages'), messageData);
        
        await updateDoc(doc(db, 'chatRooms', activeChat.id), {
          lastMessage: newMessage,
          lastMessageTime: serverTimestamp()
        });
      }

      setMessages([...messages, {
        ...messageData,
        id: Date.now().toString(),
        sender: currentUser ? 'buyer' : 'guest',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setNewMessage('');
    } catch (error) {
      console.error('Send error:', error);
    }
  };

  if (loading) return <div className="chat-page"><div className="loading">Loading chats...</div></div>;

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-sidebar">
          <div className="chat-header">
            <h2>Messages</h2>
          </div>
          <div className="conversations-list">
            {conversations.map(conv => (
              <div 
                key={conv.id} 
                className={`conversation-item ${activeChat?.id === conv.id ? 'active' : ''}`}
                onClick={() => loadMessages(conv)}
              >
                <div className="conv-avatar">
                  {conv.participantName?.charAt(0) || conv.avatar || 'U'}
                </div>
                <div className="conv-info">
                  <div className="conv-name">{conv.participantName}</div>
                  <div className="conv-preview">{conv.lastMessage}</div>
                </div>
                <div className="conv-time">
                  <span>{conv.lastTime || 'Now'}</span>
                  {conv.unread > 0 && <span className="unread-badge">{conv.unread}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-main">
          {activeChat ? (
            <>
              <div className="chat-messages-header">
                <div className="chat-user-info">
                  <div className="user-avatar">
                    {activeChat.participantName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3>{activeChat.participantName}</h3>
                    <span className="status">Online</span>
                  </div>
                </div>
              </div>

              <div className="messages-container">
                {messages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`message ${msg.senderId === currentUser?.uid || msg.sender === 'buyer' ? 'sent' : 'received'}`}
                  >
                    <div className="message-bubble">
                      {msg.text}
                    </div>
                    <span className="message-time">{msg.time || 'Now'}</span>
                  </div>
                ))}
              </div>

              <form className="message-input-form" onSubmit={sendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button type="submit">Send</button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <span className="chat-icon">💬</span>
              <h3>Select a conversation</h3>
              <p>Choose a chat from the sidebar to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;