import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProductsPage from "./pages/ProductsPage";
import AddProductPage from "./pages/AddProductPage";
import CategoriesPage from "./pages/CategoriesPage";
import UsersPage from "./pages/UsersPage";
import CustomersPage from "./pages/CustomersPage";
import GroupsPage from "./pages/GroupsPage";
import ServiceRequestsPage from "./pages/ServiceRequestsPage";
import ReviewsPage from "./pages/ReviewsPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import NotificationsPage from "./pages/NotificationsPage";
import DeliveriesPage from "./pages/DeliveriesPage";
import DepotsPage from "./pages/DepotsPage";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 🔹 Giriş sayfası */}
        <Route path="/" element={<LoginPage />} />

        {/* 🔹 Dashboard ana sayfa */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* 🔹 Ürün yönetimi */}
        <Route path="/dashboard/products" element={<ProductsPage />} />
        <Route path="/dashboard/products/add" element={<AddProductPage />} />

        {/* 🔹 Kategori yönetimi */}
        <Route path="/dashboard/categories" element={<CategoriesPage />} />

        {/* 🔹 Kullanıcı yönetimi */}
        <Route path="/dashboard/users" element={<UsersPage />} />

        {/* 🔹 Müşteri yönetimi */}
        <Route path="/dashboard/customers" element={<CustomersPage />} />

        {/* 🔹 Grup & izin yönetimi */}
        <Route path="/dashboard/groups" element={<GroupsPage />} />

        {/* 🔹 Servis talepleri */}
        <Route path="/dashboard/service-requests" element={<ServiceRequestsPage />} />

        {/* 🔹 Değerlendirmeler */}
        <Route path="/dashboard/reviews" element={<ReviewsPage />} />

        {/* 🔹 Ürün Atamaları */}
        <Route path="/dashboard/assignments" element={<AssignmentsPage />} />

        {/* 🔹 Bildirim Yönetimi */}
        <Route path="/dashboard/notifications" element={<NotificationsPage />} />

        {/* 🔹 Teslimat Yönetimi */}
        <Route path="/dashboard/deliveries" element={<DeliveriesPage />} />

        {/* 🔹 Depo Yönetimi */}
        <Route path="/dashboard/depots" element={<DepotsPage />} />

        {/* 🔹 Bilinmeyen rota -> login'e yönlendir */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
