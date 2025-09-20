import React, { useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import DOMPurify from 'dompurify';
import { blogData, allCategories } from '../data/blogData';

export const BlogPage = () => {
    const [activeCategory, setActiveCategory] = useState('Semua');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingArticle, setViewingArticle] = useState(null);

    const filteredArticles = blogData.filter(post => {
        const categoryMatch = activeCategory === 'Semua' || post.categories.includes(activeCategory);
        const searchMatch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        return categoryMatch && searchMatch;
    });

    if (viewingArticle) {
        return (
            <section className="py-10 bg-[#F6F8D5]">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                        <button onClick={() => setViewingArticle(null)} className="flex items-center gap-2 text-sm text-gray-600 hover:bg-[#205781] hover:text-white mb-4 font-semibold border border-gray-300 rounded-md px-4 py-2 transition">
                            <ArrowLeft size={16} /> Kembali ke Blog
                        </button>
                        <img src={viewingArticle.img} alt={viewingArticle.title} className="w-full h-64 object-cover rounded-lg mb-4" />
                        <div className="flex flex-wrap gap-2 mb-2">
                            {viewingArticle.categories.map(cat => (
                                <span key={cat} className="text-xs font-semibold bg-[#98D2C0] text-[#205781] px-3 py-1 rounded-full">{cat}</span>
                            ))}
                        </div>
                        <h1 className="text-3xl font-bold text-[#205781] my-3">{viewingArticle.title}</h1>
                        <div className="text-sm text-gray-500 mb-6">
                            <span>{viewingArticle.date}</span> &bull; <span>{viewingArticle.author}</span> &bull; <span>{viewingArticle.readTime}</span>
                        </div>
                        <div className="article-content prose max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(viewingArticle.content) }} />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <div>
            <header className="py-16 text-white bg-gradient-to-r from-[#205781] to-[#4F959D] text-center">
                <div className="container mx-auto px-4 relative z-10">
                    <h1 className="text-5xl font-bold mb-3">Blog MentyMate</h1>
                    <p className="text-xl opacity-90">Artikel dan edukasi untuk kesehatan mental dan kesejahteraan psikologis</p>
                </div>
            </header>
            <section className="py-12 bg-[#F6F8D5]">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Main Content */}
                        <div className="lg:w-2/3">
                            <div className="mb-6 pb-4 border-b border-gray-200">
                                <div className="flex flex-wrap gap-2">
                                    {allCategories.map(cat => (
                                        <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${activeCategory === cat ? 'bg-[#205781] text-white shadow-md' : 'bg-white text-[#205781] border border-[#205781] hover:bg-[#205781] hover:scale-105 hover:shadow-md'}`}>
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                {filteredArticles.length > 0 ? filteredArticles.map(post => (
                                    <div key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col border-t-4 border-[#98D2C0] transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
                                        <img src={post.img} alt={post.title} className="w-full h-48 object-cover" />
                                        <div className="p-5 flex flex-col flex-grow">
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {post.categories.map(cat => (
                                                    <span key={cat} className="text-xs font-semibold bg-[#98D2C0] text-[#205781] px-2 py-1 rounded-full">{cat}</span>
                                                ))}
                                            </div>
                                            <small className="text-gray-500 mb-2">{post.date}</small>
                                            <h3 className="text-lg font-bold text-[#205781] mb-2">{post.title}</h3>
                                            <p className="text-sm text-gray-600 text-justify mb-3">{post.excerpt}</p>
                                            <button
                                                onClick={() => {
                                                    setViewingArticle(post);
                                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                                }}
                                                className="mt-auto bg-[#205781] text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-[#1a4a6e] hover:scale-105 transition-colors self-start"
                                            >
                                                Baca Selengkapnya
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="md:col-span-2 text-center text-gray-500">Tidak ada artikel yang cocok dengan pencarian Anda.</p>
                                )}
                            </div>
                        </div>
                        {/* Sidebar */}
                        <aside className="lg:w-1/3 space-y-6">
                            <div className="bg-white p-5 rounded-xl shadow-lg">
                                <h4 className="sidebar-title text-lg font-bold text-[#205781] mb-2">Cari Artikel</h4>
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        placeholder="Kata kunci..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-3 pr-12 focus:ring-2 focus:ring-[#4F959D] focus:outline-none transition-shadow"
                                    />
                                    <Search
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                        size={20}
                                    />
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-xl shadow-lg">
                                <h4 className="sidebar-title text-lg font-bold text-[#205781] mb-2">Kategori</h4>
                                <ul className="mt-2 space-y-1">
                                    {allCategories.map(cat => (
                                        <li key={cat}>
                                            <a href="#" onClick={(e) => {e.preventDefault(); setActiveCategory(cat)}} className={`block text-gray-700 hover:text-[#205781] hover:bg-teal-50 p-2 rounded-lg transition-colors text-sm ${activeCategory === cat ? 'font-bold text-[#205781] bg-teal-100' : ''}`}>
                                                {cat}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-white p-7 rounded-xl shadow-lg">
                                <h4 className="sidebar-title text-lg font-bold text-[#205781] mb-2">Sumber Bantuan</h4>
                                <div className="flex flex-col gap-3">
                                    <a
                                    href="tel:021-500-454"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-3 border border-gray-300 rounded-lg text-base text-gray-700 hover:bg-teal-50 hover:text-[#205781] transition"
                                    >
                                    📞 Hotline Kesehatan Jiwa Kemenkes
                                    </a>
                                    <a
                                    href="https://www.halodoc.com/kesehatan-mental"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-3 border border-gray-300 rounded-lg text-base text-gray-700 hover:bg-teal-50 hover:text-[#205781] transition"
                                    >
                                    🩺 Konsultasi dengan Profesional
                                    </a>
                                    <a
                                    href="https://www.alodokter.com/search?s=Kesehatan+Mental"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-3 border border-gray-300 rounded-lg text-base text-gray-700 hover:bg-teal-50 hover:text-[#205781] transition"
                                    >
                                    📘 Artikel & Panduan Self-Help
                                    </a>
                                    <a
                                    href="https://chat.whatsapp.com/Ik6WUUxF4ZPJjwJu5FlP6S"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-3 border border-gray-300 rounded-lg text-base text-gray-700 hover:bg-teal-50 hover:text-[#205781] transition"
                                    >
                                    🤝 Support Group
                                    </a>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </div>
    );
};
