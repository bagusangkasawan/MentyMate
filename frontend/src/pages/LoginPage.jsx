import React from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { CustomModal } from '../components/ui/CustomModal';

const ThemedInput = (props) => (
    <input
        {...props}
        className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F959D] focus:outline-none transition-shadow shadow-sm bg-gray-50"
    />
);

export const LoginPage = ({ onLogin }) => {
    const { loading, callApi, modal, setModal } = useApi();

    const handleLogin = async (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;
        try {
            const data = await callApi('/auth/login', 'POST', { username, password });
            if (data && data.token) {
                const userProfile = await callApi('/auth/me', 'GET', null, data.token);
                // Fungsi onLogin di App.jsx akan menangani navigasi
                setModal({
                    show: true,
                    title: "Login Berhasil",
                    message: `Selamat datang, ${userProfile?.username || "User"}!`
                });

                // kasih jeda biar modal kebaca
                setTimeout(() => {
                    onLogin(data.token, userProfile);
                }, 2000);
            }
        } catch (err) {
            // Modal ditampilkan oleh hook callApi
        }
    };

    return (
        <div className="bg-[#F6F8D5] min-h-screen py-10 px-4 flex items-center justify-center">
            {loading && <LoadingSpinner />}
            <CustomModal {...modal} onClose={() => setModal({ ...modal, show: false })} />
            <div className="max-w-md w-full mx-auto">
                <section className="bg-white shadow-lg rounded-xl p-6 sm:p-10 transition-shadow hover:shadow-xl">
                    <div>
                        <h2 className="text-3xl font-bold mb-4 text-center text-[#205781]">Login</h2>
                        <form onSubmit={handleLogin}>
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1 text-gray-700">Username</label>
                                <ThemedInput type="text" name="username" required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
                                <ThemedInput type="password" name="password" required />
                            </div>
                            <button type="submit" className="w-full bg-[#205781] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#1a4a6e] transition-colors">Login</button>
                        </form>
                        <p className="mt-4 text-center text-sm">
                            Belum punya akun? <Link to="/register" className="text-[#4F959D] font-medium hover:underline">Daftar di sini</Link>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};
