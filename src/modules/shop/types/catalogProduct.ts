/**
 * Product shape for the public shop catalog (Amazon affiliate outbound links).
 * Internal inventory fields are intentionally omitted from this contract.
 */
export interface CatalogProduct {
  id: number;
  name: string;
  /** Full Amazon Associates URL (tag included); opens in a new tab from the shop. */
  amazonLink: string;
  description?: string | null;
  category?: string | null;
  image_url?: string | null;
  imageUrls?: string[] | null;
}
