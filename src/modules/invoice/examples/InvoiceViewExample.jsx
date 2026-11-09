/**
 * InvoiceViewExample — read-only invoice layout reference (no payment UI).
 */
import { useMemo } from 'react';

const sampleInvoice = {
  id: 1001,
  date: new Date().toISOString(),
  clientId: 42,
  laborHours: 4,
  laborRate: 85,
  taxExempt: false,
  taxRate: 0.07,
  totalAmount: 450,
  stripePaymentId: null,
};

export default function InvoiceViewExample() {
  const isSettled = useMemo(
    () => sampleInvoice.stripePaymentId != null && String(sampleInvoice.stripePaymentId).trim() !== '',
    []
  );

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <p className="text-sm text-gray-500 mb-4">Example layout — not wired to the API.</p>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800">Invoice #{sampleInvoice.id}</h1>
        <p className="text-gray-600 mt-2">Status: {isSettled ? 'Settled' : 'Open'}</p>
        <p className="text-gray-800 mt-4 font-semibold">Total: ${sampleInvoice.totalAmount.toFixed(2)}</p>
      </div>
    </div>
  );
}
