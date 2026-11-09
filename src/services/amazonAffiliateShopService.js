/**
 * Public Amazon Associates storefront (separate from inventory /api/products).
 * @module services/amazonAffiliateShopService
 */
import { apiRequest, ENDPOINTS } from './httpClient';

const BASE = ENDPOINTS.AMAZON_LISTINGS;

/**
 * Maps API listing to the card shape used by the shop ProductCard.
 * @param {object} listing
 * @returns {object} Catalog-shaped product with `amazonLink` for the card
 */
export function toCatalogProduct(listing) {
  return {
    id: listing.id,
    name: listing.name,
    description: listing.description ?? null,
    category: listing.category ?? null,
    amazonLink: listing.amazonAffiliateUrl,
    imageUrls: listing.imageUrls ?? null,
    image_url: listing.image_url ?? listing.imageUrls?.[0] ?? null,
  };
}

export async function fetchPublishedAmazonAffiliateListings() {
  const body = await apiRequest({ method: 'GET', url: BASE, skipAuth: true }, 'Amazon shop listings');
  const rows = Array.isArray(body) ? body : [];
  return rows.map(toCatalogProduct);
}

export const fetchAmazonAffiliateListingsAdmin = () =>
  apiRequest({ method: 'GET', url: `${BASE}/admin/all` }, 'Amazon affiliate admin list');

export const importAmazonListingFromUrl = (body) =>
  apiRequest({ method: 'POST', url: `${BASE}/import-from-url`, data: body }, 'Amazon import from URL');

export const createAmazonAffiliateListing = (body) =>
  apiRequest({ method: 'POST', url: BASE, data: body }, 'Create Amazon listing');

export const updateAmazonAffiliateListing = (id, body) =>
  apiRequest({ method: 'PUT', url: `${BASE}/${id}`, data: body }, 'Update Amazon listing');

export async function deleteAmazonAffiliateListing(id) {
  const data = await apiRequest({ method: 'DELETE', url: `${BASE}/${id}` }, 'Delete Amazon listing');
  return data || {};
}
