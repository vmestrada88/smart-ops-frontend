/**
 * Product service module for handling product-related API operations.
 * 
 * @module services/productsService
 * @description Provides methods for fetching, creating, updating, and deleting products.
 */
import { API_CONFIG, fetchConfig } from './api';

const BASE = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`;

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    ...fetchConfig.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Fetches all products from the API.
 * 
 * @async
 * @function fetchProducts
 * @returns {Promise<Array>} Promise resolving to an array of product objects.
 * @throws {Error} If there's an error fetching products.
 */
export const fetchProducts = async () => {
  // console.log('🔍 Full URL:', BASE);
  
  try {
    const res = await fetch(BASE, { ...fetchConfig });
    // console.log('🔍 Response status:', res.status);
    // console.log('🔍 Response headers:', res.headers.get('content-type'));
    
    if (!res.ok) {
      const errorText = await res.text();
      // console.error('❌ Error response:', errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    
    const data = await res.json();
    // console.log('✅ Products loaded:', data);
    return data;
  } catch (error) {
    // console.error('❌ Fetch error:', error);
    throw error;
  }
};

/**
 * Creates a new product.
 * 
 * @async
 * @function createProduct
 * @param {Object} productData - Product data object.
 * @param {string} productData.name - Product name.
 * @param {string} productData.brand - Product brand.
 * @param {string} productData.model - Product model.
 * @param {string} [productData.description] - Product description.
 * @param {number} productData.priceBuy - Purchase price.
 * @param {number} productData.priceSell - Selling price.
 * @param {number} productData.quantity - Available quantity.
 * @param {string} [productData.category] - Product category.
 * @returns {Promise<Object>} Promise resolving to the created product object.
 * @throws {Error} If there's an error creating the product.
 */
export const createProduct = async (productData) => {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(productData)
  });
  if (!res.ok) throw new Error('Error creating product');
  return res.json();
};

export const updateProduct = async (id, productData) => {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(productData)
  });
  if (!res.ok) throw new Error('Error updating product');
  return res.json();
};

export const deleteProduct = async (id) => {
  const res = await fetch(`${BASE}/${id}`, { 
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Error deleting product');
  return res.json();
};
