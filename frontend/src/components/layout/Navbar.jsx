import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { X, AlignJustify } from 'lucide-react';

export const Navbar = ({ onLogout, user, onChatbotOpen }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navLinks = [
        { name: 'Beranda', path: '/' },
        { name: 'Blog', path: '/blog' },
        { name: 'Checkin', path: '/checkin' },
    ];

    const closeMenu = () => setIsMenuOpen(false);
    
    const handleChatbotClick = () => {
        onChatbotOpen();
        closeMenu();
    }
    
    const activeLinkStyle = { backgroundColor: 'rgba(255, 255, 255, 0.2)' };

    return (
        <nav className="bg-[#205781] text-white sticky top-0 z-50 shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-3">
                    <Link to="/" onClick={closeMenu} className="font-bold text-2xl cursor-pointer hover:opacity-80 transition-opacity">MentyMate</Link>
                    <div className="hidden lg:flex items-center space-x-2">
                        {navLinks.map(link => (
                            <NavLink 
                                key={link.path} 
                                to={link.path} 
                                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                                className="px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-white/15"
                            >
                                {link.name}
                            </NavLink>
                        ))}
                        <a onClick={handleChatbotClick} className="px-3 py-2 rounded-md text-sm font-medium cursor-pointer hover:bg-white/15 transition-colors">Chatbot</a>
                        {user && (
                            <button onClick={onLogout} className="ml-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors">Logout</button>
                        )}
                    </div>
                    <div className="lg:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1 rounded-md hover:bg-white/15 transition-colors">
                            {isMenuOpen ? <X size={24} /> : <AlignJustify size={24} />}
                        </button>
                    </div>
                </div>
            </div>
            {isMenuOpen && (
                <div className="lg:hidden bg-[#1a4a6e]">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map(link => (
                            <NavLink 
                                key={link.path} 
                                to={link.path} 
                                onClick={closeMenu}
                                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                                className="block px-3 py-2 rounded-md text-base font-medium cursor-pointer transition-colors hover:bg-white/15"
                            >
                                {link.name}
                            </NavLink>
                        ))}
                        <a onClick={handleChatbotClick} className="block px-3 py-2 rounded-md text-base font-medium cursor-pointer hover:bg-white/15 transition-colors">Chatbot</a>
                        {user && (
                            <button onClick={() => { onLogout(); closeMenu(); }} className="w-full text-left mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-base font-medium transition-colors">Logout</button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};
