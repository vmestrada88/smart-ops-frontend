
/**
 * InvoicePage component for generating invoices or proposals.
 *
 * This page allows users to:
 * - Select products to add to an invoice or proposal.
 * - Specify labor hours and hourly rate.
 * - Add extra costs and discounts.
 * - Select a client from a list.
 * - Add custom notes to the document.
 * - View a summary of the invoice/proposal including subtotal, tax, and total.
 * - Download the invoice/proposal as a PDF.
 *
 * State:
 * - products: Array of available products.
 * - selectedItems: Array of products added to the invoice/proposal.
 * - laborHours: Number of labor hours.
 * - hourlyRate: Rate per labor hour.
 * - extraCosts: Array of additional costs.
 * - discount: Array of discounts applied.
 * - documentType: Type of document ("invoice" or "proposal").
 * - notes: Additional notes for the document.
 * - selectedClient: The client selected for the invoice/proposal.
 *
 * @component
 * @returns {JSX.Element} The rendered InvoicePage component.
 */
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProducts } from '../../../services/productsService';
import getLaborCost from '../../../util/LaborCost';
import '../../../index.css';
import DiscountForm from '../components/DiscountForm';
import ExtraCostForm from '../components/ExtraCostForm';
import InvoiceSummary from '../components/InvoiceSummary';
import ProductList from '../../product/components/ProductList';
import DownloadPDFButton from '../components/DownloadPDFButton';
import ClientSelect from '../../clients/components/ClientSelect';
import BasicInvoicePDF from '../../invoice/components/BasicInvoicePDF';
import toast from 'react-hot-toast';
import { createInvoice, createProposal, fetchProposalById, updateProposal } from '../../../services/invoiceService';

const TAX_RATE = 0.07;

