import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const ResumeContext = createContext(null);

export const ResumeProvider = ({ children }) => {
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    // Fetch resume on load if user is logged in
    useEffect(() => {
        const fetchResume = async () => {
            if (user) {
                try {
                    const res = await api.get('/resume');
                    setResume(res.data.resume);
                } catch (err) {
                    console.log("No resume found or error fetching", err);
                    setResume(null);
                }
            } else {
                setResume(null);
            }
        };
        fetchResume();
    }, [user]);

    const updateResumeFromChat = async (message) => {
        try {
            setLoading(true);
            const res = await api.post('/resume/chat', { message });
            setResume(res.data.resume);
            setLoading(false);
            return { success: true, data: res.data.resume, chatResponse: res.data.chatResponse };
        } catch (error) {
            setLoading(false);
            return { success: false, error: error.response?.data?.message || "Failed to update resume" };
        }
    };

    return (
        <ResumeContext.Provider value={{ resume, setResume, updateResumeFromChat, loading }}>
            {children}
        </ResumeContext.Provider>
    );
};

export const useResume = () => useContext(ResumeContext);
