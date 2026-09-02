import api from './axios';

export const getProductReviews = (productId) =>
  api.get(`/products/${productId}/reviews`);

export const getReviewEligibility = (productId, params = {}) =>
  api.get(`/products/${productId}/reviews/eligibility`, { params });

export const createProductReview = (productId, payload) =>
  api.post(`/products/${productId}/reviews`, payload);

export const updateProductReview = (productId, reviewId, payload) =>
  api.patch(`/products/${productId}/reviews/${reviewId}`, payload);

export const deleteProductReview = (productId, reviewId) =>
  api.delete(`/products/${productId}/reviews/${reviewId}`);
