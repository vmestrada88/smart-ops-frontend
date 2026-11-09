/**
 * InvoiceSummary component displays a summary of the invoice including selected products,
 * extra costs, discounts, subtotal, tax, total, and notes. It allows updating quantities,
 * removing items, extra costs, and discounts.
 *
 * @component
 * @param {Object[]} selectedItems - Array of selected product items for the invoice.
 * @param {string} selectedItems[].name - Name of the product.
 * @param {string} selectedItems[].category - Category of the product (used for labor cost).
 * @param {number} selectedItems[].quantity - Quantity of the product.
 * @param {number} selectedItems[].priceSell - Unit price of the product.
 * @param {string|number} selectedItems[].\_id - Unique identifier for the product.
 * @param {Object[]} [extraCosts=[]] - Array of additional charges to be added to the invoice.
 * @param {string} extraCosts[].name - Name/description of the extra cost.
 * @param {number} extraCosts[].cost - Amount of the extra cost.
 * @param {Object[]} [discount=[]] - Array of discounts to be subtracted from the invoice.
 * @param {string} discount[].name - Name/description of the discount.
 * @param {number} discount[].dCost - Amount of the discount.
 * @param {number} subtotal - The subtotal amount before tax and discounts.
 * @param {number} tax - The tax amount applied to the subtotal.
 * @param {number} total - The final total amount after all calculations.
 * @param {function} removeFromInvoice - Function to remove a product from the invoice. Receives product ID.
 * @param {function} updateQuantity - Function to update the quantity of a product. Receives product ID and new quantity.
 * @param {function} removeExtraCost - Function to remove an extra cost. Receives the index of the extra cost.
 * @param {function} removeDiscount - Function to remove a discount. Receives the index of the discount.
 * @param {function} getLaborCost - Function to get the labor cost for a given product category.
 * @param {React.Ref} invoiceRef - Ref to the invoice summary container (for printing or other DOM access).
 * @param {string} notes - Optional notes to be displayed at the end of the invoice.
 *
 * @returns {JSX.Element} The rendered invoice summary component.
 */
export default function InvoiceSummary({
  selectedItems,
  extraCosts = [],
  discount = [],
  laborHours = 0,
  hourlyRate = 0,
  totalLabor = 0,
  subtotal,
  tax,
  total,
  removeFromInvoice,
  updateQuantity,
  removeExtraCost,
  removeDiscount,
  getLaborCost,
  invoiceRef,
  notes,
  documentType = 'invoice',
  taxExempt = false,
  onUpdateLabor = () => {},
  onRemoveLabor = () => {},
}) {
  const isProposal = documentType === 'proposal';

  return (
    <div ref={invoiceRef} className="bg-white p-6 rounded shadow w-full max-w-[800px] mx-auto">
      <h3 className="text-xl font-semibold mb-4">{isProposal ? 'Proposal Summary' : 'Invoice Summary'}</h3>

      {/* PRODUCTOS */}
      <table className="w-full mb-4 border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Product</th>
            <th className="border px-4 py-2">Qty</th>
            <th className="border px-4 py-2">Unit Price</th>
            <th className="border px-4 py-2">Install</th>
            <th className="border px-4 py-2">Total</th>
            <th className="border px-4 py-2">Remove</th>
          </tr>
        </thead>
        <tbody>
          {selectedItems.map(item => {
            const install = getLaborCost(item.category);
            return (
              <tr key={item._id}>
                <td className="border px-4 py-2">{item.name}</td>
                <td className="border px-4 py-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                    >
                      -
                    </button>
                    <span className="min-w-[30px] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="border px-4 py-2 text-right">${item.priceSell.toFixed(2)}</td>
                <td className="border px-4 py-2 text-right">${install.toFixed(2)}</td>
                <td className="border px-4 py-2 text-right">
                  ${(item.quantity * (item.priceSell + install)).toFixed(2)}
                </td>
                <td className="border px-4 py-2 text-center">
                  <button
                    onClick={() => removeFromInvoice(item._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-gray-200 font-bold">
            <td className="border px-4 py-2 text-right">Totals:</td>
            <td className="border px-4 py-2 text-center">
              {selectedItems.reduce((sum, item) => sum + item.quantity, 0)}
            </td>
            <td className="border px-4 py-2 text-right">
              ${selectedItems.reduce((sum, item) => sum + (item.priceSell * item.quantity), 0).toFixed(2)}
            </td>
            <td className="border px-4 py-2 text-right">
              ${selectedItems.reduce((sum, item) => sum + (getLaborCost(item.category) * item.quantity), 0).toFixed(2)}
            </td>
            <td className="border px-4 py-2 text-right">
              ${selectedItems.reduce((sum, item) => sum + (item.quantity * (item.priceSell + getLaborCost(item.category))), 0).toFixed(2)}
            </td>
            <td className="border px-4 py-2"></td>
          </tr>
        </tfoot>
      </table>

      {/* EXTRA COSTS */}
      {totalLabor > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Manual Labor</h4>
          <div className="border rounded px-3 py-2 bg-gray-50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Hours</span>
                <button
                  onClick={() => onUpdateLabor({ hours: Math.max(0, laborHours - 0.5) })}
                  className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                >
                  -
                </button>
                <span className="min-w-[40px] text-center">{laborHours}</span>
                <button
                  onClick={() => onUpdateLabor({ hours: laborHours + 0.5 })}
                  className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                >
                  +
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Rate $/hr</span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={hourlyRate}
                  onChange={(e) => onUpdateLabor({ rate: Number.parseFloat(e.target.value) || 0 })}
                  className="w-28 p-1 border rounded"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold">${totalLabor.toFixed(2)}</span>
                <button
                  onClick={onRemoveLabor}
                  className="text-red-500 hover:text-red-700"
                  title="Remove labor"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXTRA COSTS */}
      {extraCosts.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">{isProposal ? 'Additional Proposal Charges' : 'Other Charges'}</h4>
          <ul className="list-disc list-inside space-y-1">
            {extraCosts.map((extra, idx) => (
              <li key={idx} className="flex justify-between items-center">
                <div className="flex-1">{extra.name}</div>
                <div className="flex items-center gap-2">
                  <span>${extra.cost.toFixed(2)}</span>
                  <button
                    onClick={() => removeExtraCost(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* DISCOUNTS */}
      {Array.isArray(discount) && discount.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">{isProposal ? 'Proposal Discounts' : 'Discounts'}</h4>
          <ul className="list-disc list-inside space-y-1">
            {discount.map((d, idx) => (
              <li key={idx} className="flex justify-between items-center">
                <div className="flex-1">{d.name}</div>
                <div className="flex items-center gap-2">
                  <span>-${d.dCost.toFixed(2)}</span>
                  <button
                    onClick={() => removeDiscount(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* TOTAL */}
      <div className="text-right space-y-1">
        <p>
          Subtotal: <span className="font-semibold">${subtotal.toFixed(2)}</span>
        </p>
        <p>
          Tax (7%): <span className="font-semibold">
            {taxExempt ? (
              <span className="text-green-600">$0.00 (Tax Exempt)</span>
            ) : (
              `$${tax.toFixed(2)}`
            )}
          </span>
        </p>
        <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
      </div>

      {/* NOTES SECTION */}
      {notes && notes.trim() && (
        <div className="mt-6 pt-4 border-t border-gray-300">
          <h4 className="text-lg font-semibold mb-2">Notes:</h4>
          <div className="bg-gray-50 p-3 rounded border">
            <p className="text-gray-700 whitespace-pre-wrap">{notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}


