/**
 * Admin: curated Amazon Associates listings (public /shop). Not inventory.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchAmazonAffiliateListingsAdmin,
  createAmazonAffiliateListing,
  updateAmazonAffiliateListing,
  deleteAmazonAffiliateListing,
  importAmazonListingFromUrl,
  toCatalogProduct,
} from '../../../../services/amazonAffiliateShopService';
import { Plus, Edit, Trash2, Search, ExternalLink, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductCard from '../../../shop/components/ProductCard';

const emptyForm = () => ({
  name: '',
  description: '',
  category: '',
  amazonAffiliateUrl: '',
  imageUrl: '',
  isPublished: true,
  displayOrder: '0',
});

const AdminAmazonShop = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importCategory, setImportCategory] = useState('');
  const [importPublished, setImportPublished] = useState(true);
  const [importSaving, setImportSaving] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAmazonAffiliateListingsAdmin();
      setListings(data);
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = listings.filter(
    (row) =>
      row.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.amazonAffiliateUrl?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const closeImportModal = () => {
    setShowImportModal(false);
    setImportUrl('');
    setImportCategory('');
    setImportPublished(true);
    setImportPreview(null);
  };

  const openImportFromAmazon = () => {
    setImportUrl('');
    setImportCategory('');
    setImportPublished(true);
    setImportPreview(null);
    setShowImportModal(true);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    const url = importUrl.trim();
    if (!url) {
      toast.error('Paste an Amazon product link');
      return;
    }
    setImportSaving(true);
    setImportPreview(null);
    try {
      const row = await importAmazonListingFromUrl({
        url,
        category: importCategory.trim() || undefined,
        isPublished: importPublished,
      });
      setImportPreview(toCatalogProduct(row));
      toast.success('Card created — preview below. It is now on the shop if published.');
      await load();
    } catch (err) {
      toast.error(err.message || 'Import failed');
    } finally {
      setImportSaving(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name || '',
      description: row.description || '',
      category: row.category || '',
      amazonAffiliateUrl: row.amazonAffiliateUrl || '',
      imageUrl: row.imageUrls?.[0] || '',
      isPublished: !!row.isPublished,
      displayOrder: String(row.displayOrder ?? 0),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      category: form.category.trim() || null,
      amazonAffiliateUrl: form.amazonAffiliateUrl.trim(),
      imageUrl: form.imageUrl.trim(),
      isPublished: form.isPublished,
      displayOrder: parseInt(form.displayOrder, 10) || 0,
    };
    try {
      if (editing) {
        await updateAmazonAffiliateListing(editing.id, payload);
        toast.success('Listing updated');
      } else {
        await createAmazonAffiliateListing(payload);
        toast.success('Listing created');
      }
      closeModal();
      await load();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this Amazon listing?')) return;
    try {
      await deleteAmazonAffiliateListing(id);
      toast.success('Deleted');
      await load();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Amazon shop listings</h1>
            <p className="text-gray-600 mt-1 max-w-2xl">
              These items appear on the public Shop page only. Paste your full Amazon Associates link
              (SiteStripe / Associates Central) so purchases credit your account. Separate from internal
              inventory under Manage Products.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end sm:justify-start">
            <button
              type="button"
              onClick={openImportFromAmazon}
              data-testid="amazon-shop-import"
              className="bg-white border-2 border-amber-600 text-amber-800 hover:bg-amber-50 px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-sm"
            >
              <Link2 className="w-5 h-5" />
              Import from Amazon link
            </button>
            <button
              type="button"
              onClick={openCreate}
              data-testid="amazon-shop-add"
              className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow"
            >
              <Plus className="w-5 h-5" />
              Add listing
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, category, or URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-600">Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Affiliate link</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Published</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-10 text-center text-gray-500">
                        No listings yet. Add one with your Associates URL.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{row.displayOrder}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.category || '—'}</td>
                        <td className="px-4 py-3 text-sm max-w-xs truncate">
                          <a
                            href={row.amazonAffiliateUrl}
                            target="_blank"
                            rel="nofollow sponsored noreferrer"
                            className="text-amber-700 hover:underline inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            Open
                          </a>
                        </td>
                        <td className="px-4 py-3 text-sm">{row.isPublished ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            className="inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(row.id)}
                            className="inline-flex items-center px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[92vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Import from Amazon link</h2>
            <p className="text-sm text-gray-600 mb-4">
              Paste a full product URL (ideally your Associates link with <code className="text-xs bg-gray-100 px-1 rounded">tag=</code>).
              We pull the title, description, and <strong>product photo</strong> from Amazon (JSON-LD, gallery, and
              Open Graph) and store the image URL on your card.
            </p>
            <form onSubmit={handleImportSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amazon URL *</label>
                <textarea
                  required
                  rows={3}
                  data-testid="amazon-shop-import-url"
                  value={importUrl}
                  onChange={(e) => {
                    setImportUrl(e.target.value);
                    setImportPreview(null);
                  }}
                  placeholder="https://www.amazon.com/dp/XXXXXXXXXX?tag=yourstore-20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category (optional)</label>
                <input
                  data-testid="amazon-shop-import-category"
                  value={importCategory}
                  onChange={(e) => setImportCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  data-testid="amazon-shop-import-published"
                  checked={importPublished}
                  onChange={(e) => setImportPublished(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Published on shop
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeImportModal}
                  className="px-4 py-2 border rounded-lg text-gray-600"
                >
                  Close
                </button>
                <button
                  type="submit"
                  data-testid="amazon-shop-import-submit"
                  disabled={importSaving}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  {importSaving ? 'Working…' : 'Create card'}
                </button>
              </div>
            </form>
            {importPreview && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview (same as public shop)</p>
                <div className="max-w-md">
                  <ProductCard product={importPreview} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editing ? 'Edit listing' : 'New Amazon listing'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  required
                  data-testid="amazon-shop-title"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amazon Associates URL *</label>
                <textarea
                  required
                  rows={3}
                  data-testid="amazon-shop-url"
                  placeholder="https://www.amazon.com/dp/...?tag=yourstore-20"
                  value={form.amazonAffiliateUrl}
                  onChange={(e) => setForm({ ...form, amazonAffiliateUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use the link from Amazon Associates / SiteStripe so your tag is included.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  data-testid="amazon-shop-category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  data-testid="amazon-shop-description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
                <input
                  type="url"
                  data-testid="amazon-shop-image"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort order</label>
                  <input
                    type="number"
                    data-testid="amazon-shop-order"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      data-testid="amazon-shop-published"
                      checked={form.isPublished}
                      onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    Published on shop
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-lg text-gray-600">
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="amazon-shop-submit"
                  disabled={saving}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAmazonShop;
