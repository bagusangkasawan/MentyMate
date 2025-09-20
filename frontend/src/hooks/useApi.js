import React, { useState } from 'react';
import { API_BASE_URL } from '../config/index';

export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({ show: false, title: '', message: '' });

    const callApi = async (endpoint, method = 'GET', body = null, token = null) => {
        setLoading(true);
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const config = { method, headers };
            if (body) {
                config.body = JSON.stringify(body);
            }
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            if (response.status === 204) return null;
            return await response.json();
        } catch (error) {
            if (!(endpoint === "/chat" && error.message === "Unauthorized")) {
                console.error('API Call Error:', error);
            }

            setModal({ show: true, title: 'Error', message: error.message });
            throw error;
        } finally {
            setLoading(false);
        }
    };
    
    return { loading, callApi, modal, setModal };
};
