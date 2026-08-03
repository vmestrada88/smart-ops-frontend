import { describe, it, expect } from 'vitest';
import { toCatalogProduct } from './amazonAffiliateShopService';

describe('toCatalogProduct', () => {
  it('maps a full API listing to the card shape', () => {
    const listing = {
      id: 7,
      name: 'Blink Mini Camera',
      description: 'Compact security camera',
      category: 'Security',
      amazonAffiliateUrl: 'https://www.amazon.com/dp/B08D2F4S9Z?tag=store-20',
      imageUrls: ['https://m.media-amazon.com/images/I/51q8yCxHzxL._AC_SL1500_.jpg'],
      image_url: 'https://m.media-amazon.com/images/I/51q8yCxHzxL._AC_SL1500_.jpg',
    };

    expect(toCatalogProduct(listing)).toEqual({
      id: 7,
      name: 'Blink Mini Camera',
      description: 'Compact security camera',
      category: 'Security',
      amazonLink: 'https://www.amazon.com/dp/B08D2F4S9Z?tag=store-20',
      imageUrls: ['https://m.media-amazon.com/images/I/51q8yCxHzxL._AC_SL1500_.jpg'],
      image_url: 'https://m.media-amazon.com/images/I/51q8yCxHzxL._AC_SL1500_.jpg',
    });
  });

  it('falls back to the first imageUrl when image_url is missing', () => {
    const listing = {
      id: 1,
      name: 'Echo Dot',
      amazonAffiliateUrl: 'https://www.amazon.com/dp/B09B8V1LZ3?tag=store-20',
      imageUrls: ['https://img/one.jpg', 'https://img/two.jpg'],
    };

    expect(toCatalogProduct(listing).image_url).toBe('https://img/one.jpg');
  });

  it('defaults nullable fields when absent', () => {
    const listing = { id: 2, name: 'Solo', amazonAffiliateUrl: 'https://a.co/x' };

    expect(toCatalogProduct(listing)).toEqual({
      id: 2,
      name: 'Solo',
      description: null,
      category: null,
      amazonLink: 'https://a.co/x',
      imageUrls: null,
      image_url: null,
    });
  });

  it('keeps image_url even when imageUrls is absent', () => {
    const listing = {
      id: 3,
      name: 'Card',
      amazonAffiliateUrl: 'https://a.co/y',
      image_url: 'https://img/direct.jpg',
    };

    expect(toCatalogProduct(listing).image_url).toBe('https://img/direct.jpg');
  });
});
