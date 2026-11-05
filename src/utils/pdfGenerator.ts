import jsPDF from 'jspdf';
import { Sale, CompanySettings } from '../types';
import { formatMoney, formatPV } from './formatters';

export const generateInvoicePDF = (sale: Sale, companySettings?: CompanySettings): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let currentY = 15;

  // --- 1. Top Decorative Brand Bar ---
  doc.setFillColor(234, 88, 12); // Orange-600
  doc.rect(margin, currentY, pageWidth - (margin * 2), 3, 'F');
  currentY += 8;

  // --- 2. Header: Company Info on Left, Invoice Title on Right ---
  const compName = companySettings?.name || 'WHIEDA SMART';
  const compTagline = companySettings?.tagline || 'Cabinet de Santé, Pharmacie Naturelle & Prospérité Partagée';
  const compAddress = companySettings?.address || 'Boulevard de la Liberté, Akwa - Douala, Cameroun';
  const compPhone = companySettings?.phone || '(+237) 699 00 11 22';
  const compEmail = companySettings?.email || 'contact@whiedasmart.com';

  // Company Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(220, 38, 38); // Red-600
  doc.text(compName, margin, currentY);

  // Invoice Title
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text('FACTURE ACQUITTÉE', pageWidth - margin, currentY, { align: 'right' });
  currentY += 5;

  // Subtitles
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(compTagline, margin, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(234, 88, 12); // Orange-600
  doc.text(`N° ${sale.receiptNumber}`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`${compAddress}`, margin, currentY);
  doc.text(`Date : ${sale.date} à ${sale.time}`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 4;

  doc.text(`Tél : ${compPhone} · Email : ${compEmail}`, margin, currentY);
  doc.text(`Statut : PAYÉ & ENCAISSÉ`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 8;

  // Divider line
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 7;

  // --- 3. Client & Transaction Details (2 Columns) ---
  const boxWidth = (pageWidth - (margin * 2) - 6) / 2;
  const boxHeight = 28;

  // Left Box: Client & Sponsor
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.roundedRect(margin, currentY, boxWidth, boxHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, boxWidth, boxHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(234, 88, 12);
  doc.text('CLIENT & BÉNÉFICIAIRE', margin + 3.5, currentY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(sale.patientName, margin + 3.5, currentY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  if (sale.sponsorPartnerName) {
    doc.text(`Parrain Réseau MLM :`, margin + 3.5, currentY + 16.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(194, 65, 12);
    doc.text(`${sale.sponsorPartnerName} (${sale.sponsorPartnerCode || 'ID'})`, margin + 3.5, currentY + 21);
  } else {
    doc.text('Parrainage : Vente directe comptoir (Sans parrain)', margin + 3.5, currentY + 17);
  }

  // Right Box: Settlement & Cashier
  const rightBoxX = margin + boxWidth + 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightBoxX, currentY, boxWidth, boxHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightBoxX, currentY, boxWidth, boxHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(234, 88, 12);
  doc.text('MODALITÉS D’ENCAISSEMENT', rightBoxX + 3.5, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Caissier(e) : ${sale.cashierName}`, rightBoxX + 3.5, currentY + 11);
  doc.text(`Mode de paiement : ${sale.paymentMethod.toUpperCase()}`, rightBoxX + 3.5, currentY + 16.5);
  doc.text(`Réf. Transaction : ${sale.paymentReference || 'Guichet Caisse'}`, rightBoxX + 3.5, currentY + 21.5);

  currentY += boxHeight + 8;

  // --- 4. Products / Services Items Table ---
  // Table Header
  const colX = {
    num: margin + 2,
    sku: margin + 10,
    desc: margin + 36,
    qty: margin + 102,
    price: margin + 118,
    pv: margin + 142,
    total: pageWidth - margin - 2,
  };

  doc.setFillColor(241, 245, 249); // Slate-100
  doc.rect(margin, currentY, pageWidth - (margin * 2), 7, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, currentY + 7, pageWidth - margin, currentY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('#', colX.num, currentY + 4.8);
  doc.text('CODE', colX.sku, currentY + 4.8);
  doc.text('DÉSIGNATION ARTICLE / PRESTATION', colX.desc, currentY + 4.8);
  doc.text('QTÉ', colX.qty, currentY + 4.8, { align: 'center' });
  doc.text('P.U (FCFA)', colX.price + 10, currentY + 4.8, { align: 'right' });
  doc.text('VALEUR PV', colX.pv + 8, currentY + 4.8, { align: 'right' });
  doc.text('TOTAL (FCFA)', colX.total, currentY + 4.8, { align: 'right' });

  currentY += 7;

  // Table Body Rows
  sale.items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(margin, currentY, pageWidth - (margin * 2), 7, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(String(index + 1), colX.num, currentY + 4.8);
    
    doc.setFont('courier', 'normal');
    doc.text(item.sku, colX.sku, currentY + 4.8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    const truncatedName = item.productName.length > 36 ? item.productName.slice(0, 34) + '...' : item.productName;
    doc.text(truncatedName, colX.desc, currentY + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.text(String(item.quantity), colX.qty, currentY + 4.8, { align: 'center' });

    doc.setFont('courier', 'normal');
    doc.text(new Intl.NumberFormat('fr-FR').format(item.patientPrice), colX.price + 10, currentY + 4.8, { align: 'right' });

    doc.setTextColor(217, 119, 6);
    doc.text(`${item.pv * item.quantity} PV`, colX.pv + 8, currentY + 4.8, { align: 'right' });

    doc.setFont('courier', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(new Intl.NumberFormat('fr-FR').format(item.subtotal), colX.total, currentY + 4.8, { align: 'right' });

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, currentY + 7, pageWidth - margin, currentY + 7);
    currentY += 7;
  });

  currentY += 4;

  // --- 5. Financial Summary & Totals ---
  const summaryBoxWidth = 85;
  const summaryX = pageWidth - margin - summaryBoxWidth;
  const summaryHeight = 36;

  // Left Note Box (Notice & Health recommendations)
  const noteBoxWidth = summaryX - margin - 8;
  doc.setFillColor(254, 243, 199); // Amber-100
  doc.roundedRect(margin, currentY, noteBoxWidth, summaryHeight, 2, 2, 'F');
  doc.setDrawColor(251, 191, 36);
  doc.roundedRect(margin, currentY, noteBoxWidth, summaryHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14); // Amber-800
  doc.text('CONSIGNES PHARMACEUTIQUES & RÉSEAU', margin + 3.5, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 53, 15);
  const noteText = [
    '• Respecter scrupuleusement la posologie figurant sur la notice.',
    '• Ce reçu officiel fait foi de preuve d\'achat en pharmacie et boutique.',
    `• Points Valeur crédités : +${formatPV(sale.totalPv)} comptabilisés au compte.`,
    sale.sponsorPartnerName ? `• Gain parrain alloué : +${formatMoney(sale.totalPartnerGain)} généré.` : '• Vente au comptoir sans affiliation parrain.',
  ];
  let noteY = currentY + 11;
  noteText.forEach(line => {
    doc.text(line, margin + 3.5, noteY);
    noteY += 4.5;
  });

  // Right Totals Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(summaryX, currentY, summaryBoxWidth, summaryHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(summaryX, currentY, summaryBoxWidth, summaryHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Sous-Total Brut :', summaryX + 4, currentY + 6);
  doc.setFont('courier', 'normal');
  doc.text(formatMoney(sale.totalAmount), pageWidth - margin - 4, currentY + 6, { align: 'right' });

  if (sale.discountAmount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(220, 38, 38);
    doc.text('Remise Accordée :', summaryX + 4, currentY + 12);
    doc.setFont('courier', 'normal');
    doc.text(`-${formatMoney(sale.discountAmount)}`, pageWidth - margin - 4, currentY + 12, { align: 'right' });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Remise :', summaryX + 4, currentY + 12);
    doc.setFont('courier', 'normal');
    doc.text('0 FCFA', pageWidth - margin - 4, currentY + 12, { align: 'right' });
  }

  // Highlight Net Amount to pay
  doc.setFillColor(234, 88, 12); // Orange-600
  doc.roundedRect(summaryX + 2, currentY + 16, summaryBoxWidth - 4, 10, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL NET PAYÉ :', summaryX + 5, currentY + 22.5);
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.text(formatMoney(sale.netAmount), pageWidth - margin - 5, currentY + 22.5, { align: 'right' });

  // Points PV & Payment method recap
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.text(`Total PV acquis : ${formatPV(sale.totalPv)}`, summaryX + 4, currentY + 31);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Réglé par ${sale.paymentMethod.toUpperCase()}`, pageWidth - margin - 4, currentY + 31, { align: 'right' });

  currentY += summaryHeight + 10;

  // --- 6. Stamp & Signature Box ---
  doc.setDrawColor(203, 213, 225);
  doc.setLineDashPattern([2, 2], 0);
  doc.roundedRect(margin, currentY, 50, 18, 1, 1, 'S');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Cachet Caisse & Signature', margin + 6, currentY + 7);
  doc.text('Whieda Smart Akwa Douala', margin + 6, currentY + 12);

  // Cashier verification text
  doc.setLineDashPattern([], 0);
  doc.text('Opération validée informatiquement.', pageWidth - margin, currentY + 7, { align: 'right' });
  doc.text('Reçu délivré au client le jour de la transaction.', pageWidth - margin, currentY + 12, { align: 'right' });

  currentY += 24;

  // --- 7. Footer Notice ---
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `${compName} · SAS au capital de 10 000 000 FCFA · N° Contribuable M012618290192 · RCCM RC/DLA/2026/B/142`,
    pageWidth / 2,
    pageHeight - 11,
    { align: 'center' }
  );
  doc.text(
    'Les produits de phytothérapie naturelle ne remplacent pas une consultation médicale spécialisée en cas de pathologie grave.',
    pageWidth / 2,
    pageHeight - 7,
    { align: 'center' }
  );

  // Trigger download
  const cleanReceiptNum = sale.receiptNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Facture_Whieda_${cleanReceiptNum}.pdf`);
};
