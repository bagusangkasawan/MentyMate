import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useApi } from './hooks/useApi.js';

// Import Layout Components
import { Navbar } from './components/layout/Navbar.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { ChatbotModal } from './components/chatbot/ChatbotModal.jsx';

// Import Page Components
import { HomePage } from './pages/HomePage.jsx';
import { BlogPage } from './pages/BlogPage.jsx';
import { CheckinPage } from './pages/CheckinPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';

// This is the main component that orchestrates the entire application.
// It manages routing, global state (like authentication), and renders the layout.
export default function App() {
    const { callApi } = useApi();
    const navigate = useNavigate();

    const getDefaultChatMessages = () => [
        {
            sender: 'MentyMate',
            content: 'Halo! Saya MentyMate, asisten kesehatan mental virtualmu. Bagaimana perasaanmu hari ini? Ada yang bisa saya bantu?',
            isMarkdown: true,
        },
    ];
    
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    
    // Chatbot State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [chatMessages, setChatMessages] = useState(() => {
        const storedChat = sessionStorage.getItem('mentyMateChatHistory');
        return storedChat ? JSON.parse(storedChat) : getDefaultChatMessages();
    });
    
    // Check session storage on initial load to maintain login state
    useEffect(() => {
        const storedToken = sessionStorage.getItem('authToken');
        const storedUser = sessionStorage.getItem('user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);
    
    // Save chat history to session storage whenever it changes
    useEffect(() => {
        sessionStorage.setItem('mentyMateChatHistory', JSON.stringify(chatMessages));
    }, [chatMessages]);

    // --- Handlers for State Management ---

    const handleLogin = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        sessionStorage.setItem('authToken', newToken);
        sessionStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.removeItem('mentyMateChatHistory');
        setChatMessages(getDefaultChatMessages());
        navigate('/checkin');
    };

    const handleLogout = () => {
        setToken(null);
        setUser(null);
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('mentyMateChatHistory');
        setChatMessages(getDefaultChatMessages());
        navigate('/');
    };
    
    const handleSendMessage = async (message) => {
        const newMessage = { sender: 'Kamu', content: message, isMarkdown: false };
        setChatMessages(prev => [...prev, newMessage]);
        setIsTyping(true);
        try {
            const data = await callApi('/chat', 'POST', { message }, token);
            const aiMessage = { sender: 'MentyMate', content: data.reply, isMarkdown: true };
            setChatMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            let errorMessage;
            if (error.message === "Unauthorized") {
                errorMessage = { 
                    sender: 'MentyMate', 
                    content: "Harap login terlebih dahulu untuk menggunakan chatbot.", 
                    isMarkdown: false,
                    action: "login" 
                };
            } else {
                errorMessage = { 
                    sender: 'MentyMate', 
                    content: "Maaf, terjadi kesalahan. Silakan coba lagi nanti.", 
                    isMarkdown: false 
                };
            }
            setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };
    
    const handleNavigateFromChatbot = (path) => {
        navigate(path);
        window.scrollTo(0, 0);
    };
    
    // Protected Route: Hanya bisa diakses jika sudah login
    const ProtectedRoute = ({ children }) => {
        if (!token) {
            return <Navigate to="/login" replace />;
        }
        return children;
    };

    // Public Route: Hanya bisa diakses jika belum login
    const PublicRoute = ({ children }) => {
        if (token) {
            return <Navigate to="/checkin" replace />;
        }
        return children;
    };


    return (
        <div className="bg-[#F6F8D5] font-['Poppins'] text-gray-800 flex flex-col min-h-screen">
            <Navbar 
                onLogout={handleLogout} 
                user={user} 
                onChatbotOpen={() => setIsChatOpen(true)} 
            />
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<HomePage onChatbotOpen={() => setIsChatOpen(true)} />} />
                    <Route path="/blog" element={<BlogPage />} />
                    
                    {/* Rute publik yang tidak bisa diakses setelah login */}
                    <Route 
                        path="/login" 
                        element={
                            <PublicRoute>
                                <LoginPage onLogin={handleLogin} />
                            </PublicRoute>
                        } 
                    />
                    <Route 
                        path="/register" 
                        element={
                            <PublicRoute>
                                <RegisterPage />
                            </PublicRoute>
                        } 
                    />

                    {/* Rute yang dilindungi */}
                    <Route 
                        path="/checkin" 
                        element={
                            <ProtectedRoute>
                                <CheckinPage user={user} token={token} onLogin={handleLogin} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } 
                    />

                    {/* Catch-all route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            <Footer />
            <ChatbotModal 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)}
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                isTyping={isTyping}
                onNavigate={handleNavigateFromChatbot}
            />
        </div>
    );
}