export const InvoicePage = () => {
  const { proposalId } = useParams();
  const isEditingProposal = Boolean(proposalId);
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  /** @type {number} Labor hours for calculation */
  const [laborHours, setLaborHours] = useState(0);
  /** @type {number} Hourly rate for labor calculation */
  const [hourlyRate, setHourlyRate] = useState(100);
  const [laborHoursInput, setLaborHoursInput] = useState('0');
  const [hourlyRateInput, setHourlyRateInput] = useState('100');
  const [appliedLabor, setAppliedLabor] = useState({ hours: 0, rate: 100 });
  const [extraCosts, setExtraCosts] = useState([]);
  const [discount, setDiscount] = useState([]);
  const [documentType, setDocumentType] = useState('invoice'); // "invoice" or "proposal"
  const [notes, setNotes] = useState(''); // Notes for the invoice
  const [taxExempt, setTaxExempt] = useState(false); // Tax exemption flag
  const invoiceRef = useRef();
  const [selectedClient, setSelectedClient] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingProposal, setLoadingProposal] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      const data = await fetchProducts();
      // Normalize id field for UI components expecting _id
      const normalized = Array.isArray(data)
        ? data.map(p => ({ ...p, _id: p._id ?? p.id }))
        : [];
      setProducts(normalized);
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (!isEditingProposal) return;

    const loadProposal = async () => {
      setLoadingProposal(true);
      try {
        const proposal = await fetchProposalById(proposalId);

        setDocumentType('proposal');
        setNotes(proposal.notes || '');

        const proposalTax = Number(proposal.tax || 0);
        const proposalSubtotal = Number(proposal.subtotal || 0);
        setTaxExempt(proposalTax === 0 && proposalSubtotal > 0);

        const proposalLaborHours = Number(proposal.laborHours || 0);
        const proposalLaborRate = Number(proposal.laborRate || proposal.hourlyRate || 100);
        setLaborHours(proposalLaborHours);
        setHourlyRate(proposalLaborRate);
        setLaborHoursInput(String(proposalLaborHours));
        setHourlyRateInput(String(proposalLaborRate));
        setAppliedLabor({ hours: proposalLaborHours, rate: proposalLaborRate });

        if (proposal.client) {
          const normalizedClient = {
            ...proposal.client,
            _id: proposal.client._id ?? proposal.client.id
          };
          setSelectedClient(normalizedClient);
        }

        const normalizedItems = Array.isArray(proposal.items)
          ? proposal.items.map((item) => ({
            _id: item.productId ?? item.product?.id,
            id: item.productId ?? item.product?.id,
            name: item.name || item.product?.name || 'Item',
            description: item.description || item.product?.description || '',
            category: item.product?.category || '',
            priceSell: Number(item.unitPrice || item.product?.priceSell || 0),
            quantity: Number(item.quantity || 1)
          }))
          : [];

        setSelectedItems(normalizedItems);
      } catch (error) {
        console.error('Error loading proposal for edit:', error);
        toast.error('Error loading proposal');
      } finally {
        setLoadingProposal(false);
      }
    };

    loadProposal();
  }, [isEditingProposal, proposalId]);

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
  };

  const removeFromInvoice = (id) => {
    setSelectedItems(selectedItems.filter(item => item._id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromInvoice(id);
      return;
    }
    setSelectedItems(
      selectedItems.map(item =>
        item._id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const subtotalProducts = selectedItems.reduce(
    (sum, item) => sum + item.quantity * (item.priceSell + getLaborCost(item.category)),
    0
  );

  const totalLabor = appliedLabor.hours * appliedLabor.rate;
  const totalExtras = extraCosts.reduce((acc, cur) => acc + cur.cost, 0);
  const totalDiscount = discount.reduce((acc, cur) => acc + cur.dCost, 0);
  const subtotal = subtotalProducts + totalLabor + totalExtras - totalDiscount;
  const tax = taxExempt ? 0 : subtotal * TAX_RATE;
  const total = subtotal + tax;

  const exportPDF = () => {
    const { generatePDF } = BasicInvoicePDF({
      clientName: selectedClient ? (selectedClient.companyName || selectedClient.name) : 'Not selected',
      clientAddress: selectedClient ? (selectedClient.companyAddress || selectedClient.address) : 'Not selected',
      clientCity: selectedClient ? (selectedClient.city || selectedClient.city) : 'Not selected',
      clientState: selectedClient ? (selectedClient.state || selectedClient.state) : 'Not selected',
      clientZip: selectedClient ? (selectedClient.zip || selectedClient.zip) : 'Not selected',
      selectedItems,
      hourlyRate: appliedLabor.rate,
      laborHours: appliedLabor.hours,
      extraCosts,
      discount,
      documentType,
      notes,
      taxExempt,
    });

    generatePDF();
  };

  const saveDocument = async () => {
    const clientId = selectedClient?._id ?? selectedClient?.id;

    if (!clientId) {
      toast.error('Please select a client before saving');
      return;
    }

    if (!selectedItems.length) {
      toast.error('Add at least one product before saving');
      return;
    }

    const summaryItems = selectedItems.map((item) => {
      const installCost = getLaborCost(item.category);
      const unitPrice = Number(item.priceSell || 0);
      const laborCost = Number(installCost || 0);
      const quantity = Number(item.quantity || 1);
      const subtotalLine = (unitPrice + laborCost) * quantity;

      return {
        productId: item._id ?? item.id,
        name: item.name,
        quantity,
        unitPrice,
        laborCost,
        subtotal: subtotalLine,
        price: unitPrice + laborCost,
        total: subtotalLine,
        description: item.description || ''
      };
    });

    setIsSaving(true);

    try {
      if (documentType === 'proposal') {
        const summaryBlock = [
          `Subtotal: $${subtotal.toFixed(2)}`,
          `Tax: $${tax.toFixed(2)}${taxExempt ? ' (Tax Exempt)' : ''}`,
          `Total: $${total.toFixed(2)}`
        ].join('\n');

        const normalizedNotes = [notes?.trim(), summaryBlock].filter(Boolean).join('\n\n');

        const proposalPayload = {
          clientId: Number(clientId),
          clientInfoName: selectedClient.companyName || selectedClient.name || 'Client',
          clientInfoEmail: selectedClient.email || '',
          clientInfoPhone: selectedClient.phone || selectedClient.phoneNumber || '',
          clientInfoAddress: selectedClient.companyAddress || selectedClient.address || '',
          tax,
          notes: normalizedNotes,
          items: summaryItems
        };

        if (isEditingProposal) {
          await updateProposal(proposalId, proposalPayload);
          toast.success('Proposal updated successfully');
        } else {
          await createProposal(proposalPayload);
          toast.success('Proposal saved successfully');
        }
      } else {
        await createInvoice({
          clientId: Number(clientId),
          date: new Date().toISOString(),
          laborHours: appliedLabor.hours,
          laborRate: appliedLabor.rate,
          taxRate: TAX_RATE,
          taxExempt,
          totalAmount: total,
          items: summaryItems
        });
        toast.success('Invoice saved successfully');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      const message = error?.message?.includes('403')
        ? 'No permission to save. Please login as admin.'
        : 'Error saving document';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };
  const removeExtraCost = (index) => {
    setExtraCosts(extraCosts.filter((_, i) => i !== index));
  };

  const removeDiscount = (index) => {
    setDiscount(discount.filter((_, i) => i !== index));
  };

  const parsePositiveNumber = (value, fallback = 0) => {
    const parsed = Number.parseFloat(value);
    if (Number.isNaN(parsed) || parsed < 0) return fallback;
    return parsed;
  };

  const applyLabor = () => {
    const parsedHours = parsePositiveNumber(laborHoursInput, 0);
    const parsedRate = parsePositiveNumber(hourlyRateInput, 0);

    setLaborHours(parsedHours);
    setHourlyRate(parsedRate);
    setLaborHoursInput(String(parsedHours));
    setHourlyRateInput(String(parsedRate));
    setAppliedLabor({ hours: parsedHours, rate: parsedRate });
  };

  const clearLabor = () => {
    const parsedRate = parsePositiveNumber(hourlyRateInput, 0);
    setLaborHours(0);
    setLaborHoursInput('0');
    setHourlyRate(parsedRate);
    setHourlyRateInput(String(parsedRate));
    setAppliedLabor({ hours: 0, rate: parsedRate });
  };

  const updateAppliedLabor = ({ hours, rate }) => {
    const nextHours = typeof hours === 'number' ? Math.max(0, hours) : appliedLabor.hours;
    const nextRate = typeof rate === 'number' ? Math.max(0, rate) : appliedLabor.rate;

    setAppliedLabor({ hours: nextHours, rate: nextRate });
    setLaborHours(nextHours);
    setHourlyRate(nextRate);
    setLaborHoursInput(String(nextHours));
    setHourlyRateInput(String(nextRate));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Invoice or Propousal Generator</h2>

      {loadingProposal && (
        <div className="mb-4 p-3 rounded bg-blue-50 text-blue-700 border border-blue-200">
          Loading proposal data...
        </div>
      )}

      <ProductList
        products={products}
        addToInvoice={addToInvoice}
        onProductCreated={(newProduct) => setProducts((prev) => [...prev, newProduct])}
      />

      <div className="mb-4">
        <label className="mr-4 font-semibold">Document Type:</label>
        <label className="mr-4">
          <input
            type="radio"
            value="invoice"
            checked={documentType === 'invoice'}
            onChange={(e) => setDocumentType(e.target.value)}
            className="mr-1"
          />
          Invoice
        </label>
        <label>
          <input
            type="radio"
            value="proposal"
            checked={documentType === 'proposal'}
            onChange={(e) => setDocumentType(e.target.value)}
            className="mr-1"
          />
          Proposal
        </label>
      </div>

      <div className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={taxExempt}
            onChange={(e) => setTaxExempt(e.target.checked)}
            className="mr-2 h-4 w-4"
          />
          <span className="font-semibold">Tax Exempt</span>
          <span className="ml-2 text-sm text-gray-600">(No taxes will be applied to this invoice)</span>
        </label>
      </div>

      <ClientSelect
        onSelectClient={setSelectedClient}
        selectedClientId={selectedClient?._id ?? selectedClient?.id ?? ''}
      />
      
      {/* Labor Hours and Rate Section */}
      <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-3">Labor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Labor Hours</label>
            <input
              type="number"
              value={laborHoursInput}
              onChange={(e) => setLaborHoursInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applyLabor();
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
              min="0"
              step="0.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
            <input
              type="number"
              value={hourlyRateInput}
              onChange={(e) => setHourlyRateInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applyLabor();
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
              min="0"
              step="5"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={applyLabor}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
          >
            Insert Labor
          </button>
          <button
            type="button"
            onClick={clearLabor}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            Clear Labor
          </button>
          <span className="text-sm text-gray-700">
            Applied: {appliedLabor.hours}h x ${appliedLabor.rate.toFixed(2)} = ${totalLabor.toFixed(2)}
          </span>
        </div>
      </div>

      <ExtraCostForm onAdd={(cost) => setExtraCosts([...extraCosts, cost])} />

      <DiscountForm onAdd={(dcount) => setDiscount([...discount, dcount])} />

      {/* Notes Section */}
      <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-3">Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes for this invoice/proposal..."
          className="w-full p-3 border border-gray-300 rounded-md resize-vertical min-h-[100px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          rows={4}
        />
        <p className="text-sm text-gray-500 mt-2">
          These notes will appear at the bottom of your {documentType || 'document'}.
        </p>
      </div>

      <InvoiceSummary
        selectedItems={selectedItems}
        extraCosts={extraCosts}
        discount={discount}
        subtotal={subtotal}
        tax={tax}
        total={total}
        removeFromInvoice={removeFromInvoice}
        updateQuantity={updateQuantity}
        removeExtraCost={removeExtraCost}
        removeDiscount={removeDiscount}
        getLaborCost={getLaborCost}
        invoiceRef={invoiceRef}
        clientName={selectedClient ? (selectedClient.companyName || selectedClient.name) : 'Not selected'}
        documentType={documentType}
        notes={notes}
        taxExempt={taxExempt}
        laborHours={appliedLabor.hours}
        hourlyRate={appliedLabor.rate}
        totalLabor={totalLabor}
        onUpdateLabor={(nextLabor) => updateAppliedLabor(nextLabor)}
        onRemoveLabor={clearLabor}
      />

      <div className="mt-4">
        <button
          onClick={saveDocument}
          disabled={isSaving || loadingProposal}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : isEditingProposal ? 'Update Proposal' : `Save ${documentType === 'proposal' ? 'Proposal' : 'Invoice'}`}
        </button>
      </div>

      <DownloadPDFButton onClick={exportPDF} />

    </div>
  );
};

export default InvoicePage;
