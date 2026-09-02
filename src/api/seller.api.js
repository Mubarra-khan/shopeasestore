import api from './axios';

export const getSellerProducts = () => api.get('/products/seller');
export const getSellerDashboardStats = () => api.get('/products/seller/stats');
export const getSellerAnalytics = () => api.get('/products/seller/analytics');
export const createSellerProduct = (payload) => api.post('/products', payload);
export const updateSellerProduct = (productId, payload) => api.put(`/products/${productId}`, payload);
export const deleteSellerProduct = (productId) => api.delete(`/products/${productId}`);
export const uploadSellerProductImage = (file) => {
	const formData = new FormData();
	formData.append('image', file);
	return api.post('/products/upload-image', formData, {
		headers: { 'Content-Type': 'multipart/form-data' },
	});
};
export const uploadSellerProductVideo = (file) => {
	const formData = new FormData();
	formData.append('video', file);
	return api.post('/products/upload-video', formData, {
		headers: { 'Content-Type': 'multipart/form-data' },
	});
};
export const getSellerCoupons = () => api.get('/coupons/seller/coupons');
export const createSellerCoupon = (payload) => api.post('/coupons/seller/coupons', payload);
