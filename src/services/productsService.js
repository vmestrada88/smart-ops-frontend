/**
 * Product service module for handling product-related API operations.
 *
 * @module services/productsService
 * @description Provides methods for fetching, creating, updating, and deleting products.
 */
import { apiRequest, ENDPOINTS } from './httpClient';

const BASE = ENDPOINTS.PRODUCTS;

/**
 * Fetches all products from the API (public, no auth).
 *
 * @async
 * @function fetchProducts
 * @returns {Promise<Array>} Promise resolving to an array of product objects.
 * @throws {Error} If there's an error fetching products.
 */
export const fetchProducts = () =>
  apiRequest({ method: 'GET', url: BASE, skipAuth: true }, 'Products');

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
export const createProduct = (productData) =>
  apiRequest({ method: 'POST', url: BASE, data: productData }, 'Create product');

export const updateProduct = (id, productData) =>
  apiRequest({ method: 'PUT', url: `${BASE}/${id}`, data: productData }, 'Update product');

export const deleteProduct = (id) =>
  apiRequest({ method: 'DELETE', url: `${BASE}/${id}` }, 'Delete product');
