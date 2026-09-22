import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, BusinessSettings } from '../types';
import { numberToWordsINR } from './numberToWords';

export interface BillingConfig {
  billType: 'GST' | 'NON_GST';
  invoiceNo: string;
  invoiceDate: string;
  placeOfSupply: string;
  customerGstin?: string;
  reverseCharge?: boolean;
}

export function generateBillingPDF(
  order: Order,
  settings: BusinessSettings | null,
  config: BillingConfig
): jsPDF {
  const isGST = config.billType === 'GST';
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // ~210mm
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  // Primary colors
  const primaryColor = [15, 23, 42]; // slate-900
  const cyanColor = [6, 182, 212]; // cyan-500
  const blueColor = [29, 78, 216]; // blue-700
  const grayColor = [100, 116, 139]; // slate-500
  const lightBg = [248, 250, 252]; // slate-50

  // 1. Top Decorative Bar
  doc.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
  doc.rect(0, 0, pageWidth, 4, 'F');

  // 2. Document Title Banner
  let y = 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(isGST ? 'TAX INVOICE' : 'NON-GST BILL / CASH MEMO', margin, y);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  const docSubtitle = isGST
    ? 'Issued under Section 31 of CGST / SGST Act 2017'
    : 'Commercial Voucher · Not an Input Tax Credit document';
  doc.text(docSubtitle, margin, y + 4.5);

  // Right-aligned Bill Meta Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`Bill No: ${config.invoiceNo}`, pageWidth - margin, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(`Date: ${config.invoiceDate}`, pageWidth - margin, y + 4.5, { align: 'right' });
  doc.text(`Order Ref: ${order.id}`, pageWidth - margin, y + 8.5, { align: 'right' });

  // Divider
  y += 12;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  // 3. Seller & Buyer Columns
  y += 4;
  const colWidth = (contentWidth - 6) / 2;

  // Left Column: Supplier / Seller Details
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, y, colWidth, 38, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, colWidth, 38, 2, 2, 'S');

  let sy = y + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
  doc.text('SUPPLIER / ISSUER DETAILS', margin + 4, sy);

  sy += 4.5;
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(settings?.brandName || 'PrintezYour Commercial Printing Hub', margin + 4, sy);

  sy += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  const addressText = doc.splitTextToSize(
    `${settings?.address || 'Plot No 1794, Gym Deep Complex, Hallo Majra'}, ${settings?.city || 'Chandigarh'} - ${settings?.pincode || '160002'}`,
    colWidth - 8
  );
  doc.text(addressText, margin + 4, sy);

  sy += (addressText.length * 3.5) + 0.5;
  doc.text(`Phone: ${settings?.phone || '+91 8557049897'} | Email: ${settings?.email || 'printezyour@gmail.com'}`, margin + 4, sy);

  if (isGST) {
    sy += 3.8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`GSTIN: ${settings?.gstin || '04AABCP8557N1Z9'}  |  State: 04-Chandigarh`, margin + 4, sy);
  }

  // Right Column: Customer / Recipient Details
  const rx = margin + colWidth + 6;
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(rx, y, colWidth, 38, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rx, y, colWidth, 38, 2, 2, 'S');

  let by = y + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
  doc.text('BILLED TO / RECIPIENT DETAILS', rx + 4, by);

  by += 4.5;
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(order.customer.name, rx + 4, by);

  by += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  if (order.customer.company) {
    doc.text(`Company: ${order.customer.company}`, rx + 4, by);
    by += 3.5;
  }

  const custAddress = doc.splitTextToSize(
    `${order.customer.billingAddress || order.customer.deliveryAddress}, ${order.customer.city || ''}, ${order.customer.state || ''} - ${order.customer.pincode || ''}`,
    colWidth - 8
  );
  doc.text(custAddress, rx + 4, by);

  by += (custAddress.length * 3.5) + 0.5;
  doc.text(`Mobile: ${order.customer.mobile} | Email: ${order.customer.email || 'N/A'}`, rx + 4, by);

  by += 3.8;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  if (isGST) {
    const custGstin = config.customerGstin || (order.customer as any).gstin || 'Unregistered';
    doc.text(`Recipient GSTIN: ${custGstin}  |  POS: ${config.placeOfSupply}`, rx + 4, by);
  } else {
    doc.text(`Delivery: ${order.deliveryType}  |  Payment: ${order.paymentMethod}`, rx + 4, by);
  }

  // 4. Line Items Table using autoTable
  y += 42;

  const tableHeaders = isGST
    ? [['#', 'Item & Specifications', 'HSN/SAC', 'Qty', 'Unit Rate', 'Taxable Amt', 'GST Rate', 'Total (INR)']]
    : [['#', 'Product & Specifications', 'Quantity', 'Unit Rate', 'Discount', 'Total (INR)']];

  // Intra-state (Chandigarh/UT 04) vs Inter-state
  const isIntraState = config.placeOfSupply.toLowerCase().includes('04') ||
    config.placeOfSupply.toLowerCase().includes('chandigarh') ||
    order.customer.state.toLowerCase().includes('chandigarh');

  const gstPercent = settings?.defaultGstPercent || 18;

  const tableRows = (order.items || []).map((item, idx) => {
    const optionsSummary = (item.selectedOptions || [])
      .map(o => `${o.groupName}: ${o.valueName}`)
      .join(', ');
    const desc = optionsSummary ? `${item.productName}\n[${optionsSummary}]` : item.productName;

    if (isGST) {
      // HSN for commercial printing is standard SAC 998912 or HSN 4911
      const hsn = item.category?.toLowerCase().includes('box') || item.category?.toLowerCase().includes('packaging')
        ? '4819'
        : '998912';

      // item.subtotal is the taxable amount before tax
      const unitRate = Math.round((item.subtotal / (item.quantity || 1)) * 100) / 100;
      const taxable = item.subtotal;
      const taxRateStr = `${gstPercent}%`;
      const itemTotal = isGST ? Math.round(taxable * (1 + gstPercent / 100)) : taxable;

      return [
        (idx + 1).toString(),
        desc,
        hsn,
        item.quantity.toString(),
        `₹${unitRate.toFixed(2)}`,
        `₹${taxable.toFixed(2)}`,
        taxRateStr,
        `₹${itemTotal.toFixed(2)}`
      ];
    } else {
      const unitRate = Math.round((item.subtotal / (item.quantity || 1)) * 100) / 100;
      return [
        (idx + 1).toString(),
        desc,
        item.quantity.toString(),
        `₹${unitRate.toFixed(2)}`,
        '₹0.00',
        `₹${item.subtotal.toFixed(2)}`
      ];
    }
  });

  autoTable(doc, {
    startY: y,
    head: tableHeaders,
    body: tableRows,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor as [number, number, number],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 2.5
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: primaryColor as [number, number, number],
      cellPadding: 2.2
    },
    columnStyles: isGST
      ? {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 16, halign: 'center' },
          3: { cellWidth: 12, halign: 'center' },
          4: { cellWidth: 18, halign: 'right' },
          5: { cellWidth: 20, halign: 'right' },
          6: { cellWidth: 16, halign: 'center' },
          7: { cellWidth: 24, halign: 'right' }
        }
      : {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 25, halign: 'right' },
          4: { cellWidth: 20, halign: 'right' },
          5: { cellWidth: 30, halign: 'right' }
        },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  // Calculate position after table
  const finalY = (doc as any).lastAutoTable.finalY + 4;

  // 5. Financial Summary Block & Bank Information
  const summaryBoxWidth = 80;
  const summaryX = pageWidth - margin - summaryBoxWidth;

  // Left Box: Bank Details & UPI (if space permits)
  const bankBoxWidth = contentWidth - summaryBoxWidth - 6;
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, finalY, bankBoxWidth, 36, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, finalY, bankBoxWidth, 36, 2, 2, 'S');

  let bky = finalY + 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
  doc.text('ELECTRONIC PAYMENT / BANK SETTLEMENT', margin + 4, bky);

  bky += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('Account Name: PrintezYour Commercial Press', margin + 4, bky);
  bky += 3.5;
  doc.text('Bank: Axis Bank · Branch: Chandigarh Sector 20', margin + 4, bky);
  bky += 3.5;
  doc.text('A/C No: 924020058849182 · IFSC: UTIB0000185', margin + 4, bky);
  bky += 3.5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`UPI VPA: ${settings?.upiId || '8557049897@okbizaxis'}`, margin + 4, bky);
  bky += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()} (${order.paymentMethod})`, margin + 4, bky);

  // Right Box: Financial Totals
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(summaryX, finalY, summaryBoxWidth, 36, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(summaryX, finalY, summaryBoxWidth, 36, 2, 2, 'S');

  let ty = finalY + 5;
  const subtotal = order.subtotal;
  const deliveryFee = order.deliveryFee || 0;
  const discount = order.discountAmount || 0;

  // Subtotal line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('Subtotal (Taxable):', summaryX + 4, ty);
  doc.text(`₹${subtotal.toFixed(2)}`, summaryX + summaryBoxWidth - 4, ty, { align: 'right' });

  if (isGST) {
    const totalTax = order.taxAmount || Math.round(subtotal * (gstPercent / 100));

    if (isIntraState) {
      const halfRate = (gstPercent / 2).toFixed(1);
      const halfTax = (totalTax / 2).toFixed(2);
      ty += 4;
      doc.text(`CGST (${halfRate}%):`, summaryX + 4, ty);
      doc.text(`₹${halfTax}`, summaryX + summaryBoxWidth - 4, ty, { align: 'right' });

      ty += 4;
      doc.text(`SGST (${halfRate}%):`, summaryX + 4, ty);
      doc.text(`₹${halfTax}`, summaryX + summaryBoxWidth - 4, ty, { align: 'right' });
    } else {
      ty += 4;
      doc.text(`IGST (${gstPercent}%):`, summaryX + 4, ty);
      doc.text(`₹${totalTax.toFixed(2)}`, summaryX + summaryBoxWidth - 4, ty, { align: 'right' });
    }
  }

  ty += 4;
  doc.text('Delivery & Freight:', summaryX + 4, ty);
  doc.text(deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`, summaryX + summaryBoxWidth - 4, ty, { align: 'right' });

  if (discount > 0) {
    ty += 4;
    doc.text('Commercial Discount:', summaryX + 4, ty);
    doc.text(`-₹${discount.toFixed(2)}`, summaryX + summaryBoxWidth - 4, ty, { align: 'right' });
  }

  // Grand Total Line
  ty += 5;
  doc.setDrawColor(203, 213, 225);
  doc.line(summaryX + 2, ty - 1.5, summaryX + summaryBoxWidth - 2, ty - 1.5);

  const grandTotal = isGST ? order.totalAmount : (subtotal + deliveryFee - discount);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
  doc.text('Total Invoice Value:', summaryX + 4, ty + 2);
  doc.text(`₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, summaryX + summaryBoxWidth - 4, ty + 2, { align: 'right' });

  // 6. Amount in Words
  let wordY = finalY + 41;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Amount Chargeable (in words):', margin, wordY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  const wordsText = numberToWordsINR(grandTotal);
  doc.text(wordsText, margin + 42, wordY);

  // 7. Terms & Conditions and Authorized Signatory
  let botY = wordY + 8;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, botY, pageWidth - margin, botY);

  botY += 5;
  const termsWidth = contentWidth * 0.65;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Terms & Conditions:', margin, botY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  const terms = [
    '1. Goods manufactured as per custom specifications/artwork approved by the client cannot be returned.',
    '2. Any discrepancy or transit damage must be notified within 24 hours of receipt.',
    '3. Interest @ 18% p.a. will be levied on overdue payments exceeding agreed commercial credit terms.',
    '4. All disputes are strictly subject to Chandigarh Tricity jurisdiction only.'
  ];
  terms.forEach((t, i) => {
    doc.text(t, margin, botY + 3.8 * (i + 1));
  });

  // Signatory Box
  const sigX = pageWidth - margin - 50;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`For ${settings?.brandName || 'PrintezYour'}`, sigX, botY, { align: 'center' });

  // Stamp simulation
  doc.setDrawColor(29, 78, 216);
  doc.setLineWidth(0.3);
  doc.roundedRect(sigX - 18, botY + 4, 36, 12, 1, 1, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(29, 78, 216);
  doc.text('PRINTEZYOUR PRESS', sigX, botY + 9, { align: 'center' });
  doc.text('VERIFIED & AUDITED', sigX, botY + 13, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('Authorized Signatory', sigX, botY + 20, { align: 'center' });

  // 8. Bottom Page Footer
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `This is a digitally generated document created by PrintezYour ERP · Generated on ${new Date().toLocaleString('en-IN')}`,
    pageWidth / 2,
    290,
    { align: 'center' }
  );

  return doc;
}
