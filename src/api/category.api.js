import api from './axios';

export const getCategories = () => api.get('/categories');
export const getSubcategories = (categoryId) => api.get(`/categories/${categoryId}/subcategories`);
export const createCategory = (payload) => api.post('/categories', payload);
export const updateCategory = (id, payload) => api.patch(`/categories/${id}`, payload);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);
export const createSubcategory = (categoryId, payload) => api.post(`/categories/${categoryId}/subcategories`, payload);
export const updateSubcategory = (id, payload) => api.patch(`/subcategories/${id}`, payload);
export const deleteSubcategory = (id) => api.delete(`/subcategories/${id}`);
export const getChildSubcategories = (subcategoryId) => api.get(`/subcategories/${subcategoryId}/children`);
export const createChildSubcategory = (subcategoryId, payload) => api.post(`/subcategories/${subcategoryId}/children`, payload);
export const updateChildSubcategory = (id, payload) => api.patch(`/child-subcategories/${id}`, payload);
export const deleteChildSubcategory = (id) => api.delete(`/child-subcategories/${id}`);
