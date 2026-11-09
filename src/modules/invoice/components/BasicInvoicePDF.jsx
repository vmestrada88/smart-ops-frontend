import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import getLaborCost from '../../../util/LaborCost';
import logo from '../../../assets/logo.jpg';


const BasicInvoicePDF = ({
  clientName = 'Client Name',
  clientAddress = 'Client Address',
  clientCity = 'Client City',
  clientState = 'Client State',
  clientZip = 'Client Zip',
  selectedItems = [],
  laborHours = 0,
  hourlyRate = 100,
  extraCosts = [],
  discount = [],
  documentType = 'invoice', // "invoice" or "proposal"
  notes = '', // Add notes parameter
  taxExempt = false, // Tax exemption flag
}) => {
  const TAX_RATE = 0.07;

  const subtotalProducts = selectedItems.reduce(
    (sum, item) => sum + item.quantity * (item.priceSell + getLaborCost(item.category)),
    0
  );
  const totalLabor = laborHours * hourlyRate;
  const totalExtras = extraCosts.reduce((acc, cur) => acc + cur.cost, 0);
  const totalDiscount = discount.reduce((acc, cur) => acc + cur.dCost, 0);
  const subtotal = subtotalProducts + totalLabor + totalExtras - totalDiscount;
  const tax = taxExempt ? 0 : subtotal * TAX_RATE;
  const total = subtotal + tax;


  const generatePDF = () => {
    const doc = new jsPDF();

    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');

    let y = 20;

    // Document Type in upper right corner - more separated and highlighted
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0); // Blue color for better visibility
    doc.text(`${documentType === 'proposal' ? 'PROPOSAL' : 'INVOICE'}`, 200, 25, { align: 'right' });

    // Add a subtle line under the document type
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    const textWidth = doc.getTextWidth(`${documentType === 'proposal' ? 'PROPOSAL' : 'INVOICE'}`);
    doc.line(200 - textWidth, 28, 200, 28);

    // Reset color to black for the rest of the document
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);

    // Logo - moved down slightly
    if (logo) {
      doc.addImage(logo, 'JPEG', 14, y, 30, 30); // x, y, width, height
    }

    // Company name
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Smart Solution for Living LLC', 50, y + 8);

    // Company subtitle
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Security Systems, Smart Homes, & Networking Company', 50, y + 16);

    // Contact info - with more spacing
    doc.setFontSize(10);
    doc.text('Tel: +1 (786) 824-4191', 50, y + 24);
    doc.text('Email: comercial@smartsolutionfl.com', 50, y + 30);
    doc.text('Address: 2438 NE 184 St, North Miami Beach, FL 33160', 50, y + 36);

    y += 50; // Increased spacing before client info

    // Client info and date - with better spacing
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('CLIENT INFORMATION:', 14, y);
    doc.setFont(undefined, 'normal');

    doc.text(`Client: ${clientName}`, 14, y + 8);
    doc.text(`Address: ${clientAddress}`, 14, y + 14);
    doc.text(`City: ${clientCity}`, 14, y + 20);
    doc.text(`State: ${clientState}`, 14, y + 26);
    doc.text(`Zip: ${clientZip}`, 14, y + 32);

    // Date in upper right of this section
    doc.setFont(undefined, 'bold');
    doc.text('DOCUMENT DATE:', 120, y);
    doc.setFont(undefined, 'normal');
    doc.text(`${date}`, 120, y + 8);

    y += 45; // More spacing before the products table

    // Table header
    const productTable = selectedItems.map(item => [
      item.name,
      item.quantity,
      `$${item.priceSell.toFixed(2)}`,
      `$${getLaborCost(item.category).toFixed(2)}`,
      `$${(item.quantity * (item.priceSell + getLaborCost(item.category))).toFixed(2)}`
    ]);

    // Footer calculations
    const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = selectedItems.reduce((sum, item) => sum + (item.priceSell * item.quantity), 0);
    const totalLaborCost = selectedItems.reduce((sum, item) => sum + (getLaborCost(item.category) * item.quantity), 0);
    const totalLineCost = selectedItems.reduce(
      (sum, item) => sum + item.quantity * (item.priceSell + getLaborCost(item.category)),
      0
    );

    autoTable(doc, {
      startY: y,
      head: [['Product', 'Qty', 'Price', 'Labor', 'Total']],
      body: productTable,
      foot: [[
        'Totals:',
        totalQuantity.toString(),
        `$${totalPrice.toFixed(2)}`,
        `$${totalLaborCost.toFixed(2)}`,
        `$${totalLineCost.toFixed(2)}`
      ]],
      headStyles: {
        fillColor: [0, 128, 128], // Darker turquoise color
        textColor: [255, 255, 255], // White text
        fontStyle: 'bold'
      },
      footStyles: { fillColor: [220, 220, 220], textColor: 20, fontStyle: 'bold' },
    });


    y = doc.lastAutoTable.finalY + 10;

    // Extra Costs
    if (extraCosts.length > 0) {
      doc.setFont(undefined, 'bold');
      doc.text('Extra Costs', 14, y);
      doc.setFont(undefined, 'normal');
      y += 6;

      extraCosts.forEach(extra => {
        doc.text(`${extra.name}: $${extra.cost.toFixed(2)}`, 14, y);
        y += 6;
      });
    }

    // Discounts
    if (discount.length > 0) {
      doc.setFont(undefined, 'bold');
      doc.text('Discounts', 14, y);
      doc.setFont(undefined, 'normal');
      y += 6;

      discount.forEach(d => {
        doc.text(`${d.name}: -$${d.dCost.toFixed(2)}`, 14, y);
        y += 6;
      });
    }


    if (laborHours > 0) {
      doc.text(`Manual Labor (${laborHours} hrs x $${hourlyRate}): $${totalLabor.toFixed(2)}`, 14, y);
      y += 6;
    }

    y += 4;
    doc.setFont(undefined, 'bold');
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 14, y);
    y += 6;
    if (taxExempt) {
      doc.text('Tax (7%): $0.00 (Tax Exempt)', 14, y);
    } else {
      doc.text(`Tax (7%): $${tax.toFixed(2)}`, 14, y);
    }
    y += 6;
    doc.text(`Total: $${total.toFixed(2)}`, 14, y);
    y += 10;

    // Add notes section if notes exist
    if (notes && notes.trim()) {
      y += 10;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Notes:', 14, y);
      y += 6;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const splitNotes = doc.splitTextToSize(notes.trim(), 180);
      doc.text(splitNotes, 14, y);
      y += splitNotes.length * 4 + 6; // Adjust y position based on notes length
    }

    // Warranty disclaimer
    const warrantyText =
    'Important: The full payment for the equipment must be made before the installation work is scheduled. All work will be performed by a qualified professional.' +
      '\n\n' +    
    'Warranty Disclaimer: ' +
      'The installed equipment is covered by a limited warranty for a period of one (1) year from the date of installation. ' +
      'Labor is warranted for six (6) months. No warranty is provided for any equipment not supplied directly by our company.';
      

    const splitText = doc.splitTextToSize(warrantyText, 180); // Split text to fit page width
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(splitText, 14, y);

    doc.save(`${documentType}-${date}-${clientName}.pdf`);

  };

  return {

    generatePDF

  };
};

export default BasicInvoicePDF;

