import api from './axios';

export const signup = (payload) => api.post('/users/signup', payload);
export const login = (payload) => api.post('/users/login', payload);
export const getProfile = () => api.get('/users/profile');
export const getMyReviews = () => api.get('/users/me/reviews');
export const forgotPassword = (payload) => api.post('/users/forgot-password', payload);
export const verifyResetCode = (payload) => api.post('/users/verify-reset-code', payload);
export const resetPassword = (payload) => api.post('/users/reset-password', payload);
