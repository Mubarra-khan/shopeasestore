import api from './axios';

export const getProducts = (params = {}, config = {}) => api.get('/products', { params, ...config });
export const getProductById = (id) => api.get(`/products/${id}`);
export const getFilterOptions = (params = {}) => api.get('/products/filter-options', { params });
export const getSellers = () => api.get('/users/sellers');

let _categoriesPromise = null;
let _categoriesData = null;
export const getCategories = () => {
  if (_categoriesPromise) return _categoriesPromise;
  if (_categoriesData) return Promise.resolve({ data: { data: _categoriesData } });
  _categoriesPromise = api.get('/categories').then((res) => {
    _categoriesData = res?.data?.data || [];
    return res;
  }).catch((err) => {
    _categoriesPromise = null;
    throw err;
  }).finally(() => {
    _categoriesPromise = null;
  });
  return _categoriesPromise;
};

const _subcategoriesCache = new Map();
const _subcategoriesInFlight = new Map();
export const getSubcategories = (categoryId) => {
  const storageKey = `subcategories:${categoryId}`;
  try {
    const cached = sessionStorage.getItem(storageKey);
    if (cached) return Promise.resolve({ data: { data: JSON.parse(cached) } });
  } catch {
    // ignore storage errors
  }
  if (_subcategoriesCache.has(categoryId)) {
    const data = _subcategoriesCache.get(categoryId);
    return Promise.resolve({ data: { data } });
  }
  if (_subcategoriesInFlight.has(categoryId)) return _subcategoriesInFlight.get(categoryId);
  const promise = api.get(`/categories/${categoryId}/subcategories`).then((res) => {
    const data = res?.data?.data || [];
    _subcategoriesCache.set(categoryId, data);
    try { sessionStorage.setItem(storageKey, JSON.stringify(data)); } catch {
      // ignore storage errors
    }
    _subcategoriesInFlight.delete(categoryId);
    return res;
  }).catch((err) => {
    _subcategoriesInFlight.delete(categoryId);
    throw err;
  });
  _subcategoriesInFlight.set(categoryId, promise);
  return promise;
};

const _childSubcategoriesCache = new Map();
const _childSubcategoriesInFlight = new Map();
export const getChildSubcategories = (subcategoryId) => {
  const storageKey = `childSubcategories:${subcategoryId}`;
  try {
    const cached = sessionStorage.getItem(storageKey);
    if (cached) return Promise.resolve({ data: { data: JSON.parse(cached) } });
  } catch {
    // ignore storage errors
  }
  if (_childSubcategoriesCache.has(subcategoryId)) {
    const data = _childSubcategoriesCache.get(subcategoryId);
    return Promise.resolve({ data: { data } });
  }
  if (_childSubcategoriesInFlight.has(subcategoryId)) return _childSubcategoriesInFlight.get(subcategoryId);
  const promise = api.get(`/subcategories/${subcategoryId}/children`).then((res) => {
    const data = res?.data?.data || [];
    _childSubcategoriesCache.set(subcategoryId, data);
    try { sessionStorage.setItem(storageKey, JSON.stringify(data)); } catch {
      // ignore storage errors
    }
    _childSubcategoriesInFlight.delete(subcategoryId);
    return res;
  }).catch((err) => {
    _childSubcategoriesInFlight.delete(subcategoryId);
    throw err;
  });
  _childSubcategoriesInFlight.set(subcategoryId, promise);
  return promise;
};

export const getSuggestions = () => api.get('/suggestions');
export const createSuggestion = (payload) => api.post('/admin/suggestions', payload);
export const updateSuggestion = (id, payload) => api.patch(`/admin/suggestions/${id}`, payload);
export const deleteSuggestion = (id) => api.delete(`/admin/suggestions/${id}`);
