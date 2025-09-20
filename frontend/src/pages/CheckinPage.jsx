import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { CustomModal } from '../components/ui/CustomModal';
import { UserCog, Home } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// This is a reusable styled input component to ensure consistency
const ThemedInput = (props) => (
    <input 
        {...props}
        className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F959D] focus:outline-none transition-shadow shadow-sm bg-gray-50"
    />
);

export const CheckinPage = ({ user, token, onLogin, onLogout }) => {
    const { loading, callApi, modal, setModal } = useApi();
    
    // Logged in state
    const [currentView, setCurrentView] = useState('main'); // 'main', 'edit', 'history', 'recommendation'
    const [selectedMood, setSelectedMood] = useState("baik");
    const [checkinHistory, setCheckinHistory] = useState([]);
    const [recommendation, setRecommendation] = useState('');

    const fetchHistory = async () => {
        try {
            const data = await callApi('/checkin', 'GET', null, token);
            setCheckinHistory(data.sort((a,b) => new Date(b.date) - new Date(a.date)));
            setCurrentView('history');
        } catch(err) {
            console.error(err);
        }
    }

    const fetchRecommendation = async () => {
        try {
            const data = await callApi('/checkin/recommendation', 'GET', null, token);
            setRecommendation(data.recommendation || 'Tidak ada rekomendasi terbaru.');
            setCurrentView('recommendation');
        } catch(err) {
            console.error(err);
        }
    }
    
    const handleCheckinSubmit = (e) => {
        e.preventDefault();
        const mood = selectedMood;
        const description = e.target.description.value;

        // Simpan sementara data form
        const pendingData = { mood, description };

        setModal({
            show: true,
            title: "Konfirmasi Check-in",
            message:
            "Apakah kamu yakin ingin mengirim check-in ini? <br/>Data tidak bisa diubah atau dihapus setelah dikirim.",
            confirmText: "Ya, Kirim",
            cancelText: "Batal",
            onConfirm: async () => {
            try {
                await callApi("/checkin", "POST", pendingData, token);
                setModal({
                show: true,
                title: "Sukses",
                message: "Check-in berhasil disimpan!"
                });
                fetchHistory();
            } catch (err) {
                // error sudah ditangani useApi
            }
            },
            onCancel: () => setModal({ show: false })
        });

        // reset form setelah submit
        e.target.reset();
    };
    
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const body = {
            username: e.target.username.value,
            phone: e.target.phone.value,
        };
        if(e.target.password.value){
            body.password = e.target.password.value
        }
        
        try {
            await callApi('/auth/update-profile', 'PUT', body, token);
            setModal({show: true, title: 'Sukses', message: 'Profil berhasil diperbarui!'});
            // Re-fetch user profile to update name
            const userProfile = await callApi('/auth/me', 'GET', null, token);
            onLogin(token, userProfile); // re-login to update user state in App
            setCurrentView('main');
        } catch (err) {
            // modal handled
        }
    }

    const renderMoodEmoji = (mood) => {
        if (mood === 'baik') return '😊';
        if (mood === 'sedang') return '😐';
        if (mood === 'buruk') return '😟';
        return '';
    }

    const MainCheckinView = () => (
        <div>
            <form onSubmit={handleCheckinSubmit} className="mb-4">
                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bagaimana perasaanmu hari ini?
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { value: "baik", emoji: "😊", text: "Baik", color: "bg-green-100 border-green-400" },
                            { value: "sedang", emoji: "😐", text: "Sedang", color: "bg-yellow-100 border-yellow-400" },
                            { value: "buruk", emoji: "😟", text: "Buruk", color: "bg-red-100 border-red-400" },
                        ].map((mood) => (
                            <div
                                key={mood.value}
                                onClick={() => setSelectedMood(mood.value)}
                                className={`cursor-pointer flex flex-col items-center justify-center gap-1 p-4 text-center rounded-lg border font-semibold transition-all
                                    ${selectedMood === mood.value 
                                        ? `${mood.color} ring-2 ring-offset-2 ring-${mood.color.split('-')[1]}-500` 
                                        : "bg-gray-50 border-gray-300 hover:bg-gray-100"}`}
                            >
                                <span className="text-2xl">{mood.emoji}</span>
                                <span className="text-sm sm:inline hidden">{mood.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Ceritakan lebih lanjut (opsional):
                    </label>
                    <textarea id="description" name="description" rows="3" className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F959D] focus:outline-none transition-shadow shadow-sm bg-gray-50"></textarea>
                </div>
                <button type="submit" className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md">
                    Kirim Check-in
                </button>
            </form>
            <div className="grid sm:grid-cols-2 gap-3">
                <button onClick={fetchRecommendation} className="w-full bg-[#205781] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#1a4a6e] transition-colors">
                    Dapatkan Rekomendasi
                </button>
                <button onClick={fetchHistory} className="w-full bg-[#4F959D] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#427d83] transition-colors">
                    Riwayat Check-in
                </button>
            </div>
        </div>
    );
    
    const EditProfileView = () => (
        <div>
            <h3 className="text-xl font-semibold mb-3 text-[#205781]">Edit Profil</h3>
            <form onSubmit={handleProfileUpdate}>
                <div className="mb-3">
                    <label htmlFor="editUsername" className="block text-sm font-medium">Username Baru</label>
                    <ThemedInput type="text" id="editUsername" name="username" defaultValue={user.username} />
                </div>
                <div className="mb-3">
                    <label htmlFor="editPhone" className="block text-sm font-medium">Nomor Telepon Baru</label>
                    <ThemedInput type="number" id="editPhone" name="phone" defaultValue={user?.phone ?? "62"} />
                    <p className="text-xs text-gray-500 mt-1">Diawali dengan 62, contoh 628123456789.</p>
                </div>
                <div className="mb-3">
                    <label htmlFor="editPassword" className="block text-sm font-medium">Password Baru</label>
                    <ThemedInput type="password" id="editPassword" name="password" placeholder="Kosongkan jika tidak ingin diubah" />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={() => setCurrentView('main')} className="bg-gray-200 text-gray-800 text-sm font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Batal</button>
                    <button type="submit" className="bg-[#205781] text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-[#1a4a6e] transition-colors">Simpan Perubahan</button>
                </div>
            </form>
        </div>
    );
    
    const HistoryView = () => (
        <div className="mt-4">
            <h3 className="text-xl font-semibold mb-3 text-[#205781]">Riwayat Check-in Anda</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {checkinHistory.length > 0 ? checkinHistory.map(item => (
                    <div key={item.date} className="bg-teal-50 border border-[#4F959D] p-4 rounded-lg">
                        <p className="font-semibold text-gray-800">Tanggal: <span className="font-normal">{new Date(item.date).toLocaleString('id-ID')}</span></p>
                        <p className="font-semibold text-gray-800">Mood: <span className="font-normal capitalize">{item.mood} {renderMoodEmoji(item.mood)}</span></p>
                        <p className="font-semibold text-gray-800">Deskripsi: <span className="font-normal">{item.description || '-'}</span></p>
                    </div>
                )) : <p>Belum ada riwayat check-in.</p>}
            </div>
        </div>
    );

    const RecommendationView = () => (
        <div className="mt-4 bg-teal-50 border border-[#98D2C0] p-5 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-[#205781]">Rekomendasi Aktivitas</h3>
            <div className="prose" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(recommendation)) }} />
        </div>
    );
    
    if (!user) {
        // Ini akan ditampilkan sebentar sebelum redirect dari ProtectedRoute berjalan
        return <LoadingSpinner />;
    }
    
    return (
        <div className="bg-[#F6F8D5] min-h-screen py-10 px-4">
            {loading && <LoadingSpinner />}
            <CustomModal {...modal} onClose={() => setModal({ ...modal, show: false })} />
            <div className="max-w-2xl mx-auto">
                <section className="bg-white shadow-lg rounded-xl p-6 sm:p-10 transition-shadow hover:shadow-xl">
                    <h2 className="text-3xl font-bold mb-2 text-center text-[#205781]">Daily Check-in</h2>
                    <p className="text-center mb-3 text-gray-700">Selamat datang kembali, {user?.username}!</p>

                    <div className="space-y-5">
                        <div className="text-center">
                            <p className="text-base text-gray-700">
                            <span className="font-semibold text-[#205781]">Di halaman Check-in ini</span>, Anda dapat:
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { icon: "📝", title: "Mencatat perasaan", desc: "dan kondisi mentalmu setiap hari." },
                                { icon: "💡", title: "Mendapatkan saran", desc: "aktivitas positif yang dipersonalisasi." },
                                { icon: "📊", title: "Melihat riwayat check-in", desc: "untuk memantau perkembangan." },
                                { icon: "👤", title: "Mengelola profil", desc: "agar pengalamanmu lebih personal." },
                            ].map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 p-4 bg-[#F6FCDF] border border-[#d6e9e0] rounded-xl shadow-sm 
                                        hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                            >
                                <span className="text-xl flex-shrink-0">{item.icon}</span>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-800">{item.title}</h4>
                                    <p className="text-sm text-gray-600">{item.desc}</p>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-center m-4 flex flex-wrap justify-center gap-2">
                        <button 
                            onClick={() => setCurrentView('main')} 
                            className={`text-sm font-semibold py-1 px-3 rounded-lg flex items-center gap-1 transition-all
                            ${currentView === 'main' 
                                ? 'bg-[#205781] text-white shadow-md' 
                                : 'bg-transparent border border-[#205781] text-[#205781] hover:bg-[#205781] hover:scale-105 hover:shadow-md'}`
                            }
                        >
                            <Home size={14} /> 
                            Beranda Checkin
                        </button>

                        <button 
                            onClick={() => setCurrentView('edit')} 
                            className={`text-sm font-semibold py-1 px-3 rounded-lg flex items-center gap-1 transition-all
                            ${currentView === 'edit' 
                                ? 'bg-[#205781] text-white shadow-md' 
                                : 'bg-transparent border border-[#205781] text-[#205781] hover:bg-[#205781] hover:scale-105 hover:shadow-md'}`
                            }
                        >
                            <UserCog size={14} /> 
                            Edit Profil
                        </button>
                    </div>

                    {currentView === 'main' && <MainCheckinView />}
                    {currentView === 'edit' && <EditProfileView />}
                    {currentView === 'history' && <HistoryView />}
                    {currentView === 'recommendation' && <RecommendationView />}
                </section>
            </div>
        </div>
    );
};
