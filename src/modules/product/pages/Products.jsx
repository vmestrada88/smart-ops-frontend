import { useEffect, useState } from 'react';
import { fetchProducts } from '../../../services';
import '../../../index.css';
import { ProductList, ProductHeader, InvoiceTable, ProposalFormModal } from '../components';
import toast from 'react-hot-toast';
import logo from '../../../assets/logo.jpg';
import { getLaborCost, generateProposalPDF } from '../../../util';
import { createPublicProposalRequest } from '../../../services/invoiceService';

/**
 * Products component for displaying and managing the product catalog and invoice.
 * This component allows users to browse products, add items to an invoice, adjust quantities,
 * remove items, and export the invoice as a PDF proposal or send a proposal request.
 * It integrates with the backend to fetch products and uses utility functions for labor costs.
 */
function Products() {

  // useEffect hook to load products when the component mounts
  useEffect(() => {
    // Define an async function to load products
    const loadProducts = async () => {
      try {
        // Fetch products from the backend service
        const data = await fetchProducts();
        // Normalize the data: ensure it's an array and map to add _id if Missing
        const normalized = Array.isArray(data)
          ? data.map(p => ({ ...p, _id: p.id ?? p.id }))
          : [];
        // Set the normalized products in state
        setProducts(normalized);
      } catch (error) {
        console.error('Error loading products:', error);
        // Set empty array on error to prevent crashes
        setProducts([]);
      }
    };
    // Call the loadProducts function
    loadProducts();
  }, []);
  
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
  const [proposalData, setProposalData] = useState({
    name: '',
    contact: '',
    address: '',
    notes: ''
  });

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromInvoice(id);
      return;
    }
    setSelectedItems(
      selectedItems.map(item =>
        (item._id === id ? { ...item, quantity: newQuantity } : item)
      )
    );
    toast.success('Updated quantity');
  };

  const addToInvoice = (product) => {
    const existing = selectedItems.find(item => item._id === product._id);
    if (existing) {
      setSelectedItems(
        selectedItems.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setSelectedItems([...selectedItems, { ...product, quantity: 1 }]);
    }
    toast.success('Product added');
  };

  const removeFromInvoice = (id) => {
    toast(
      (t) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span>Do you want to remove this product?</span>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              className="toast-button primary"
              onClick={() => {
                setSelectedItems(selectedItems.filter(item => item._id !== id));
                toast.dismiss(t.id);
                toast.success('Product removed');
              }}
            >
              Yes
            </button>
            <button
              className="toast-button dismiss"
              onClick={() => toast.dismiss(t.id)}
            >
            No
            </button>
          </div>
        </div>
      ),
      { duration: 6000 }
    );
  };

  const exportProductsPDF = () => {
    if (selectedItems.length === 0) {
      toast.error('You must create a proposal first');
      return;
    }

    toast(
      (t) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span>Do you want to save this proposal to your device?</span>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              className="toast-button primary"
              onClick={() => {
                generateProposalPDF(selectedItems, totalLineCost, logo,     getLaborCost);
                toast.dismiss(t.id);
              }}
            >
              Yes
            </button>
            <button
              className="toast-button dismiss"
              onClick={() => toast.dismiss(t.id)}
            >
            No
            </button>
          </div>
        </div>
      ),
      { duration: 6000 }
    );
  };

  const totalLineCost = selectedItems.reduce(
    (sum, item) => sum + (item.quantity * (item.priceSell + getLaborCost(item.category))),
    0
  );

  const handleSendProposal = async () => {
    if (!proposalData.name?.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!proposalData.contact?.trim()) {
      toast.error('Phone or Email is required');
      return;
    }

    if (!selectedItems.length) {
      toast.error('Add at least one product before sending');
      return;
    }

    const itemsPayload = selectedItems.map((item) => ({
      productId: item._id ?? item.id,
      name: item.name,
      description: item.description || '',
      quantity: Number(item.quantity || 1),
      unitPrice: Number(item.priceSell || 0),
      laborCost: Number(getLaborCost(item.category) || 0)
    }));

    setIsSubmittingProposal(true);

    try {
      await createPublicProposalRequest({
        name: proposalData.name,
        contact: proposalData.contact,
        address: proposalData.address,
        notes: proposalData.notes,
        items: itemsPayload
      });

      toast.success('Proposal request sent successfully');
      setShowProposalForm(false);
      setProposalData({ name: '', contact: '', address: '', notes: '' });
      setSelectedItems([]);
    } catch (error) {
      console.error('Error sending proposal request:', error);
      toast.error(error?.message || 'Error sending proposal request');
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  return (
    
    <div className="p-4">
      <ProductHeader />

      <InvoiceTable
        selectedItems={selectedItems}
        updateQuantity={updateQuantity}
        removeFromInvoice={removeFromInvoice}
        exportProductsPDF={exportProductsPDF}
        setShowProposalForm={setShowProposalForm}
      />

      {/* Product List */}
      <ProductList
        products={products}
        addToInvoice={addToInvoice}
      />

      {/* Proposal Form Modal */}
      <ProposalFormModal
        showProposalForm={showProposalForm}
        setShowProposalForm={setShowProposalForm}
        proposalData={proposalData}
        setProposalData={setProposalData}
        onSubmitProposal={handleSendProposal}
        isSubmitting={isSubmittingProposal}
      />
    </div>
  );
}

export default Products;

