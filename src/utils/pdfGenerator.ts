import jsPDF from 'jspdf';
import { Sale, CompanySettings, Partner, Visit, PartnerPayoutRecord } from '../types';
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
  const compName = companySettings?.name || 'WHIEDA MEYOMESSALA';
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
  doc.text('Whieda Meyomessala Akwa Douala', margin + 6, currentY + 12);

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
  const compName = companySettings?.name || 'WHIEDA MEYOMESSALA';
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
  doc.text('[Visa & Cachet Officiel Whieda Meyomessala]', margin + 10, currentY + 5);
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
  const margin = 12;
  let currentY = 12;

  // Header Bar
  doc.setFillColor(234, 88, 12); // Orange-600
  doc.rect(margin, currentY, pageWidth - (margin * 2), 2.5, 'F');
  currentY += 6;

  // Header Titles
  const compName = companySettings?.name || 'WHIEDA MEYOMESSALA';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(220, 38, 38);
  doc.text(compName, margin, currentY);

  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('SYSTÈME RÉSEAU - ARBRE BINAIRE', pageWidth - margin, currentY, { align: 'right' });
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Modèle Graphique d\'Arborescence Binaire (Têtes, Parrains, Filleuls, Statuts Carte & PV)', margin, currentY);
  const nowStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(`Édition du : ${nowStr}`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 7;

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5;

  // =========================================================================
  // SCHÉMA GRAPHIQUE DU SYSTÈME RÉSEAU (MODÈLE EXACT DE LA PHOTO)
  // =========================================================================
  // Background card for graphical diagram
  const graphBoxH = 128;
  doc.setFillColor(254, 252, 249);
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), graphBoxH, 3, 3, 'F');
  doc.setDrawColor(251, 146, 60);
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), graphBoxH, 3, 3, 'S');

  // Title in diagram matching user's handwriting "Système Réseau"
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(194, 65, 12);
  doc.text('Système Réseau (Arborescence Binaire)', margin + 6, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Reproduction vectorielle du modèle manuscrit : Cercles Partenaires, Badges Statut Carte & PV', margin + 6, currentY + 11);

  // Helper to draw a circle node in PDF with annotations
  const drawCircleNode = (x: number, y: number, name: string, card: string, pv: number, isRoot: boolean = false) => {
    const r = isRoot ? 6.5 : 5.5;

    // Fill circle
    if (isRoot) {
      doc.setFillColor(254, 243, 199); // Amber-100
      doc.setDrawColor(217, 119, 6); // Amber-600
    } else {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(234, 88, 12); // Orange-600
    }
    doc.setLineWidth(0.6);
    doc.circle(x, y, r, 'FD');

    // Initials in circle
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(isRoot ? 7 : 6);
    doc.setTextColor(isRoot ? 180 : 234, isRoot ? 83 : 88, isRoot ? 9 : 12);
    doc.text(initials, x, y + (isRoot ? 2.2 : 1.8), { align: 'center' });

    // Annotation text beside or below node
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text(name, x, y + r + 3.5, { align: 'center' });

    // Card status + PV badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(194, 65, 12);
    doc.text(`[${card.toUpperCase()}] ${pv} PV`, x, y + r + 6.8, { align: 'center' });
  };

  // Coordinates matching the user's sketch:
  // Root: Oyono Up
  const rootX = 105;
  const rootY = currentY + 22;

  // Level 1: Idris Awoule (Left), Sara Oyono (Right)
  const idrisX = 58;
  const idrisY = currentY + 46;
  const saraX = 152;
  const saraY = currentY + 46;

  // Level 2: Under Idris (Béatrice Left, Ibrahim Right)
  const beatriceX = 36;
  const beatriceY = currentY + 75;
  const ibrahimX = 78;
  const ibrahimY = currentY + 75;

  // Level 2: Under Sara (Jean-Marc Left, Chantal Right)
  const jmX = 130;
  const jmY = currentY + 75;
  const chantalX = 172;
  const chantalY = currentY + 75;

  // Level 3: Under Béatrice (Sophie, Mireille)
  const sophieX = 25;
  const sophieY = currentY + 104;
  const mireilleX = 46;
  const mireilleY = currentY + 104;

  // Level 3: Under Jean-Marc (Eric, Alain)
  const ericX = 119;
  const ericY = currentY + 104;
  const alainX = 141;
  const alainY = currentY + 104;

  // Level 3: Under Chantal (David)
  const davidX = 172;
  const davidY = currentY + 104;

  // Level 4: Under David (Carine)
  const carineX = 172;
  const carineY = currentY + 120;

  // Draw connecting lines with proper vector stroke
  doc.setDrawColor(251, 146, 60);
  doc.setLineWidth(0.5);

  // Root to Level 1
  doc.line(rootX, rootY, idrisX, idrisY);
  doc.line(rootX, rootY, saraX, saraY);

  // Idris to Level 2
  doc.line(idrisX, idrisY, beatriceX, beatriceY);
  doc.line(idrisX, idrisY, ibrahimX, ibrahimY);

  // Sara to Level 2
  doc.line(saraX, saraY, jmX, jmY);
  doc.line(saraX, saraY, chantalX, chantalY);

  // Béatrice to Level 3
  doc.line(beatriceX, beatriceY, sophieX, sophieY);
  doc.line(beatriceX, beatriceY, mireilleX, mireilleY);

  // Jean-Marc to Level 3
  doc.line(jmX, jmY, ericX, ericY);
  doc.line(jmX, jmY, alainX, alainY);

  // Chantal to Level 3
  doc.line(chantalX, chantalY, davidX, davidY);

  // David to Level 4
  doc.line(davidX, davidY, carineX, carineY);

  // Branch Labels
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(234, 88, 12);
  doc.text('← BRANCHE GAUCHE', idrisX - 10, currentY + 34);
  doc.text('BRANCHE DROITE →', saraX - 10, currentY + 34);

  // Draw the circles with names and values from partner list or drawing
  const pRoot = partners.find(p => p.id === 'ptn-1') || partners[0];
  const pIdris = partners.find(p => p.id === 'ptn-2');
  const pSara = partners.find(p => p.id === 'ptn-3');
  const pBeatrice = partners.find(p => p.id === 'ptn-4');
  const pIbrahim = partners.find(p => p.id === 'ptn-5');
  const pSophie = partners.find(p => p.id === 'ptn-6');
  const pMireille = partners.find(p => p.id === 'ptn-7');
  const pJm = partners.find(p => p.id === 'ptn-8');
  const pChantal = partners.find(p => p.id === 'ptn-9');
  const pEric = partners.find(p => p.id === 'ptn-10');
  const pAlain = partners.find(p => p.id === 'ptn-11');
  const pDavid = partners.find(p => p.id === 'ptn-12');
  const pCarine = partners.find(p => p.id === 'ptn-13');

  // Draw each node (Root)
  drawCircleNode(rootX, rootY, `${pRoot?.firstName || 'OYONO'} ${pRoot?.lastName || 'UP'}`.toUpperCase(), pRoot?.cardStatus || 'START', pRoot?.totalPv || 500, true);

  // Level 1
  drawCircleNode(idrisX, idrisY, `${pIdris?.firstName || 'IDRIS'} ${pIdris?.lastName || 'AWOULE'}`.toUpperCase(), pIdris?.cardStatus || 'START', pIdris?.totalPv || 250);
  drawCircleNode(saraX, saraY, `${pSara?.firstName || 'SARA'} ${pSara?.lastName || 'OYONO'}`.toUpperCase(), pSara?.cardStatus || 'START', pSara?.totalPv || 500);

  // Level 2
  drawCircleNode(beatriceX, beatriceY, `${pBeatrice?.firstName || 'BÉATRICE'} ${pBeatrice?.lastName || 'MANGA'}`.toUpperCase(), pBeatrice?.cardStatus || 'START', pBeatrice?.totalPv || 150);
  drawCircleNode(ibrahimX, ibrahimY, `${pIbrahim?.firstName || 'IBRAHIM'} ${pIbrahim?.lastName || 'TRAORÉ'}`.toUpperCase(), pIbrahim?.cardStatus || 'START', pIbrahim?.totalPv || 120);
  drawCircleNode(jmX, jmY, `${pJm?.firstName || 'JEAN-MARC'} ${pJm?.lastName || 'ETOA'}`.toUpperCase(), pJm?.cardStatus || 'START', pJm?.totalPv || 200);
  drawCircleNode(chantalX, chantalY, `${pChantal?.firstName || 'CHANTAL'} ${pChantal?.lastName || 'BILONG'}`.toUpperCase(), pChantal?.cardStatus || 'START', pChantal?.totalPv || 180);

  // Level 3
  drawCircleNode(sophieX, sophieY, `${pSophie?.firstName || 'SOPHIE'} ${pSophie?.lastName || 'MBALLA'}`.toUpperCase(), pSophie?.cardStatus || 'START', pSophie?.totalPv || 100);
  drawCircleNode(mireilleX, mireilleY, `${pMireille?.firstName || 'MIREILLE'} ${pMireille?.lastName || 'FOTSO'}`.toUpperCase(), pMireille?.cardStatus || 'START', pMireille?.totalPv || 80);
  drawCircleNode(ericX, ericY, `${pEric?.firstName || 'ERIC'} ${pEric?.lastName || 'KOUAM'}`.toUpperCase(), pEric?.cardStatus || 'START', pEric?.totalPv || 140);
  drawCircleNode(alainX, alainY, `${pAlain?.firstName || 'ALAIN'} ${pAlain?.lastName || 'NGUEMO'}`.toUpperCase(), pAlain?.cardStatus || 'START', pAlain?.totalPv || 90);
  drawCircleNode(davidX, davidY, `${pDavid?.firstName || 'DAVID'} ${pDavid?.lastName || 'KENMOGNE'}`.toUpperCase(), pDavid?.cardStatus || 'START', pDavid?.totalPv || 110);

  // Level 4
  drawCircleNode(carineX, carineY, `${pCarine?.firstName || 'CARINE'} ${pCarine?.lastName || 'ATANGANA'}`.toUpperCase(), pCarine?.cardStatus || 'START', pCarine?.totalPv || 60);

  currentY += graphBoxH + 6;

  // =========================================================================
  // LISTE HIÉRARCHIQUE & RÉCAPITULATIF DES POINTS DE VALEUR
  // =========================================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('RÉCAPITULATIF DÉTAILLÉ DE L\'ARBORESCENCE & DES PV :', margin, currentY);
  currentY += 4.5;

  const roots = partners.filter(p => !p.sponsorId || !partners.some(parent => parent.id === p.sponsorId));

  const renderNode = (p: Partner, depth: number) => {
    if (currentY > pageHeight - 16) {
      doc.addPage();
      currentY = 15;
    }

    const card = p.cardStatus || (p.level === 'Diamant' ? 'VIP' : p.level === 'Or' ? 'Premium' : p.level === 'Argent' ? 'Standard' : 'Start');
    const qual = p.qualificationStatus || (p.totalPv >= 100 ? 'Qualifié' : 'Non qualifié');
    const directDownlines = partners.filter(child => child.sponsorId === p.id);

    const indentX = margin + (depth * 7);
    const rowWidth = pageWidth - margin - indentX;

    if (depth === 0) {
      doc.setFillColor(254, 243, 199);
      doc.setDrawColor(245, 158, 11);
    } else if (depth === 1) {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
    } else {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
    }

    doc.roundedRect(indentX, currentY, rowWidth, 6.8, 1, 1, 'FD');

    doc.setFont('courier', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    const prefix = depth === 0 ? '👑 [TÊTE]' : depth === 1 ? '├── [Niv 1]' : '    └── [Niv 2]';
    doc.text(prefix, indentX + 1.5, currentY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    const nameStr = `${p.code} - ${p.firstName} ${p.lastName}`;
    doc.text(nameStr, indentX + 22, currentY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(194, 65, 12);
    doc.text(`Carte : ${card}`, indentX + 72, currentY + 4.5);

    doc.setTextColor(qual === 'Qualifié' ? 4 : 180, qual === 'Qualifié' ? 120 : 60, qual === 'Qualifié' ? 87 : 60);
    doc.text(`[${qual}]`, indentX + 96, currentY + 4.5);

    doc.setFont('courier', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text(`${p.totalPv} PV (Placés: ${p.placedPv} / Rest: ${p.remainingPv})`, pageWidth - margin - 2, currentY + 4.5, { align: 'right' });

    currentY += 8;

    directDownlines.forEach(child => {
      renderNode(child, depth + 1);
    });
  };

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
  const compName = companySettings?.name || 'WHIEDA MEYOMESSALA';
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
  doc.text('Whieda Meyomessala Akwa Douala', margin + 4, currentY + 12);

  doc.setLineDashPattern([], 0);
  doc.text('Fiche certifiée conforme aux registres MLM.', pageWidth - margin, currentY + 7, { align: 'right' });
  doc.text('Délivrée pour servir et valoir ce que de droit.', pageWidth - margin, currentY + 12, { align: 'right' });

  doc.save(`Fiche_Partenaire_${partner.code}.pdf`);
};

// ============================================================================
// 4. RÉCAPITULATIF DES PATIENTS & CLIENTS REÇUS (FORMAT PAYSAGE A4)
// ============================================================================
export const generatePatientsVisitsReportPDF = (
  visits: Visit[],
  month: string,
  year: string,
  companySettings?: CompanySettings
): void => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210mm
  const margin = 14;
  let currentY = 14;

  const monthNames: Record<string, string> = {
    '01': 'Janvier',
    '02': 'Février',
    '03': 'Mars',
    '04': 'Avril',
    '05': 'Mai',
    '06': 'Juin',
    '07': 'Juillet',
    '08': 'Août',
    '09': 'Septembre',
    '10': 'Octobre',
    '11': 'Novembre',
    '12': 'Décembre',
    'all': 'Année Complète',
  };

  const periodLabel = month === 'all' 
    ? `Exercice Annuel ${year}` 
    : `Mois de ${monthNames[month] || month} ${year}`;

  // Top Accent Bar
  doc.setFillColor(220, 38, 38);
  doc.rect(margin, currentY, pageWidth - (margin * 2), 2.5, 'F');
  currentY += 7;

  // Header Title & Brand
  const compName = companySettings?.name || 'WHIEDA MEYOMESSALA';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(220, 38, 38);
  doc.text(compName, margin, currentY);

  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('RÉCAPITULATIF OFFICIEL DES PATIENTS & CLIENTS REÇUS', pageWidth - margin, currentY, { align: 'right' });
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Registre d\'Accueil, Traçabilité des Soins & Rattachement Parrainage MLM', margin, currentY);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(234, 88, 12);
  doc.text(`Période sélectionnée : ${periodLabel}`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 7;

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5;

  // Synthesis Cards (Total, Services, Parrains)
  const totalReceived = visits.length;
  const countAchat = visits.filter(v => v.purpose?.toLowerCase().includes('achat')).length;
  const countMassage = visits.filter(v => v.purpose?.toLowerCase().includes('massage')).length;
  const countBilan = visits.filter(v => v.purpose?.toLowerCase().includes('bilan') || v.purpose?.toLowerCase().includes('consultation')).length;
  const countFormation = visits.filter(v => v.purpose?.toLowerCase().includes('formation')).length;
  const countVisite = visits.filter(v => v.purpose?.toLowerCase().includes('visite')).length;
  const countWithSponsor = visits.filter(v => !!v.sponsorPartnerName).length;

  const cardW = (pageWidth - (margin * 2) - 8) / 3;
  const cardH = 20;

  // Card 1
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, cardW, cardH, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, cardW, cardH, 2, 2, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL VISITEURS REÇUS', margin + 3.5, currentY + 5);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`${totalReceived} personnes`, margin + 3.5, currentY + 12);
  doc.setFontSize(7.5);
  doc.setTextColor(16, 185, 129);
  doc.text(`${countWithSponsor} rattachés à un Parrain MLM (${totalReceived > 0 ? ((countWithSponsor / totalReceived) * 100).toFixed(0) : 0}%)`, margin + 3.5, currentY + 17);

  // Card 2
  const card2X = margin + cardW + 4;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(card2X, currentY, cardW, cardH, 2, 2, 'F');
  doc.roundedRect(card2X, currentY, cardW, cardH, 2, 2, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('RÉPARTITION DES SERVICES', card2X + 3.5, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`• Bilan de santé : ${countBilan}   • Massage : ${countMassage}`, card2X + 3.5, currentY + 11);
  doc.text(`• Achat produit : ${countAchat}   • Formation / Visite : ${countFormation + countVisite}`, card2X + 3.5, currentY + 16);

  // Card 3
  const card3X = card2X + cardW + 4;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(card3X, currentY, cardW, cardH, 2, 2, 'F');
  doc.roundedRect(card3X, currentY, cardW, cardH, 2, 2, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('CONFORMITÉ & VALIDATION ACCUEIL', card3X + 3.5, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Édité le ${new Date().toLocaleDateString('fr-FR')} par le Secrétariat Accueil`, card3X + 3.5, currentY + 11);
  doc.text('Certifié conforme aux registres physiques et numériques', card3X + 3.5, currentY + 16);

  currentY += cardH + 6;

  // Table Columns
  const cols = [
    { header: 'N°', x: margin + 2, w: 10, align: 'left' },
    { header: 'Date & Heure', x: margin + 12, w: 32, align: 'left' },
    { header: 'Nom & Prénom Visiteur', x: margin + 44, w: 52, align: 'left' },
    { header: 'Téléphone', x: margin + 96, w: 32, align: 'left' },
    { header: 'Adresse / Quartier', x: margin + 128, w: 42, align: 'left' },
    { header: 'Service Sollicité', x: margin + 170, w: 44, align: 'left' },
    { header: 'Parrain Up (MLM)', x: margin + 214, w: 40, align: 'left' },
    { header: 'Statut', x: pageWidth - margin - 2, w: 15, align: 'right' },
  ];

  // Header row
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
    } else {
      doc.text(col.header, col.x, currentY + 4.5);
    }
  });

  currentY += 6.5;

  if (visits.length === 0) {
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, currentY, pageWidth - (margin * 2), 12, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Aucun patient ou visiteur enregistré pour cette période.', pageWidth / 2, currentY + 7.5, { align: 'center' });
    currentY += 14;
  } else {
    visits.forEach((v, idx) => {
      if (currentY > pageHeight - 20) {
        doc.addPage();
        currentY = 15;

        // Re-draw table header
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, currentY, pageWidth - (margin * 2), 6.5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(51, 65, 85);
        cols.forEach(col => {
          if (col.align === 'right') {
            doc.text(col.header, col.x, currentY + 4.5, { align: 'right' });
          } else {
            doc.text(col.header, col.x, currentY + 4.5);
          }
        });
        currentY += 6.5;
      }

      const isEven = idx % 2 === 0;
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.rect(margin, currentY, pageWidth - (margin * 2), 6.2, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(String(idx + 1), cols[0].x, currentY + 4.3);

      doc.setFont('courier', 'normal');
      doc.text(`${v.date} ${v.time}`, cols[1].x, currentY + 4.3);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      const name = v.visitorName.length > 28 ? v.visitorName.slice(0, 26) + '...' : v.visitorName;
      doc.text(name, cols[2].x, currentY + 4.3);

      doc.setFont('courier', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(v.visitorPhone || '---', cols[3].x, currentY + 4.3);

      doc.setFont('helvetica', 'normal');
      const address = (v.visitorAddress || 'Douala').length > 22 ? (v.visitorAddress || 'Douala').slice(0, 20) + '...' : (v.visitorAddress || 'Douala');
      doc.text(address, cols[4].x, currentY + 4.3);

      // Service sollicite
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(234, 88, 12);
      const service = (v.requestedService || v.purpose).length > 24 ? (v.requestedService || v.purpose).slice(0, 22) + '...' : (v.requestedService || v.purpose);
      doc.text(service, cols[5].x, currentY + 4.3);

      // Parrain Up
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const sponsorStr = v.sponsorPartnerName ? `${v.sponsorPartnerName} (${v.sponsorPartnerCode || ''})` : 'Interne';
      const truncatedSponsor = sponsorStr.length > 24 ? sponsorStr.slice(0, 22) + '...' : sponsorStr;
      doc.text(truncatedSponsor, cols[6].x, currentY + 4.3);

      // Statut
      const statusLabel = v.status === 'termine' ? 'Terminé' : v.status === 'en_consultation' ? 'En cours' : 'En attente';
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(v.status === 'termine' ? 16 : v.status === 'en_consultation' ? 234 : 100, v.status === 'termine' ? 185 : v.status === 'en_consultation' ? 88 : 116, v.status === 'termine' ? 129 : v.status === 'en_consultation' ? 12 : 139);
      doc.text(statusLabel, cols[7].x, currentY + 4.3, { align: 'right' });

      doc.setDrawColor(241, 245, 249);
      doc.line(margin, currentY + 6.2, pageWidth - margin, currentY + 6.2);
      currentY += 6.2;
    });
  }

  currentY += 8;

  // Signatures on Bottom
  if (currentY > pageHeight - 25) {
    doc.addPage();
    currentY = 20;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Le Responsable Accueil & Réception', margin + 15, currentY);
  doc.text('La Direction Générale Whieda Meyomessala', pageWidth - margin - 75, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('[Visa & Cachet du Poste d\'Accueil]', margin + 15, currentY + 5);
  doc.text('[Visa & Cachet Officiel]', pageWidth - margin - 75, currentY + 5);

  const cleanMonth = month.padStart(2, '0');
  doc.save(`Recapitulatif_Patients_Whieda_${year}_${cleanMonth}.pdf`);
};

export const generatePartnerPayoutsReportPDF = (
  payouts: PartnerPayoutRecord[],
  companySettings?: CompanySettings
): void => {
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
  doc.setFillColor(234, 88, 12); // Orange-600
  doc.rect(margin, currentY, pageWidth - (margin * 2), 2.5, 'F');
  currentY += 7;

  // Company Information & Document Title
  const compName = companySettings?.name || 'WHIEDA MEYOMESSALA';
  const compTagline = companySettings?.tagline || 'Cabinet de Santé, Pharmacie Naturelle & Prospérité Partagée';
  const compAddress = companySettings?.address || 'Boulevard de la Liberté, Face Ancien Cinéma Le Wouri, Akwa - Douala';
  const compPhone = companySettings?.phone || '(+237) 699 00 11 22';

  // Company Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(220, 38, 38);
  doc.text(compName, margin, currentY);

  // Document Title
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('SUIVI DES PAIEMENTS DES PARTENAIRES & PV', pageWidth - margin, currentY, { align: 'right' });
  currentY += 5;

  // Subtitles
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(compTagline, margin, currentY);

  const todayStr = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Édité le : ${todayStr}`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 4;

  doc.text(`${compAddress} | Tél: ${compPhone}`, margin, currentY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(234, 88, 12);
  doc.text('DOCUMENT OFFICIEL DE TRÉSORERIE & MLM', pageWidth - margin, currentY, { align: 'right' });
  currentY += 6;

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5;

  // Summary Metrics Banner
  const totalAmountPaid = payouts.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const totalPvPlaced = payouts.reduce((sum, p) => sum + (p.pvPlaced || 0), 0);
  const totalCount = payouts.length;

  const boxW = (pageWidth - (margin * 2) - 8) / 3;
  const boxH = 15;

  // Box 1: Total Montant Payé
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(margin, currentY, boxW, boxH, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 64, 175);
  doc.text('TOTAL MONTANT PAYÉ AUX PARTENAIRES', margin + 4, currentY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(formatMoney(totalAmountPaid), margin + 4, currentY + 11.5);

  // Box 2: Total PV Placés
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(margin + boxW + 4, currentY, boxW, boxH, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14);
  doc.text('TOTAL POINTS DE VALEUR (PV) PLACÉS', margin + boxW + 8, currentY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(formatPV(totalPvPlaced), margin + boxW + 8, currentY + 11.5);

  // Box 3: Nombre de versements
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin + (boxW * 2) + 8, currentY, boxW, boxH, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(22, 101, 52);
  doc.text('NOMBRE TOTAL DE PAIEMENTS ENREGISTRÉS', margin + (boxW * 2) + 12, currentY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`${totalCount} versement${totalCount > 1 ? 's' : ''}`, margin + (boxW * 2) + 12, currentY + 11.5);

  currentY += boxH + 6;

  // Table Columns Definition (Landscape 273mm printable width)
  const cols = [
    { label: 'N°', x: margin + 2, width: 12, align: 'left' },
    { label: 'Date', x: margin + 14, width: 24, align: 'left' },
    { label: 'Partenaire', x: margin + 38, width: 62, align: 'left' },
    { label: 'ID Partenaire', x: margin + 100, width: 32, align: 'left' },
    { label: 'Montant Payé (FCFA)', x: margin + 132, width: 42, align: 'right' },
    { label: 'PV Placés', x: margin + 174, width: 28, align: 'right' },
    { label: 'Mode / Réf.', x: margin + 204, width: 36, align: 'left' },
    { label: 'Enregistré par', x: margin + 242, width: 31, align: 'left' },
  ];

  // Header Table
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(margin, currentY, pageWidth - (margin * 2), 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  cols.forEach(col => {
    if (col.align === 'right') {
      doc.text(col.label, col.x + col.width, currentY + 4.8, { align: 'right' });
    } else {
      doc.text(col.label, col.x, currentY + 4.8);
    }
  });

  currentY += 7;

  // Rows
  if (payouts.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Aucun versement partenaire enregistré pour le moment.', pageWidth / 2, currentY + 12, { align: 'center' });
    currentY += 20;
  } else {
    payouts.forEach((p, idx) => {
      // Page break check
      if (currentY > pageHeight - 32) {
        doc.addPage();
        currentY = 15;

        // Re-print header
        doc.setFillColor(30, 41, 59);
        doc.rect(margin, currentY, pageWidth - (margin * 2), 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);
        cols.forEach(col => {
          if (col.align === 'right') {
            doc.text(col.label, col.x + col.width, currentY + 4.8, { align: 'right' });
          } else {
            doc.text(col.label, col.x, currentY + 4.8);
          }
        });
        currentY += 7;
      }

      // Alternating background
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, currentY, pageWidth - (margin * 2), 6.5, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);

      // N°
      doc.text(String(idx + 1), cols[0].x, currentY + 4.5);

      // Date
      doc.text(p.date, cols[1].x, currentY + 4.5);

      // Nom Partenaire
      doc.setFont('helvetica', 'bold');
      const truncatedName = p.partnerName.length > 28 ? p.partnerName.slice(0, 26) + '...' : p.partnerName;
      doc.text(truncatedName, cols[2].x, currentY + 4.5);

      // ID Partenaire
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(234, 88, 12);
      doc.text(p.partnerCode || p.partnerId, cols[3].x, currentY + 4.5);

      // Montant Payé
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129); // Green-600
      doc.text(formatMoney(p.amountPaid), cols[4].x + cols[4].width, currentY + 4.5, { align: 'right' });

      // PV Placés
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(217, 119, 6); // Amber-600
      doc.text(formatPV(p.pvPlaced), cols[5].x + cols[5].width, currentY + 4.5, { align: 'right' });

      // Mode / Réf
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const methodLabel = p.paymentMethod === 'orange_money' ? 'Orange Money'
        : p.paymentMethod === 'mtn_momo' ? 'MTN MoMo'
        : p.paymentMethod === 'especes' ? 'Espèces'
        : p.paymentMethod === 'carte' ? 'Carte Bancaire'
        : (p.paymentMethod || 'Virement');
      const refStr = p.reference ? ` (${p.reference.slice(-8)})` : '';
      const modeText = `${methodLabel}${refStr}`;
      doc.text(modeText.length > 18 ? modeText.slice(0, 16) + '..' : modeText, cols[6].x, currentY + 4.5);

      // Enregistré par
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const truncatedBy = (p.recordedBy || 'Direction').length > 18 ? (p.recordedBy || 'Direction').slice(0, 16) + '..' : (p.recordedBy || 'Direction');
      doc.text(truncatedBy, cols[7].x, currentY + 4.5);

      // Bottom Row Border
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, currentY + 6.5, pageWidth - margin, currentY + 6.5);
      currentY += 6.5;
    });
  }

  // Total summary footer row
  if (payouts.length > 0) {
    currentY += 2;
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, currentY, pageWidth - (margin * 2), 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text('TOTAL CUMULÉ DES VERSEMENTS :', margin + 4, currentY + 4.8);
    doc.setTextColor(16, 185, 129);
    doc.text(formatMoney(totalAmountPaid), cols[4].x + cols[4].width, currentY + 4.8, { align: 'right' });
    doc.setTextColor(217, 119, 6);
    doc.text(formatPV(totalPvPlaced), cols[5].x + cols[5].width, currentY + 4.8, { align: 'right' });
    currentY += 10;
  }

  // Signatures on Bottom
  if (currentY > pageHeight - 25) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Le Responsable de Trésorerie & Comptabilité', margin + 25, currentY);
  doc.text('La Direction Générale Whieda Meyomessala', pageWidth - margin - 85, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('[Visa & Mention Bon Pour Paiement]', margin + 25, currentY + 5);
  doc.text('[Visa, Cachet & Approbation]', pageWidth - margin - 85, currentY + 5);

  const nowFile = new Date().toISOString().split('T')[0];
  doc.save(`Etat_Paiements_Partenaires_Whieda_${nowFile}.pdf`);
};

