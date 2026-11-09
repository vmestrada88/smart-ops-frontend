/**
 * InvoiceDetail - View invoice details (no in-app card processing)
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchInvoiceById } from '../../../services/invoiceService';
import toast from 'react-hot-toast';

/** Legacy DB field: non-null means a payment reference was recorded (historical imports). */
const hasPaymentReference = (invoice) =>
  invoice?.stripePaymentId != null && String(invoice.stripePaymentId).trim() !== '';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    try {
      const data = await fetchInvoiceById(id);
      setInvoice(data);
    } catch (error) {
      toast.error('Error loading invoice');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          Invoice not found
        </div>
      </div>
    );
  }

  const isSettled = hasPaymentReference(invoice);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/invoices')}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Invoices
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Invoice #{invoice.id}</h1>
            <p className="text-gray-600 mt-2">
              Date: {new Date(invoice.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          <div>
            {isSettled ? (
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Settled
              </span>
            ) : (
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Open
              </span>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Invoice Details</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Client ID:</span>
                  <span className="font-medium text-gray-800">{invoice.clientId || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Labor Hours:</span>
                  <span className="font-medium text-gray-800">{invoice.laborHours || 0} hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Labor Rate:</span>
                  <span className="font-medium text-gray-800">${invoice.laborRate || 0}/hr</span>
                </div>
                {invoice.taxExempt && (
                  <div className="flex items-center text-sm text-blue-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Tax Exempt
                  </div>
                )}
              </div>
            </div>

            {isSettled && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Payment reference</h2>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Recorded</p>
                      <p className="text-xs text-gray-600 mt-1 font-mono break-all">
                        {invoice.stripePaymentId}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="space-y-2 max-w-sm ml-auto">
            <div className="flex justify-between text-gray-600">
              <span>Labor:</span>
              <span className="font-medium">
                ${((invoice.laborHours || 0) * (invoice.laborRate || 0)).toFixed(2)}
              </span>
            </div>

            {!invoice.taxExempt && (
              <div className="flex justify-between text-gray-600">
                <span>Tax ({((invoice.taxRate || 0.07) * 100).toFixed(0)}%):</span>
                <span className="font-medium">
                  ${((invoice.totalAmount || 0) * (invoice.taxRate || 0.07)).toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t-2 border-gray-300">
              <span>Total:</span>
              <span className="text-blue-600">${(invoice.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {!isSettled && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment</h3>
          <p className="text-gray-700 text-sm leading-relaxed">
            This application does not process card payments. Product purchases for clients are handled through
            our Amazon Associates storefront. For this invoice, follow the payment instructions on your agreement
            or contact the office.
          </p>
        </div>
      )}

      {isSettled && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-green-800">Invoice settled</h3>
              <p className="text-green-700 text-sm mt-1">A payment reference is on file for this invoice.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
