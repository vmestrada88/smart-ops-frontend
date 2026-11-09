/**
 * Header component for displaying the application logo, navigation links, and user info.
 * @module components/layout/Header
 * @description Renders the header with navigation based on user role and authentication status.
 * @returns {JSX.Element} Header element.
 */
import React, { useState } from 'react';
import logo from '../../assets/logo.jpg';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const role = user?.role;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-teal-600 p-2 sm:p-4 flex flex-col sm:flex-row justify-between items-center text-white text-xl font-bold gap-2 sm:gap-4 w-full relative">
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <Link to="/" onClick={closeMenu}>
          <img src={logo} alt="Smart Solution Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full cursor-pointer hover:opacity-80 transition-opacity" />
        </Link>
        <Link to="/" onClick={closeMenu} className="text-white font-bold flex flex-col justify-center items-center">
          <h2 className="text-base sm:text-xl">Smart Solution for Living</h2>
          <p className="text-xs sm:text-sm italic">Your trusted partner in smart and security solutions</p>
        </Link>
      </div>

      {/* Mobile menu button */}
      <button
        className="sm:hidden absolute right-4 top-4 text-white text-2xl focus:outline-none"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? '✕' : '☰'}
      </button>
      
      {/* Navigation Menu */}
      <nav className={`flex flex-col sm:flex-row gap-2 sm:gap-4 items-center text-sm w-full sm:w-auto mt-2 sm:mt-0 transition-all duration-300 ease-in-out ${
        isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 sm:max-h-full sm:opacity-100'
      } overflow-hidden sm:overflow-visible`}>
        <Link to="/" onClick={closeMenu} className="hover:text-gray-200 border-b border-white pb-1 sm:pb-2 w-full sm:w-auto text-center sm:text-left">Home</Link>

        {user && (
          <Link to={`/dash/${role}`} onClick={closeMenu} className="hover:text-gray-200 border-b border-white pb-1 sm:pb-2 w-full sm:w-auto text-center sm:text-left">
            Dash {role.charAt(0).toUpperCase() + role.slice(1)}
          </Link>
        )}

        <Link to="/products" onClick={closeMenu} className="hover:text-gray-200 border-b border-white pb-1 sm:pb-2 w-full sm:w-auto text-center sm:text-left">Propousal generator</Link>
        <Link to="/shop" onClick={closeMenu} className="hover:text-gray-200 border-b border-white pb-1 sm:pb-2 w-full sm:w-auto text-center sm:text-left">Shop</Link>

        {role === 'admin' && (
          <>
            <Link to="/clients" onClick={closeMenu} className="hover:text-gray-200 border-b border-white pb-1 sm:pb-2 w-full sm:w-auto text-center sm:text-left">Clients</Link>
            <Link to="/invoices" onClick={closeMenu} className="hover:text-gray-200 border-b border-white pb-1 sm:pb-2 w-full sm:w-auto text-center sm:text-left">Invoices</Link>
            <Link to="/proposals" onClick={closeMenu} className="hover:text-gray-200 border-b border-white pb-1 sm:pb-2 w-full sm:w-auto text-center sm:text-left">Proposals</Link>
            <Link to="/admin/products" onClick={closeMenu} className="hover:text-gray-200 border-b border-white pb-1 sm:pb-2 w-full sm:w-auto text-center sm:text-left bg-yellow-600 px-2 py-1 rounded">Manage Products</Link>
            <Link to="/admin/amazon-shop" onClick={closeMenu} className="hover:text-gray-200 border-b border-white pb-1 sm:pb-2 w-full sm:w-auto text-center sm:text-left bg-amber-700 px-2 py-1 rounded">Amazon shop</Link>
          </>
        )}

        {role === 'client' && (
          <Link to="/profile" onClick={closeMenu} className="hover:text-gray-200 w-full sm:w-auto text-center sm:text-left">My Profile</Link>
        )}

        {!user && (
          <Link to="/login" onClick={closeMenu} className="hover:text-gray-200 border-b border-white pb-1 sm:pb-2 w-full sm:w-auto text-center sm:text-left">Login</Link>
        )}

        {user && (
          <div className="flex flex-col items-center gap-1 w-full sm:w-auto">
            <span className="text-xs sm:text-sm font-light">Hello, {user.name}</span>
            <button
              onClick={handleLogout}
              className="px-2 py-1 sm:px-3 sm:py-1 bg-white text-teal-600 rounded hover:bg-gray-100 text-xs sm:text-sm w-full sm:w-auto"
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
