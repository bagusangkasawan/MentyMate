import React from 'react';
import { Heart } from 'lucide-react';

export const Footer = () => (
    <footer className="bg-[#1a4a6e] text-white py-8">
        <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between text-center md:text-left items-center md:items-end">
                <div>
                    <h3 className="text-xl font-bold">MentyMate</h3>
                    <p className="text-sm opacity-80">Teman virtual untuk kesehatan mental yang lebih baik.</p>
                </div>
                <div>
                    <p className="text-sm opacity-80">© {new Date().getFullYear()} MentyMate. Hak Cipta Dilindungi.</p>
                    <p className="text-sm opacity-80 flex items-center justify-center md:justify-start">
                        Dibuat dengan <Heart size={18} className="inline mx-1 text-[#98D2C0]" fill="currentColor" /> untuk kesehatan mental.
                    </p>
                </div>
            </div>
        </div>
    </footer>
);
