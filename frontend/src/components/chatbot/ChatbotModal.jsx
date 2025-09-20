import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export const ChatbotModal = ({ isOpen, onClose, messages, onSendMessage, isTyping, onNavigate }) => {
    const [input, setInput] = useState('');
    const chatBoxRef = useRef(null);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = () => {
        if (input.trim()) {
            onSendMessage(input.trim());
            setInput('');
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000] p-4 font-sans">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl h-[90vh] max-h-[700px] flex flex-col overflow-hidden">
                <header className="bg-gradient-to-r from-[#205781] to-[#4F959D] text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MessageCircle size={24} />
                        <div>
                            <h5 className="font-bold">MentyMate Chatbot</h5>
                            <small className="opacity-80">Online</small>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white rounded-full p-1 hover:bg-black/20 transition-colors"><X size={24} /></button>
                </header>
                <div ref={chatBoxRef} className="flex-grow p-6 overflow-y-auto bg-gray-100 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'Kamu' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${msg.sender === 'Kamu' ? 'bg-[#4F959D] text-white rounded-br-md' : 'bg-[#205781] text-white rounded-bl-md'}`}>
                                <strong>{msg.sender}:</strong>
                                {msg.action === "login" ? (
                                    <div className="mt-2">
                                        <p>{msg.content}</p>
                                        <button 
                                            onClick={() => {
                                                onNavigate("/login"); 
                                                onClose();
                                            }} 
                                            className="mt-2 px-3 py-1 bg-white text-[#205781] rounded-lg shadow hover:bg-gray-100"
                                        >
                                            Login
                                        </button>
                                    </div>
                                ) : (
                                    <div 
                                        className="prose prose-sm text-white" 
                                        dangerouslySetInnerHTML={{ __html: msg.isMarkdown ? DOMPurify.sanitize(marked.parse(msg.content)) : msg.content }} 
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="max-w-[85%] p-3 rounded-2xl shadow-sm bg-[#205781] text-white rounded-bl-md">
                                <strong>MentyMate:</strong>
                                <div className="flex items-center space-x-1 p-1">
                                    <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce delay-200"></span>
                                    <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce delay-300"></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <footer className="p-4 border-t bg-white">
                    <div className="flex items-center gap-3">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                            placeholder="Ketik pesanmu di sini..."
                            className="flex-grow p-3 border border-gray-300 rounded-full resize-none focus:ring-2 focus:ring-[#4F959D] focus:outline-none transition-shadow"
                            rows="1"
                        ></textarea>
                        <button onClick={handleSend} className="bg-[#4F959D] text-white rounded-full p-3 hover:bg-[#427d83] transition-colors flex-shrink-0 disabled:bg-gray-400" disabled={!input.trim()}>
                            <Send size={20} />
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};
