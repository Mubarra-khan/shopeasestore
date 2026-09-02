import api from './axios';

export const getBanners = () => api.get('/banners');
export const getAdminBanners = () => api.get('/admin/banners');
export const createBanner = (payload) => api.post('/admin/banners', payload);
export const updateBanner = (bannerId, payload) => api.patch(`/admin/banners/${bannerId}`, payload);
export const deleteBanner = (bannerId) => api.delete(`/admin/banners/${bannerId}`);
export const uploadBannerImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/admin/banners/upload-image', formData);
};
