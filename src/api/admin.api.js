import api from './axios';

export const getSellers = () => api.get('/users/admin/sellers');
export const createSeller = (payload) => api.post('/users/admin/sellers', payload);
export const getAdminStats = () => api.get('/users/admin/stats');
export const getMonthlyAnalytics = () => api.get('/users/admin/analytics');
export const getSellerDetails = (sellerId) => api.get(`/users/admin/sellers/${sellerId}`);
export const deactivateSeller = (sellerId) => api.patch(`/users/admin/sellers/${sellerId}/deactivate`);
export const activateSeller = (sellerId) => api.patch(`/users/admin/sellers/${sellerId}/activate`);
export const deleteSeller = (sellerId) => api.delete(`/users/admin/sellers/${sellerId}`);
