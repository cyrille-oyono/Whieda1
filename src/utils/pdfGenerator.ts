import jsPDF from 'jspdf';
import { Sale, CompanySettings, Partner } from '../types';
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

// ============================================================================
// 1. ÉTAT ADMINISTRATEUR ET FINANCIER GLOBAL (FORMAT PAYSAGE A4)
// ============================================================================
export const generateGlobalAdminReportPDF = (partners: Partner[], companySettings?: CompanySettings): void => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210mm
  const margin = 12;
  let currentY = 12;

  // Header Brand Bar
  doc.setFillColor(220, 38, 38); // Red-600
  doc.rect(margin, currentY, pageWidth - (margin * 2), 2.5, 'F');
  currentY += 7;

  // Header Titles
  const compName = companySettings?.name || 'WHIEDA SMART';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(220, 38, 38);
  doc.text(compName, margin, currentY);

  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('ÉTAT ADMINISTRATIF & FINANCIER GLOBAL DU RÉSEAU', pageWidth - margin, currentY, { align: 'right' });
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Direction Générale · Caisse & Administration du Réseau MLM', margin, currentY);
  const nowStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(`Document officiel généré le : ${nowStr}`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 7;

  // Global Administrative & Financial Synthesis Calculations
  const totalPartners = partners.length;
  const qualifiedCount = partners.filter(p => p.qualificationStatus === 'Qualifié' || (p.totalPv >= 100)).length;
  const nonQualifiedCount = totalPartners - qualifiedCount;

  // Card Status breakdown
  const cardStart = partners.filter(p => p.cardStatus === 'Start' || (!p.cardStatus && p.level === 'Bronze')).length;
  const cardStandard = partners.filter(p => p.cardStatus === 'Standard' || p.level === 'Argent').length;
  const cardPremium = partners.filter(p => p.cardStatus === 'Premium' || p.level === 'Or').length;
  const cardVIP = partners.filter(p => p.cardStatus === 'VIP' || p.level === 'Diamant').length;

  // Financial cumuls
  const totalPv = partners.reduce((sum, p) => sum + p.totalPv, 0);
  const totalPvPlaced = partners.reduce((sum, p) => sum + p.placedPv, 0);
  const totalPvRemaining = partners.reduce((sum, p) => sum + p.remainingPv, 0);
  const totalDirectEarnings = partners.reduce((sum, p) => sum + p.totalDirectEarnings, 0);
  const totalPaidEarnings = partners.reduce((sum, p) => sum + p.paidEarnings, 0);
  const totalRemainingEarnings = partners.reduce((sum, p) => sum + p.remainingEarnings, 0);

  // --- SYNTHESIS BOXES (2 side-by-side cards) ---
  const synthBoxWidth = (pageWidth - (margin * 2) - 6) / 2;
  const synthBoxHeight = 24;

  // Card 1: Synthèse Administrative
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, synthBoxWidth, synthBoxHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, synthBoxWidth, synthBoxHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(234, 88, 12); // Orange
  doc.text('1. SYNTHÈSE ADMINISTRATIVE DU RÉSEAU', margin + 4, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Total Partenaires : ${totalPartners} membres actifs`, margin + 4, currentY + 11);
  doc.text(`Cartes : Start (${cardStart}) · Standard (${cardStandard}) · Premium (${cardPremium}) · VIP (${cardVIP})`, margin + 4, currentY + 16);
  doc.text(`Statut Qualification : ${qualifiedCount} Qualifiés · ${nonQualifiedCount} Non qualifiés`, margin + 4, currentY + 21);

  // Card 2: Synthèse Financière Globale
  const rightX = margin + synthBoxWidth + 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightX, currentY, synthBoxWidth, synthBoxHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightX, currentY, synthBoxWidth, synthBoxHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(220, 38, 38); // Red
  doc.text('2. SYNTHÈSE FINANCIÈRE & POINTS DE VALEUR (PV)', rightX + 4, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Cumul PV : ${formatPV(totalPv)} total (dont ${totalPvPlaced} placés et ${totalPvRemaining} restants)`, rightX + 4, currentY + 11);
  doc.text(`Gains Directs Accumulés : ${formatMoney(totalDirectEarnings)}`, rightX + 4, currentY + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(194, 65, 12);
  doc.text(`Déjà Réglé : ${formatMoney(totalPaidEarnings)}  |  Reste à Payer au Réseau : ${formatMoney(totalRemainingEarnings)}`, rightX + 4, currentY + 21);

  currentY += synthBoxHeight + 6;

  // --- THE 10-COLUMN COMPLETE RECAPITULATIVE TABLE ---
  const cols = [
    { header: "Date d'Entrée", x: margin + 2, w: 22, align: 'left' },
    { header: "Nom et ID Partenaire", x: margin + 24, w: 50, align: 'left' },
    { header: "Parrain Up", x: margin + 74, w: 34, align: 'left' },
    { header: "Carte / Grade", x: margin + 108, w: 26, align: 'left' },
    { header: "Qualif.", x: margin + 134, w: 20, align: 'center' },
    { header: "PV Total", x: margin + 154, w: 20, align: 'right' },
    { header: "PV Placés", x: margin + 174, w: 20, align: 'right' },
    { header: "PV Rest.", x: margin + 194, w: 20, align: 'right' },
    { header: "Gains Accumulés", x: margin + 214, w: 30, align: 'right' },
    { header: "Gains Payés", x: margin + 244, w: 26, align: 'right' },
    { header: "Reste à Payer", x: pageWidth - margin - 2, w: 26, align: 'right' },
  ];

  // Table Header row
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, pageWidth - (margin * 2), 6.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, currentY + 6.5, pageWidth - margin, currentY + 6.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  cols.forEach(col => {
    if (col.align === 'right') {
      doc.text(col.header, col.x, currentY + 4.5, { align: 'right' });
    } else if (col.align === 'center') {
      doc.text(col.header, col.x + (col.w / 2), currentY + 4.5, { align: 'center' });
    } else {
      doc.text(col.header, col.x, currentY + 4.5);
    }
  });

  currentY += 6.5;

  // Table Body Rows
  partners.forEach((p, index) => {
    // Check if new page needed
    if (currentY > pageHeight - 20) {
      doc.addPage();
      currentY = 15;
    }

    const isEven = index % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, currentY, pageWidth - (margin * 2), 6.2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);

    // 1. Date d'entrée
    doc.text(p.registeredAt || '2026-01-10', cols[0].x, currentY + 4.2);

    // 2. Nom et ID
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    const pName = `${p.firstName} ${p.lastName} (${p.code})`;
    doc.text(pName.length > 28 ? pName.slice(0, 26) + '...' : pName, cols[1].x, currentY + 4.2);

    // 3. Parrain Up
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(p.sponsorName ? `${p.sponsorName.slice(0, 16)}` : 'Tête réseau', cols[2].x, currentY + 4.2);

    // 4. Statut carte / grade
    doc.setFont('helvetica', 'bold');
    const cardBadge = p.cardStatus || (p.level === 'Diamant' ? 'VIP' : p.level === 'Or' ? 'Premium' : p.level === 'Argent' ? 'Standard' : 'Start');
    doc.setTextColor(cardBadge === 'VIP' ? 126 : cardBadge === 'Premium' ? 194 : 30, cardBadge === 'VIP' ? 34 : cardBadge === 'Premium' ? 65 : 41, cardBadge === 'VIP' ? 206 : cardBadge === 'Premium' ? 12 : 59);
    doc.text(`${cardBadge} (${p.level})`, cols[3].x, currentY + 4.2);

    // 5. Statut Qualification
    const qual = p.qualificationStatus || (p.totalPv >= 100 ? 'Qualifié' : 'Non qualifié');
    doc.setTextColor(qual === 'Qualifié' ? 4 : 150, qual === 'Qualifié' ? 120 : 50, qual === 'Qualifié' ? 87 : 50);
    doc.text(qual, cols[4].x + (cols[4].w / 2), currentY + 4.2, { align: 'center' });

    // 6. PV Total
    doc.setFont('courier', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text(String(p.totalPv), cols[5].x + cols[5].w - 2, currentY + 4.2, { align: 'right' });

    // 7. PV Placés
    doc.setFont('courier', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(String(p.placedPv), cols[6].x + cols[6].w - 2, currentY + 4.2, { align: 'right' });

    // 8. PV Restants
    doc.setTextColor(p.remainingPv > 0 ? 194 : 100, p.remainingPv > 0 ? 65 : 116, p.remainingPv > 0 ? 12 : 139);
    doc.text(String(p.remainingPv), cols[7].x + cols[7].w - 2, currentY + 4.2, { align: 'right' });

    // 9. Gains Directs Accumulés
    doc.setFont('courier', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(formatMoney(p.totalDirectEarnings), cols[8].x + cols[8].w - 2, currentY + 4.2, { align: 'right' });

    // 10. Gains Payés
    doc.setTextColor(4, 120, 87);
    doc.text(formatMoney(p.paidEarnings), cols[9].x + cols[9].w - 2, currentY + 4.2, { align: 'right' });

    // 11. Gains Restants
    doc.setFont('courier', 'bold');
    doc.setTextColor(p.remainingEarnings > 0 ? 220 : 100, p.remainingEarnings > 0 ? 38 : 116, p.remainingEarnings > 0 ? 38 : 139);
    doc.text(formatMoney(p.remainingEarnings), cols[10].x, currentY + 4.2, { align: 'right' });

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, currentY + 6.2, pageWidth - margin, currentY + 6.2);
    currentY += 6.2;
  });

  // Table Totals Footer Row
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, pageWidth - (margin * 2), 7, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  doc.line(margin, currentY + 7, pageWidth - margin, currentY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`TOTAL GÉNÉRAL (${totalPartners} PARTENAIRES)`, cols[0].x, currentY + 4.8);

  doc.setFont('courier', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text(String(totalPv), cols[5].x + cols[5].w - 2, currentY + 4.8, { align: 'right' });
  doc.text(String(totalPvPlaced), cols[6].x + cols[6].w - 2, currentY + 4.8, { align: 'right' });
  doc.text(String(totalPvRemaining), cols[7].x + cols[7].w - 2, currentY + 4.8, { align: 'right' });

  doc.setTextColor(15, 23, 42);
  doc.text(formatMoney(totalDirectEarnings), cols[8].x + cols[8].w - 2, currentY + 4.8, { align: 'right' });
  doc.setTextColor(4, 120, 87);
  doc.text(formatMoney(totalPaidEarnings), cols[9].x + cols[9].w - 2, currentY + 4.8, { align: 'right' });
  doc.setTextColor(220, 38, 38);
  doc.text(formatMoney(totalRemainingEarnings), cols[10].x, currentY + 4.8, { align: 'right' });

  currentY += 13;

  // Signatures on Bottom
  if (currentY > pageHeight - 25) {
    doc.addPage();
    currentY = 20;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Le Responsable Administratif & Réseau', margin + 10, currentY);
  doc.text('La Direction Financière & Comptabilité', pageWidth - margin - 70, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('[Visa & Cachet Officiel Whieda Smart]', margin + 10, currentY + 5);
  doc.text('[Visa & Cachet Direction Générale]', pageWidth - margin - 70, currentY + 5);

  const cleanDate = new Date().toISOString().split('T')[0];
  doc.save(`Etat_Global_Admin_Financier_Whieda_${cleanDate}.pdf`);
};

// ============================================================================
// 2. ARBORESCENCE & GÉNÉALOGIE DU RÉSEAU (FORMAT PORTRAIT A4)
// ============================================================================
export const generateNetworkTreePDF = (partners: Partner[], companySettings?: CompanySettings): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  let currentY = 14;

  // Header Bar
  doc.setFillColor(234, 88, 12); // Orange-600
  doc.rect(margin, currentY, pageWidth - (margin * 2), 2.5, 'F');
  currentY += 7;

  // Header Titles
  const compName = companySettings?.name || 'WHIEDA SMART';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(220, 38, 38);
  doc.text(compName, margin, currentY);

  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('ARBRE DU RÉSEAU MLM (GÉNÉALOGIE)', pageWidth - margin, currentY, { align: 'right' });
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Hiérarchie des parrains, filleuls, statuts de carte et Points de Valeur (PV)', margin, currentY);
  const nowStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(`Édition du : ${nowStr}`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 8;

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 6;

  // Helper to build tree nodes recursively
  const roots = partners.filter(p => !p.sponsorId || !partners.some(parent => parent.id === p.sponsorId));

  const renderNode = (p: Partner, depth: number) => {
    if (currentY > pageHeight - 20) {
      doc.addPage();
      currentY = 15;
    }

    const card = p.cardStatus || (p.level === 'Diamant' ? 'VIP' : p.level === 'Or' ? 'Premium' : p.level === 'Argent' ? 'Standard' : 'Start');
    const qual = p.qualificationStatus || (p.totalPv >= 100 ? 'Qualifié' : 'Non qualifié');
    const directDownlines = partners.filter(child => child.sponsorId === p.id);

    const indentX = margin + (depth * 9);
    const rowWidth = pageWidth - margin - indentX;

    // Background box for each node
    if (depth === 0) {
      doc.setFillColor(254, 243, 199); // Amber-100 for Root
      doc.setDrawColor(245, 158, 11);
    } else if (depth === 1) {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
    } else {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
    }

    doc.roundedRect(indentX, currentY, rowWidth, 9, 1.5, 1.5, 'FD');

    // Hierarchy prefix indicator
    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const prefix = depth === 0 ? '👑 [TÊTE]' : depth === 1 ? '├── [Niv 1]' : '    └── [Niv 2]';
    doc.text(prefix, indentX + 2, currentY + 6);

    // Partner ID & Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    const nameStr = `${p.code} - ${p.firstName} ${p.lastName}`;
    doc.text(nameStr, indentX + 24, currentY + 6);

    // Card Badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(card === 'VIP' ? 126 : card === 'Premium' ? 194 : 30, card === 'VIP' ? 34 : card === 'Premium' ? 65 : 41, card === 'VIP' ? 206 : card === 'Premium' ? 12 : 59);
    doc.text(`Carte : ${card}`, indentX + 75, currentY + 6);

    // Qualification
    doc.setTextColor(qual === 'Qualifié' ? 4 : 180, qual === 'Qualifié' ? 120 : 60, qual === 'Qualifié' ? 87 : 60);
    doc.text(`[${qual}]`, indentX + 104, currentY + 6);

    // PV Recap
    doc.setFont('courier', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text(`${p.totalPv} PV (Placés: ${p.placedPv} / Rest: ${p.remainingPv})`, pageWidth - margin - 3, currentY + 6, { align: 'right' });

    currentY += 10.5;

    // Recursively render children
    directDownlines.forEach(child => {
      renderNode(child, depth + 1);
    });
  };

  // Render all roots
  roots.forEach(root => {
    renderNode(root, 0);
  });

  const cleanDate = new Date().toISOString().split('T')[0];
  doc.save(`Arborescence_Reseau_Whieda_${cleanDate}.pdf`);
};

// ============================================================================
// 3. FICHE INDIVIDUELLE DU PARTENAIRE (FORMAT PORTRAIT A4)
// ============================================================================
export const generatePartnerSheetPDF = (partner: Partner, downlines: Partner[], companySettings?: CompanySettings): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 15;
  let currentY = 15;

  // Header Brand Bar
  doc.setFillColor(220, 38, 38);
  doc.rect(margin, currentY, pageWidth - (margin * 2), 3, 'F');
  currentY += 8;

  // Header Title
  const compName = companySettings?.name || 'WHIEDA SMART';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(220, 38, 38);
  doc.text(compName, margin, currentY);

  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('FICHE INDIVIDUELLE DU PARTENAIRE', pageWidth - margin, currentY, { align: 'right' });
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Dossier Administratif, Réseau & Bilan Financier', margin, currentY);
  const nowStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(`Date d'émission : ${nowStr}`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 7;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 6;

  // --- SECTION 1: INFORMATIONS ADMINISTRATIVES ---
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 40, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 40, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(234, 88, 12);
  doc.text('1. INFORMATIONS ADMINISTRATIVES DU MEMBRE', margin + 4, currentY + 6);

  const col1X = margin + 4;
  const col2X = margin + 65;
  const col3X = margin + 125;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Nom & Prénom :', col1X, currentY + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${partner.firstName} ${partner.lastName}`, col1X, currentY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Code Unique / ID :', col1X, currentY + 25);
  doc.setFont('courier', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text(partner.code, col1X, currentY + 30);

  // Column 2
  const card = partner.cardStatus || (partner.level === 'Diamant' ? 'VIP' : partner.level === 'Or' ? 'Premium' : partner.level === 'Argent' ? 'Standard' : 'Start');
  const qual = partner.qualificationStatus || (partner.totalPv >= 100 ? 'Qualifié' : 'Non qualifié');

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Statut de Carte :', col2X, currentY + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${card} (Grade : ${partner.level})`, col2X, currentY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Statut de Qualification :', col2X, currentY + 25);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(qual === 'Qualifié' ? 4 : 180, qual === 'Qualifié' ? 120 : 60, qual === 'Qualifié' ? 87 : 60);
  doc.text(qual, col2X, currentY + 30);

  // Column 3
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Parrain Réseau (Up-Line) :', col3X, currentY + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(partner.sponsorName ? `${partner.sponsorName} (${partner.sponsorCode})` : 'Tête de Réseau', col3X, currentY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Date d\'entrée au Réseau :', col3X, currentY + 25);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(partner.registeredAt || '2026-01-10', col3X, currentY + 30);

  currentY += 46;

  // --- SECTION 2: BILAN FINANCIER & POINTS DE VALEUR (PV) ---
  const halfBoxWidth = (pageWidth - (margin * 2) - 6) / 2;
  const boxH = 34;

  // Financial Left Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, halfBoxWidth, boxH, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, halfBoxWidth, boxH, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(220, 38, 38);
  doc.text('2. SITUATION FINANCIÈRE DES GAINS DIRECTS', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Gains Directs Totaux Accumulés :', margin + 4, currentY + 13);
  doc.setFont('courier', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatMoney(partner.totalDirectEarnings), margin + halfBoxWidth - 4, currentY + 13, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Commissions Déjà Soldées (Payées) :', margin + 4, currentY + 20);
  doc.setFont('courier', 'bold');
  doc.setTextColor(4, 120, 87);
  doc.text(formatMoney(partner.paidEarnings), margin + halfBoxWidth - 4, currentY + 20, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(194, 65, 12);
  doc.text('Reste à Payer au Partenaire :', margin + 4, currentY + 28);
  doc.setFont('courier', 'bold');
  doc.text(formatMoney(partner.remainingEarnings), margin + halfBoxWidth - 4, currentY + 28, { align: 'right' });

  // PV Right Box
  const pvBoxX = margin + halfBoxWidth + 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(pvBoxX, currentY, halfBoxWidth, boxH, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(pvBoxX, currentY, halfBoxWidth, boxH, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(234, 88, 12);
  doc.text('3. SITUATION DES POINTS DE VALEUR (PV)', pvBoxX + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Cumul PV Totaux Accumulés :', pvBoxX + 4, currentY + 13);
  doc.setFont('courier', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text(formatPV(partner.totalPv), pvBoxX + halfBoxWidth - 4, currentY + 13, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('PV Placés dans l\'Arbre Binaire :', pvBoxX + 4, currentY + 20);
  doc.setFont('courier', 'normal');
  doc.setTextColor(4, 120, 87);
  doc.text(formatPV(partner.placedPv), pvBoxX + halfBoxWidth - 4, currentY + 20, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text('PV Restants à Placer :', pvBoxX + 4, currentY + 28);
  doc.setFont('courier', 'bold');
  doc.text(formatPV(partner.remainingPv), pvBoxX + halfBoxWidth - 4, currentY + 28, { align: 'right' });

  currentY += boxH + 8;

  // --- SECTION 3: ÉTAT DU RÉSEAU PERSONNEL (FILLEULS) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`4. ÉTAT DU RÉSEAU PERSONNEL (${downlines.length} FILLEUL(S) DIRECT(S) & AFFILIÉS)`, margin, currentY);
  currentY += 4;

  // Downlines table
  const downCols = [
    { h: 'Code / ID', x: margin + 2, w: 25 },
    { h: 'Nom & Prénom', x: margin + 28, w: 50 },
    { h: 'Carte', x: margin + 78, w: 25 },
    { h: 'Qualif.', x: margin + 103, w: 25 },
    { h: 'PV Total', x: margin + 128, w: 25, align: 'right' },
    { h: 'Date Entrée', x: pageWidth - margin - 2, w: 25, align: 'right' },
  ];

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, pageWidth - (margin * 2), 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  downCols.forEach(col => {
    if (col.align === 'right') {
      doc.text(col.h, col.x, currentY + 4.2, { align: 'right' });
    } else {
      doc.text(col.h, col.x, currentY + 4.2);
    }
  });

  currentY += 6;

  if (downlines.length === 0) {
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, currentY, pageWidth - (margin * 2), 10, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Aucun filleul directement rattaché pour le moment.', margin + 4, currentY + 6.5);
    currentY += 12;
  } else {
    downlines.forEach((child, idx) => {
      const isEven = idx % 2 === 0;
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.rect(margin, currentY, pageWidth - (margin * 2), 6, 'F');

      doc.setFont('courier', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(child.code, downCols[0].x, currentY + 4.2);

      doc.setFont('helvetica', 'normal');
      doc.text(`${child.firstName} ${child.lastName}`, downCols[1].x, currentY + 4.2);

      const childCard = child.cardStatus || (child.level === 'Diamant' ? 'VIP' : child.level === 'Or' ? 'Premium' : child.level === 'Argent' ? 'Standard' : 'Start');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(childCard === 'VIP' ? 126 : childCard === 'Premium' ? 194 : 30, childCard === 'VIP' ? 34 : childCard === 'Premium' ? 65 : 41, childCard === 'VIP' ? 206 : childCard === 'Premium' ? 12 : 59);
      doc.text(childCard, downCols[2].x, currentY + 4.2);

      const childQual = child.qualificationStatus || (child.totalPv >= 100 ? 'Qualifié' : 'Non qualifié');
      doc.setTextColor(childQual === 'Qualifié' ? 4 : 150, childQual === 'Qualifié' ? 120 : 50, childQual === 'Qualifié' ? 87 : 50);
      doc.text(childQual, downCols[3].x, currentY + 4.2);

      doc.setFont('courier', 'bold');
      doc.setTextColor(180, 83, 9);
      doc.text(formatPV(child.totalPv), downCols[4].x + downCols[4].w - 2, currentY + 4.2, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(child.registeredAt || '2026-02-01', downCols[5].x, currentY + 4.2, { align: 'right' });

      doc.setDrawColor(241, 245, 249);
      doc.line(margin, currentY + 6, pageWidth - margin, currentY + 6);
      currentY += 6;
    });
  }

  currentY += 8;

  // Stamp & Signatures Box
  doc.setDrawColor(203, 213, 225);
  doc.setLineDashPattern([2, 2], 0);
  doc.roundedRect(margin, currentY, 50, 18, 1, 1, 'S');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Cachet de la Direction Réseau', margin + 4, currentY + 7);
  doc.text('Whieda Smart Akwa Douala', margin + 4, currentY + 12);

  doc.setLineDashPattern([], 0);
  doc.text('Fiche certifiée conforme aux registres MLM.', pageWidth - margin, currentY + 7, { align: 'right' });
  doc.text('Délivrée pour servir et valoir ce que de droit.', pageWidth - margin, currentY + 12, { align: 'right' });

  doc.save(`Fiche_Partenaire_${partner.code}.pdf`);
};

