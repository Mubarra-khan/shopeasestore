import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { addToCart, getCart, removeCartItem, updateCartItem } from '../api/cart.api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, user, token } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setItems([]);
      setTotal(0);
      setError('');
      setSelectedProductIds([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await getCart();
      const payload = response?.data?.data || response?.data || { items: [], total: 0 };
      setItems(payload.items || []);
      setTotal(payload.total || 0);
      setSelectedProductIds((current) =>
        (payload.items || [])
          .map((item) => item.product?._id)
          .filter((id) => id && current.includes(id))
      );
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load cart');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const toggleSelection = useCallback((productId) => {
    setSelectedProductIds((current) => {
      if (current.includes(productId)) {
        return current.filter((id) => id !== productId);
      }
      return [...current, productId];
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedProductIds((items || []).map((item) => item.product?._id).filter(Boolean));
  }, [items]);

  const deselectAll = useCallback(() => {
    setSelectedProductIds([]);
  }, []);

  const isSelected = useCallback((productId) => {
    return selectedProductIds.includes(productId);
  }, [selectedProductIds]);

  const selectedItems = useMemo(() => {
    return (items || []).filter((item) => isSelected(item.product?._id));
  }, [items, isSelected]);

  const areAllSelected = useMemo(() => {
    const availableIds = (items || [])
      .map((item) => item.product?._id)
      .filter(Boolean);
    return availableIds.length > 0 && availableIds.every((id) => selectedProductIds.includes(id));
  }, [items, selectedProductIds]);

  const hasSelection = useMemo(() => selectedProductIds.length > 0, [selectedProductIds]);

  const addItem = useCallback(async (productId, quantity = 1) => {
    setLoading(true);
    setError('');

    try {
      await addToCart(productId, quantity);
      await fetchCart();
      return true;
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to add item to cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    setLoading(true);
    setError('');

    try {
      await updateCartItem(productId, quantity);
      await fetchCart();
      return true;
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update cart item');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const removeItem = useCallback(async (productId) => {
    setLoading(true);
    setError('');

    try {
      await removeCartItem(productId);
      await fetchCart();
      return true;
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to remove item');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    setTotal(0);
    setError('');
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      clearCart();
    }
  }, [isAuthenticated, user, clearCart]);

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      total,
      cartCount,
      loading,
      error,
      fetchCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      setItems,
      setTotal,
      selectedProductIds,
      selectedItems,
      areAllSelected,
      hasSelection,
      toggleSelection,
      selectAll,
      deselectAll,
      isSelected,
    }),
    [
      items,
      total,
      cartCount,
      loading,
      error,
      fetchCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      selectedProductIds,
      selectedItems,
      areAllSelected,
      hasSelection,
      toggleSelection,
      selectAll,
      deselectAll,
      isSelected,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
}
