import React from 'react';
import { MessageCircle, BookOpen, CheckSquare, Clock, Lock, BrainCircuit, Heart, Check } from 'lucide-react';

export const HomePage = ({ onChatbotOpen }) => (
    <div>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 text-white bg-gradient-to-r from-[#205781] to-[#4F959D]">
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="lg:w-1/2 text-center lg:text-left">
                        <h1 className="text-5xl font-bold mb-4">MentyMate</h1>
                        <p className="text-lg opacity-90 mb-8 max-w-lg mx-auto lg:mx-0">Teman virtual untuk menjaga kesehatan mentalmu. Dapatkan dukungan, tips relaksasi, dan rekomendasi aktivitas positif setiap saat.</p>
                        <button onClick={onChatbotOpen} className="bg-white text-[#205781] px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-200 transition-all transform hover:scale-105 shadow-lg">
                            <MessageCircle className="inline mr-2" size={20} />
                            Mulai Chat Sekarang
                        </button>
                    </div>
                    <div className="lg:w-1/2 flex justify-center">
                        <svg className="w-full max-w-[450px] opacity-90 animate-float drop-shadow-custom" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="200" cy="200" r="180" fill="#A7D7C5" opacity="0.3" />
                            <circle cx="200" cy="200" r="150" fill="#E8F6EF" opacity="0.7" />
                            <circle cx="200" cy="200" r="120" stroke="#6AB7A8" strokeWidth="8" strokeDasharray="16 12" />
                            <circle cx="200" cy="200" r="80" fill="#F2FAF5" />
                            <path d="M170 195 Q175 190, 180 195" stroke="#4F6367" strokeWidth="4" strokeLinecap="round" fill="none"/>
                            <path d="M220 195 Q225 190, 230 195" stroke="#4F6367" strokeWidth="4" strokeLinecap="round" fill="none"/>
                            <path d="M170 230 Q200 250, 230 230" stroke="#4F6367" strokeWidth="5" fill="none" strokeLinecap="round" />
                            <path d="M200 205 C200 200, 192 197, 190 205 C188 213, 200 220, 200 220 C200 220, 212 213, 210 205 C208 197, 200 200, 200 205Z" fill="#E27D60" />
                        </svg>
                    </div>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-[#F6F8D5]">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-center text-[#205781] mb-16 section-title">Fitur MentyMate</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center border-t-4 border-[#98D2C0] transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
                        <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-teal-100 text-[#4F959D] mb-4">
                            <MessageCircle size={36} />
                        </div>
                        <h3 className="text-xl font-semibold text-[#205781] mb-2">Chatbot Interaktif</h3>
                        <p>Mengobrol dengan chatbot AI kami yang dirancang untuk memberikan dukungan emosional, menjawab pertanyaanmu, dan memberikan saran praktis kapan saja.</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center border-t-4 border-[#98D2C0] transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
                        <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-teal-100 text-[#4F959D] mb-4">
                            <BookOpen size={36} />
                        </div>
                        <h3 className="text-xl font-semibold text-[#205781] mb-2">Artikel Blog Informatif</h3>
                        <p>Akses kumpulan artikel, tips, dan wawasan terbaru seputar kesehatan mental, pengembangan diri, dan informasi mengenai dampak negatif judi online (judol).</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center border-t-4 border-[#98D2C0] transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
                        <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-teal-100 text-[#4F959D] mb-4">
                            <CheckSquare size={36} />
                        </div>
                        <h3 className="text-xl font-semibold text-[#205781] mb-2">Daily Checkin</h3>
                        <p>Catat suasana hatimu setiap hari, pantau perkembangan emosionalmu, dan dapatkan rekomendasi aktivitas yang disesuaikan dengan mood-mu.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-center text-[#205781] mb-16 section-title">Manfaat MentyMate</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                    <div className='flex flex-col h-full justify-between'>
                        <Clock size={48} className="mx-auto text-[#4F959D] mb-4" />
                        <h3 className="text-xl font-semibold text-[#205781] mb-2">Akses 24/7</h3>
                        <p>Dapatkan dukungan kapan saja dan di mana saja saat kamu membutuhkannya.</p>
                    </div>
                    <div className='flex flex-col h-full justify-between'>
                        <Lock size={48} className="mx-auto text-[#4F959D] mb-4" />
                        <h3 className="text-xl font-semibold text-[#205781] mb-2">Privasi Terjaga</h3>
                        <p>Semua percakapan bersifat sangat pribadi dan selalu dijaga kerahasiaannya.</p>
                    </div>
                    <div className='flex flex-col h-full justify-between'>
                        <BrainCircuit size={48} className="mx-auto text-[#4F959D] mb-4" />
                        <h3 className="text-xl font-semibold text-[#205781] mb-2">Kecerdasan AI</h3>
                        <p>Didukung teknologi AI untuk memberikan respons yang personal dan empatik.</p>
                    </div>
                    <div className='flex flex-col h-full justify-between'>
                        <Heart size={48} className="mx-auto text-[#4F959D] mb-4" />
                        <h3 className="text-xl font-semibold text-[#205781] mb-2">Peningkatan Kesejahteraan</h3>
                        <p>Bantu tingkatkan kualitas hidup dengan praktik kesehatan mental positif.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Pricing Section - START */}
        <section className="py-20 bg-[#F6F8D5]">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-center text-[#205781] mb-4 section-title">Pilih Paket yang Tepat Untukmu</h2>
                <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Mulai secara gratis atau buka semua fitur canggih untuk dukungan kesehatan mental yang lebih proaktif.</p>
                <div className="flex flex-col lg:flex-row justify-center items-center lg:items-stretch gap-8">
                    {/* Free Plan */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border-2 border-gray-200 flex flex-col">
                        <h3 className="text-2xl font-bold text-[#4F959D]">Free</h3>
                        <p className="text-gray-500 mt-2 h-12">Untuk memulai perjalanan kesehatan mentalmu yang lebih baik.</p>
                        <p className="text-4xl font-bold text-[#205781] my-6">Gratis</p>
                        <a href="/checkin" className="w-full text-center bg-gray-200 text-[#205781] py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors transform hover:scale-105">Mulai Gratis</a>
                        <div className="border-t my-6"></div>
                        <ul className="space-y-4 text-gray-700 text-left flex-grow">
                            <li className="flex items-center"><Check className="text-green-500 mr-3" size={20} /> Akses ke AI Chatbot (Terbatas)</li>
                            <li className="flex items-center"><Check className="text-green-500 mr-3" size={20} /> Fitur Daily Check-in dasar</li>
                            <li className="flex items-center"><Check className="text-green-500 mr-3" size={20} /> Rekomendasi aktivitas personal</li>
                            <li className="flex items-center"><Check className="text-green-500 mr-3" size={20} /> Akses ke semua artikel publik</li>
                            <li className="flex items-center"><Check className="text-green-500 mr-3" size={20} /> Grup dukungan umum</li>
                        </ul>
                    </div>

                    {/* Premium Plan */}
                    <div className="bg-[#205781] text-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform lg:scale-105 relative border-2 border-[#4F959D] flex flex-col">
                        <span className="absolute top-0 right-8 -mt-4 bg-[#E27D60] text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">Paling Populer</span>
                        <h3 className="text-2xl font-bold text-white">Premium</h3>
                        <p className="opacity-80 mt-2 h-12">Dapatkan dukungan penuh dan analisis mood mendalam dari AI.</p>
                        <p className="text-4xl font-bold my-6">Rp 25.000<span className="text-lg opacity-80">/bulan</span></p>
                        <a href="/checkin" className="w-full text-center bg-white text-[#205781] py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors transform hover:scale-105">Pilih Premium</a>
                        <div className="border-t border-gray-500 my-6"></div>
                        <ul className="space-y-4 text-left flex-grow">
                            <li className="flex items-center"><Check className="text-teal-300 mr-3" size={20} /> <span className="font-semibold">Semua fitur Gratis</span></li>
                            <li className="flex items-center"><Check className="text-teal-300 mr-3" size={20} /> Akses tak terbatas ke AI Chatbot</li>
                            <li className="flex items-center"><Check className="text-teal-300 mr-3" size={20} /> Laporan analisis mood berkala</li>
                            <li className="flex items-center"><Check className="text-teal-300 mr-3" size={20} /> Akses ke konten premium</li>
                            <li className="flex items-center"><Check className="text-teal-300 mr-3" size={20} /> Grup dukungan privat & intensif</li>
                        </ul>
                    </div>
                    
                    {/* MentyMate untuk Sekolah Plan */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border-2 border-gray-200 flex flex-col">
                        <h3 className="text-2xl font-bold text-[#4F959D]">Untuk Sekolah</h3>
                        <p className="text-gray-500 mt-2 h-12">Solusi kesehatan mental komprehensif untuk siswa di institusi Anda.</p>
                        <p className="text-4xl font-bold text-[#205781] my-6">Hubungi Kami</p>
                        <a href="/checkin" className="w-full text-center bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors transform hover:scale-105">Hubungi Sales</a>
                        <div className="border-t my-6"></div>
                        <ul className="space-y-4 text-gray-700 text-left flex-grow">
                            <li className="flex items-center"><Check className="text-green-500 mr-3" size={20} /> <span className="font-semibold">Semua fitur Premium</span></li>
                            <li className="flex items-center"><Check className="text-green-500 mr-3" size={20} /> Dasbor agregat anonim</li>
                            <li className="flex items-center"><Check className="text-green-500 mr-3" size={20} /> Dukungan implementasi</li>
                            <li className="flex items-center"><Check className="text-green-500 mr-3" size={20} /> Edukasi untuk guru & orang tua</li>
                            <li className="flex items-center"><Check className="text-green-500 mr-3" size={20} /> Prioritas dukungan pelanggan</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
        {/* Pricing Section - END */}

        {/* CTA Section */}
        <section className="py-16 bg-[#4F959D]">
            <div className="container mx-auto px-4 text-center text-white">
                <h2 className="text-3xl font-bold mb-4">Siap Meningkatkan Kesehatan Mentalmu?</h2>
                <p className="mb-8 max-w-2xl mx-auto">MentyMate hadir untuk mendampingimu dalam perjalanan kesehatan mental yang lebih baik.</p>
                <button 
                    onClick={onChatbotOpen} 
                    className="bg-white text-[#205781] px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-200 transition-all transform hover:scale-105 shadow-lg"
                >
                    <MessageCircle className="inline mr-2" size={20} />
                    Mulai Sekarang
                </button>
            </div>
        </section>
    </div>
);
