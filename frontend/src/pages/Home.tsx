import React, { useState, useRef, useEffect } from "react";
import { Plus, User, Send, MessageSquare, MoreVertical, Loader, FolderOpen, MessageCirclePlus } from 'lucide-react';
import { pdfAPI, chatAPI } from "../api";
import { ACCESS_TOKEN } from "../constants";
import { useNavigate } from "react-router-dom";
import NewChatModal from "../components/NewChatModal";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

const Home = () => {
  const navigate = useNavigate();
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([{
    id: 'intro',
    content: 'Welcome! Please upload a PDF to start asking questions.',
    sender: 'bot',
    timestamp: new Date()
  }]);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [activePdfId, setActivePdfId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    navigate('/login');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Upload PDF
      const uploadRes = await pdfAPI.upload(file);
      const pdfId = uploadRes.data.pdf_id;
      
      // 2. Process PDF to embeddings
      await pdfAPI.process(pdfId);

      // 3. Add to chat history sidebar
      const newSession: ChatSession = {
        id: pdfId,
        title: file.name,
        lastMessage: 'PDF processed successfully.',
        timestamp: new Date()
      };
      setChatHistory(prev => [newSession, ...prev]);
      setActivePdfId(pdfId);
      setMessages([{
        id: '1',
        content: `I have read "${file.name}". What would you like to know?`,
        sender: 'bot',
        timestamp: new Date()
      }]);
      setPdfUrl(URL.createObjectURL(file));
    } catch (error) {
      console.error("Failed to upload/process PDF:", error);
      alert("Failed to upload and process PDF. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const loadChatHistory = async (pdfId: string) => {
    setIsBotTyping(true);
    try {
      const res = await chatAPI.getHistory(pdfId);
      const historyMessages = res.data.messages || [];
      const formattedMessages = historyMessages.map((msg: any, index: number) => ({
        id: index.toString(),
        content: msg.content,
        sender: msg.role === 'user' ? 'user' : 'bot',
        timestamp: new Date()
      }));
      setMessages(formattedMessages.length > 0 ? formattedMessages : [{
        id: 'ready',
        content: `Ready to answer questions about this PDF!`,
        sender: 'bot',
        timestamp: new Date()
      }]);
    } catch (e) {
      console.error("Failed to fetch history:", e);
    } finally {
      setIsBotTyping(false);
    }
  };

  const loadPdfFile = async (pdfId: string) => {
    try {
      const res = await pdfAPI.getFile(pdfId);
      const url = URL.createObjectURL(res.data);
      setPdfUrl(url);
    } catch (e) {
      console.error("Failed to load PDF file:", e);
    }
  };

  const handleSelectChat = (pdfId: string) => {
    setActivePdfId(pdfId);
    loadChatHistory(pdfId);
    loadPdfFile(pdfId);
  };

  const handleNewChatSelect = (pdfId: string) => {
    setShowNewChatModal(false);
    handleSelectChat(pdfId);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !activePdfId) return;

    const userMsg = currentMessage;
    const newMessage: Message = {
      id: Date.now().toString(),
      content: userMsg,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
    setIsBotTyping(true);
    
    try {
      const res = await chatAPI.sendMessage(activePdfId, userMsg);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: res.data.answer,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);

      // Update chat history list with latest message
      setChatHistory(prev => prev.map(chat => 
        chat.id === activePdfId ? { ...chat, lastMessage: userMsg } : chat
      ));
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error while processing your request.',
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const d = new Date(date);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Chat History */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* New Chat / Upload Button */}
        <div className="p-4 border-b border-gray-100">
          <input 
            type="file" 
            accept="application/pdf" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <button 
            onClick={() => setShowNewChatModal(true)}
            className="w-full mb-3 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 py-2.5 px-4 rounded-lg transition duration-200 font-medium cursor-pointer border border-blue-200 shadow-sm"
          >
            <MessageCirclePlus size={20} />
            New Chat
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 px-4 rounded-lg transition duration-200 font-medium cursor-pointer shadow-sm"
          >
            {isUploading ? <Loader className="animate-spin" size={20} /> : <Plus size={20} />}
            {isUploading ? "Processing PDF..." : "Upload New PDF"}
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {chatHistory.length === 0 && !isUploading && (
               <div className="p-4 text-center text-sm text-gray-500">
                 No PDFs uploaded yet.
               </div>
            )}
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className={`p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition duration-150 mb-1 group ${activePdfId === chat.id ? 'bg-blue-50 border border-blue-100' : 'bg-white'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare size={16} className={`flex-shrink-0 ${activePdfId === chat.id ? 'text-blue-500' : 'text-gray-400'}`} />
                      <h3 className={`text-sm font-medium truncate ${activePdfId === chat.id ? 'text-blue-700' : 'text-gray-900'}`}>
                        {chat.title}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 truncate mb-1">
                      {chat.lastMessage}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(chat.timestamp)}
                    </p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity">
                    <MoreVertical size={14} className="text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile & Settings Button */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <button onClick={() => navigate('/uploads')} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition duration-200">
             <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
               <FolderOpen size={16} className="text-blue-600" />
             </div>
             <div className="flex-1 text-left">
               <p className="text-sm font-medium">Manage Uploads</p>
             </div>
          </button>
          
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 hover:bg-red-50 hover:text-red-600 rounded-lg transition duration-200">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User size={16} className="text-gray-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">Log out</p>
            </div>
          </button>
        </div>
      </div>

      {/* Right Side - Split View Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer Pane */}
        {activePdfId && pdfUrl && (
          <div className="w-1/2 border-r border-gray-200 flex flex-col bg-gray-100 hidden lg:flex">
            <div className="p-3 bg-white border-b border-gray-200 flex items-center shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700">Document Viewer</h2>
            </div>
            <div className="flex-1 overflow-hidden relative">
               <iframe 
                 src={`${pdfUrl}#toolbar=0`} 
                 className="w-full h-full border-none" 
                 title="PDF Viewer"
               />
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div className={`${activePdfId && pdfUrl ? 'w-full lg:w-1/2' : 'flex-1'} flex flex-col`}>
          {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">ChatPDF</h1>
              <p className="text-sm text-gray-500">AI-powered PDF assistant</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-2xl px-5 py-3.5 rounded-2xl shadow-sm ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          {isBotTyping && (
             <div className="flex justify-start">
               <div className="max-w-xs px-5 py-4 rounded-2xl bg-white border border-gray-100 rounded-bl-none shadow-sm flex items-center gap-1">
                 <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                 <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
               </div>
             </div>
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={activePdfId ? "Ask me anything about your PDF..." : "Upload a PDF to start asking questions"}
                disabled={!activePdfId}
                rows={1}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 transition duration-200 outline-none placeholder-gray-400"
                style={{ minHeight: '52px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || !activePdfId || isBotTyping}
              className="bg-blue-600 shadow-md hover:bg-blue-700 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed text-white p-3.5 rounded-xl transition duration-200 flex-shrink-0"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
        </div>
      </div>

      {/* Modals */}
      <NewChatModal 
        isOpen={showNewChatModal} 
        onClose={() => setShowNewChatModal(false)}
        onSelectPdf={handleNewChatSelect}
      />
    </div>
  );
};

export default Home;