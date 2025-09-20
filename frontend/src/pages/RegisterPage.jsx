import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { CustomModal } from '../components/ui/CustomModal';

const ThemedInput = (props) => (
    <input
        {...props}
        className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F959D] focus:outline-none transition-shadow shadow-sm bg-gray-50"
    />
);

export const RegisterPage = () => {
    const { loading, callApi, modal, setModal } = useApi();
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const phone = e.target.phone.value;
        const password = e.target.password.value;
        try {
            await callApi('/auth/register', 'POST', { username, phone, password });
            setModal({
                show: true,
                title: 'Sukses',
                message: 'Registrasi berhasil! Anda akan diarahkan ke halaman login.'
            });
            setTimeout(() => {
                navigate('/login');
            }, 2000); // Arahkan setelah 2 detik
        } catch (err) {
             // Modal ditampilkan oleh hook callApi
        }
    };

    return (
        <div className="bg-[#F6F8D5] min-h-screen py-10 px-4 flex items-center justify-center">
            {loading && <LoadingSpinner />}
            <CustomModal {...modal} onClose={() => {
                setModal({ ...modal, show: false });
                if (modal.title === 'Sukses') {
                    navigate('/login');
                }
            }} />
            <div className="max-w-md w-full mx-auto">
                <section className="bg-white shadow-lg rounded-xl p-6 sm:p-10 transition-shadow hover:shadow-xl">
                    <div>
                        <h2 className="text-3xl font-bold mb-4 text-center text-[#205781]">Register</h2>
                        <form onSubmit={handleRegister}>
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1 text-gray-700">Username</label>
                                <ThemedInput type="text" name="username" required />
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1 text-gray-700">Nomor Telepon</label>
                                <ThemedInput type="number" name="phone" required placeholder="Contoh: 628123456789" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
                                <ThemedInput type="password" name="password" required />
                            </div>
                            <button type="submit" className="w-full bg-[#4F959D] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#427d83] transition-colors">Register</button>
                        </form>
                        <p className="mt-4 text-center text-sm">
                            Sudah punya akun? <Link to="/login" className="text-[#4F959D] font-medium hover:underline">Login di sini</Link>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};
