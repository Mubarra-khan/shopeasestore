import api from './axios';

export const validateCoupon = (payload) => api.post('/coupons/validate', payload);
export const createCoupon = (payload) => api.post('/coupons', payload);
export const getCoupons = () => api.get('/coupons');
export const updateCoupon = (couponId, payload) =>
  api.patch(`/coupons/${couponId}`, payload);
export const toggleCoupon = (couponId) => api.patch(`/coupons/${couponId}/toggle`);
export const deleteCoupon = (couponId) => api.delete(`/coupons/${couponId}`);
