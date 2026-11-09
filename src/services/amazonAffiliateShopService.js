/**
 * Public Amazon Associates storefront (separate from inventory /api/products).
 * @module services/amazonAffiliateShopService
 */
import { API_CONFIG, fetchConfig } from './api';
import { readJsonResponse } from '../utils/readJsonResponse';

const LISTINGS_BASE = `${API_CONFIG.BASE_URL}/shop/amazon-listings`;

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    ...fetchConfig.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

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

function throwIfNotOk(res, body, label) {
  if (res.ok) return;
  const msg =
    (body && typeof body === 'object' && (body.message || body.error || body.details)) ||
    `HTTP ${res.status}`;
  throw new Error(typeof msg === 'string' ? msg : `HTTP ${res.status}`);
}

export async function fetchPublishedAmazonAffiliateListings() {
  const res = await fetch(LISTINGS_BASE, { ...fetchConfig });
  const body = await readJsonResponse(res, 'Amazon shop listings');
  throwIfNotOk(res, body, 'Amazon shop listings');
  const rows = Array.isArray(body) ? body : [];
  return rows.map(toCatalogProduct);
}

export async function fetchAmazonAffiliateListingsAdmin() {
  const res = await fetch(`${LISTINGS_BASE}/admin/all`, { headers: authHeaders() });
  const body = await readJsonResponse(res, 'Amazon affiliate admin list');
  throwIfNotOk(res, body, 'Amazon affiliate admin list');
  return body;
}

export async function importAmazonListingFromUrl(body) {
  const res = await fetch(`${LISTINGS_BASE}/import-from-url`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await readJsonResponse(res, 'Amazon import from URL');
  throwIfNotOk(res, data, 'Amazon import');
  return data;
}

export async function createAmazonAffiliateListing(body) {
  const res = await fetch(LISTINGS_BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await readJsonResponse(res, 'Create Amazon listing');
  throwIfNotOk(res, data, 'Create Amazon listing');
  return data;
}

export async function updateAmazonAffiliateListing(id, body) {
  const res = await fetch(`${LISTINGS_BASE}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await readJsonResponse(res, 'Update Amazon listing');
  throwIfNotOk(res, data, 'Update Amazon listing');
  return data;
}

export async function deleteAmazonAffiliateListing(id) {
  const res = await fetch(`${LISTINGS_BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await readJsonResponse(res, 'Delete Amazon listing');
  throwIfNotOk(res, data, 'Delete Amazon listing');
  return data ?? {};
}
