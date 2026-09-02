import api from './axios';

export const createReturn = (payload) => api.post('/returns', payload);
export const getReturns = () => api.get('/returns');
export const approveReturn = (returnId) => api.patch(`/returns/${returnId}/approve`);
export const rejectReturn = (returnId) => api.patch(`/returns/${returnId}/reject`);
export const refundReturn = (returnId, refundStatus) => api.patch(`/returns/${returnId}/refund`, { refundStatus });
