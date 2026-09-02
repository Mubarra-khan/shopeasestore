import { Navigate, Route, Routes } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout';
import SellerLayout from '../layouts/SellerLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import VerifyCode from '../pages/auth/VerifyCode';
import NewPassword from '../pages/auth/NewPassword';
import Home from '../pages/customer/Home';
import Products from '../pages/customer/Products';
import ProductDetails from '../pages/customer/ProductDetails';
import Cart from '../pages/customer/Cart';
import Checkout from '../pages/customer/Checkout';
import Orders from '../pages/customer/Orders';
import OrderDetails from '../pages/customer/OrderDetails';
import PaymentSuccess from '../pages/customer/PaymentSuccess';
import PaymentCancelled from '../pages/customer/PaymentCancelled';
import BecomeSeller from '../pages/customer/BecomeSeller';
import MySellerApplication from '../pages/customer/MySellerApplication';
import Categories from '../pages/customer/Categories';
import Support from '../pages/customer/Support';
import Conversations from '../pages/customer/Conversations';
import ChatDetail from '../pages/customer/ChatDetail';
import Account from '../pages/customer/Account';
import Wishlist from '../pages/customer/Wishlist';
import Reviews from '../pages/customer/Reviews';
import Returns from '../pages/customer/Returns';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminProducts from '../pages/admin/Products';
import AdminCategories from '../pages/admin/Categories';
import AdminOrders from '../pages/admin/Orders';
import AdminCoupons from '../pages/admin/Coupons';
import AdminSellers from '../pages/admin/Sellers';
import AdminReturns from '../pages/admin/Returns';
import AdminBanners from '../pages/admin/Banners';
import AdminSuggestions from '../pages/admin/Suggestions';
import AdminMessages from '../pages/admin/Messages';
import SellerDashboard from '../pages/seller/Dashboard';
import SellerProducts from '../pages/seller/Products';
import SellerOrders from '../pages/seller/Orders';
import SellerProfile from '../pages/seller/Profile';
import SellerCoupons from '../pages/seller/Coupons';
import SellerReturns from '../pages/seller/Returns';
import SellerCancellations from '../pages/seller/Cancellations';
import SellerMessages from '../pages/seller/Messages';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-code" element={<VerifyCode />} />
      <Route path="/reset-password" element={<NewPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:orderId" element={<OrderDetails />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancelled" element={<PaymentCancelled />} />
          <Route path="/become-seller" element={<BecomeSeller />} />
          <Route path="/my-seller-application" element={<MySellerApplication />} />
          <Route path="/support" element={<Support />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/conversations" element={<Conversations />} />
          <Route path="/conversations/:id" element={<ChatDetail />} />
          <Route path="/account" element={<Account />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/returns" element={<Returns />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/coupons" element={<AdminCoupons />} />
            <Route path="/admin/sellers" element={<AdminSellers />} />
          <Route path="/admin/banners" element={<AdminBanners />} />
          <Route path="/admin/suggestions" element={<AdminSuggestions />} />
          <Route path="/admin/returns" element={<AdminReturns />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          </Route>
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['seller']} />}>
          <Route element={<SellerLayout />}>
            <Route path="/seller" element={<SellerDashboard />} />
            <Route path="/seller/products" element={<SellerProducts />} />
            <Route path="/seller/orders" element={<SellerOrders />} />
            <Route path="/seller/returns" element={<SellerReturns />} />
            <Route path="/seller/cancellations" element={<SellerCancellations />} />
            <Route path="/seller/coupons" element={<SellerCoupons />} />
            <Route path="/seller/profile" element={<SellerProfile />} />
            <Route path="/seller/messages" element={<SellerMessages />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/conversations/:id" element={<ChatDetail />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
