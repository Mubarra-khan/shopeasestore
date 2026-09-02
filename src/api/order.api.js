import api from './axios';

export const checkoutOrder = (payload) => api.post('/orders/checkout', payload);
export const getOrders = () => api.get('/orders');
export const getOrderById = (orderId) => api.get(`/orders/${orderId}`);
export const getOrderReviewStatus = (orderId) => api.get(`/orders/${orderId}/review-status`);
export const createPaymentSession = (orderId) =>
  api.post(`/orders/${orderId}/payment-session`);
export const getManagedOrders = () => api.get('/orders/management');
export const getManagedCancelledOrders = () => api.get('/orders/management/cancelled');
export const updateOrderStatus = (orderId, status) =>
  api.patch(`/orders/${orderId}/status`, { status });
export const markOrderAsPaid = (orderId) =>
  api.patch(`/orders/${orderId}/mark-paid`);
export const cancelOrder = (orderId) => api.delete(`/orders/${orderId}`);
