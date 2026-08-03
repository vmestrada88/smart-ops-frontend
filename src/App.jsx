/**
 * App.jsx - Main application component for Smart Solution frontend.
 * 
 * This component sets up the React Router, global layout (Header, Footer, Contact),
 * and all route definitions for the app, including protected routes for different user roles.
 * 
 * @module App
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Footer from './components/layout/Footer';
import Contact from './components/ui/Contact';
import Header from './components/layout/Header';

import Home from './modules/landing/Home';
import Products from './modules/product/pages/Products';
import Clients from './modules/clients/pages/Clients';
import ClientDetails from './modules/clients/components/ClientDetails';

import { InvoicePage } from './modules/invoice/pages/InvoicePage';
import InvoiceList from './modules/invoice/pages/InvoiceList';
import InvoiceDetail from './modules/invoice/pages/InvoiceDetail';
import ProposalList from './modules/invoice/pages/ProposalList';
import Login from './modules/authentication/pages/Login';
import DashboardAdmin from './modules/dash/admin/DashboardAdmin';
import DashboardTechnician from './modules/dash/technician/DashboardTechnician';
import DashboardClient from './modules/dash/client/DashboardClient';

import ProtectedRoute from './modules/authentication/components/ProtectedRoute';
import Shop from './modules/shop/pages/Shop';
import Orders from './modules/shop/pages/Orders';
import AdminProducts from './modules/admin/products/pages/AdminProducts';
import AdminAmazonShop from './modules/admin/amazon-shop/pages/AdminAmazonShop';

function App() {
  return (
    <Router>
      <Header />
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <Routes>
            {/* Publics Routs */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/login" element={<Login />} />

            {/* DASHBOARDS */}
            <Route
              path="/dash/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dash/technician"
              element={
                <ProtectedRoute allowedRoles={['technician']}>
                  <DashboardTechnician />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dash/client"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <DashboardClient />
                </ProtectedRoute>
              }
            />

            {/* ADMIN */}
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/amazon-shop"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAmazonShop />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Clients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'technician']}>
                  <ClientDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/invoice"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <InvoicePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/invoices"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <InvoiceList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/invoices/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <InvoiceDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/proposals"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProposalList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/proposals/:proposalId/edit"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <InvoicePage />
                </ProtectedRoute>
              }
            />

            {/* CLIENT */}
            {/* <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <Profile />
                </ProtectedRoute>
              }
            /> */}

            {/* SHOP */}
            <Route
              path="/orders"
              element={
                <ProtectedRoute allowedRoles={['admin', 'client', 'technician']}>
                  <Orders />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Contact />
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;



