import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculationInput, DetailedCostBreakdown, TariffPlan } from './types';
import { DEFAULT_TARIFFS } from './tariffs';
import { formatCurrency } from './calculator';

export interface PdfReportOptions {
  input: CalculationInput;
  breakdown: DetailedCostBreakdown;
  calculationId?: string;
  generatedDate?: string;
  notes?: string;
}

function formatPdfAmount(amount: number, allowDecimals: boolean = false): string {
  const val = Math.max(0, amount);
  const formatted = allowDecimals
    ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : Math.round(val).toLocaleString('en-US');
  return `Tk. ${formatted}`;
}

export function generateElectricBillPdf(options: PdfReportOptions): jsPDF {
  const { input, breakdown, notes } = options;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const tariff: TariffPlan =
    input.customTariff ||
    DEFAULT_TARIFFS.find((t) => t.id === input.selectedTariffId) ||
    DEFAULT_TARIFFS[0];

  const calcId = options.calculationId || `EBC-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = options.generatedDate || new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // --- Theme Colors ---
  const primaryColor: [number, number, number] = [37, 99, 235]; // Blue 600
  const darkColor: [number, number, number] = [15, 23, 42]; // Slate 900
  const slateMuted: [number, number, number] = [100, 116, 139]; // Slate 500
  const lightBg: [number, number, number] = [248, 250, 252]; // Slate 50

  // 1. Header Banner
  doc.setFillColor(...darkColor);
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('EBC • BANGLADESH ELECTRICITY BILL REPORT', 14, 14);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('BERC Tariff Schedule & Utility Consumption Audit', 14, 20);

  doc.setTextColor(255, 255, 255);
  doc.text(`STATEMENT #: ${calcId}`, 196, 11, { align: 'right' });
  doc.setTextColor(148, 163, 184);
  doc.text(`DATE: ${dateStr}`, 196, 17, { align: 'right' });
  doc.text(`PERIOD: ${input.billingDays || 30} Days`, 196, 23, { align: 'right' });

  // 2. Customer & Utility Info Box
  let yPos = 33;
  doc.setFillColor(...lightBg);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, yPos, 182, 28, 2, 2, 'FD');

  doc.setTextColor(...darkColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('ACCOUNT / PREMISES SUMMARY', 18, yPos + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...slateMuted);
  doc.text(`Account Holder: ${input.customerName || 'Residential Consumer'}`, 18, yPos + 14);
  doc.text(`Account / Meter ID: ${input.accountNumber || 'DESCO-LT-409281'}`, 18, yPos + 20);
  doc.text(`Service Address: ${input.address || 'Dhaka, Bangladesh'}`, 18, yPos + 25);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('TARIFF & SANCTIONED LOAD', 110, yPos + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateMuted);
  doc.text(`Plan: ${tariff.name}`, 110, yPos + 13);
  doc.text(`Sanctioned Load: ${breakdown.sanctionLoadKw || input.sanctionLoadKw || 2} kW · Demand: ${formatPdfAmount(breakdown.demandChargeRatePerKw)}/kW`, 110, yPos + 19);
  doc.text(`Net Consumption: ${Math.round(breakdown.netBilledKwh).toLocaleString()} Units (kWh)`, 110, yPos + 25);

  // 3. Highlighted Bill Summary Cards
  yPos = 66;
  const cardWidth = 43;
  const cardGap = 3.3;

  const cards = [
    { label: 'TOTAL ESTIMATED BILL', val: formatPdfAmount(breakdown.totalBill), highlight: true },
    { label: 'GROSS UNITS (KWH)', val: `${Math.round(breakdown.grossConsumptionKwh).toLocaleString()} Units`, highlight: false },
    { label: 'EFFECTIVE RATE', val: `${formatPdfAmount(breakdown.effectiveRatePerKwh)}/Unit`, highlight: false },
    { label: 'ANNUAL PROJECTION', val: formatPdfAmount(breakdown.annualProjectedCost), highlight: false },
  ];

  cards.forEach((card, idx) => {
    const x = 14 + idx * (cardWidth + cardGap);
    if (card.highlight) {
      doc.setFillColor(239, 246, 255); // blue-50
      doc.setDrawColor(59, 130, 246); // blue-500
    } else {
      doc.setFillColor(...lightBg);
      doc.setDrawColor(226, 232, 240);
    }
    doc.roundedRect(x, yPos, cardWidth, 20, 2, 2, 'FD');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(card.highlight ? 37 : 71, card.highlight ? 99 : 85, card.highlight ? 235 : 105);
    doc.text(card.label, x + cardWidth / 2, yPos + 6, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text(card.val, x + cardWidth / 2, yPos + 14.5, { align: 'center' });
  });

  // 4. Itemized Charges Table
  yPos = 91;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('Itemized Utility Bill Breakdown (Taka / BDT)', 14, yPos);

  const tableRows: Array<[string, string, string, string]> = [
    [
      'Fixed Meter Rent & Connection Fee',
      'Standard monthly meter availability fee',
      `${input.billingDays || 30} Days`,
      formatPdfAmount(breakdown.fixedCustomerCharge),
    ],
  ];

  if (breakdown.demandCharge > 0) {
    tableRows.push([
      'Sanctioned Load Demand Charge (ডিমান্ড চার্জ)',
      `${breakdown.sanctionLoadKw} kW sanctioned load @ ${formatPdfAmount(breakdown.demandChargeRatePerKw, true)}/kW/month`,
      `${breakdown.sanctionLoadKw} kW`,
      formatPdfAmount(breakdown.demandCharge),
    ]);
  }

  // Tiered lines
  if (breakdown.tierBreakdowns && breakdown.tierBreakdowns.length > 0) {
    breakdown.tierBreakdowns.forEach((tb) => {
      tableRows.push([
        `Energy Charge - ${tb.tierName}`,
        `${Math.round(tb.kwhInTier)} Units @ ${formatPdfAmount(tb.ratePerKwh, true)}/Unit`,
        `${Math.round(tb.kwhInTier)} Units`,
        formatPdfAmount(tb.cost),
      ]);
    });
  } else if (breakdown.touCharges) {
    tableRows.push([
      'Energy Charge - Peak Hours (5 PM - 11 PM)',
      `${Math.round(breakdown.touCharges.peakKwh)} Units @ Peak rate (${formatPdfAmount(tariff.peakRate || 14.61, true)}/Unit)`,
      `${Math.round(breakdown.touCharges.peakKwh)} Units`,
      formatPdfAmount(breakdown.touCharges.peakCost),
    ]);
    tableRows.push([
      'Energy Charge - Mid-Peak Hours',
      `${Math.round(breakdown.touCharges.midPeakKwh)} Units @ Mid-Peak rate (${formatPdfAmount(tariff.midPeakRate || 10.50, true)}/Unit)`,
      `${Math.round(breakdown.touCharges.midPeakKwh)} Units`,
      formatPdfAmount(breakdown.touCharges.midPeakCost),
    ]);
    tableRows.push([
      'Energy Charge - Off-Peak Hours (11 PM - 11 AM)',
      `${Math.round(breakdown.touCharges.offPeakKwh)} Units @ Off-Peak rate (${formatPdfAmount(tariff.offPeakRate || 8.50, true)}/Unit)`,
      `${Math.round(breakdown.touCharges.offPeakKwh)} Units`,
      formatPdfAmount(breakdown.touCharges.offPeakCost),
    ]);
  } else {
    tableRows.push([
      'Energy Supply Charge',
      `Flat rate supply: ${Math.round(breakdown.netBilledKwh)} Units @ ${formatPdfAmount(tariff.flatRate || 4.82, true)}/Unit`,
      `${Math.round(breakdown.netBilledKwh)} Units`,
      formatPdfAmount(breakdown.energyCharges),
    ]);
  }

  if (breakdown.solarCredit > 0) {
    tableRows.push([
      'Solar Net Metering Export Credit',
      `Exported ${Math.round(breakdown.solarExportedKwh)} Units @ ${formatPdfAmount(input.solar.feedInTariffPerKwh || 6.50, true)}/Unit`,
      `-${Math.round(breakdown.solarExportedKwh)} Units`,
      `-${formatPdfAmount(breakdown.solarCredit)}`,
    ]);
  }

  tableRows.push([
    'Government VAT (ভ্যাট)',
    `Bangladesh Government Electricity VAT (${tariff.taxPercent}%)`,
    `${tariff.taxPercent}%`,
    formatPdfAmount(breakdown.taxes),
  ]);

  autoTable(doc, {
    startY: yPos + 3,
    head: [['Charge Description', 'Basis / Rate Details', 'Usage', 'Amount (BDT)']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 62, fontStyle: 'bold' },
      1: { cellWidth: 70 },
      2: { cellWidth: 24, halign: 'right' },
      3: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
    },
    foot: [
      ['TOTAL ESTIMATED BILL DUE', '', `${Math.round(breakdown.netBilledKwh)} Units`, formatPdfAmount(breakdown.totalBill)],
    ],
    footStyles: {
      fillColor: [239, 246, 255],
      textColor: [37, 99, 235],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'right',
    },
  });

  // 5. Environmental & Carbon Section
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 200;
  
  doc.setFillColor(...lightBg);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, finalY + 6, 182, 28, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('ENVIRONMENTAL & CARBON FOOTPRINT IMPACT', 18, finalY + 13);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateMuted);
  doc.text(`Estimated Grid CO2 Emissions: ${Math.round(breakdown.carbonFootprintKg).toLocaleString()} kg CO2e / month`, 18, finalY + 20);
  doc.text(`Equivalent Forest Offset: ~${breakdown.equivalentTreesNeeded} mature trees required to neutralize annual footprint`, 18, finalY + 26);

  if (breakdown.solarGeneratedKwh > 0) {
    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'bold');
    doc.text(`Solar Clean Energy Generated: ${Math.round(breakdown.solarGeneratedKwh)} kWh (Offsetting ${Math.round(breakdown.solarGeneratedKwh * 0.386)} kg CO2e)`, 18, finalY + 31);
  }

  // 6. Footer Notes & Barcode visual
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(
    notes || 'This statement was generated by EBC Electric Bill Calculator for estimation and energy planning purposes.',
    14,
    285
  );
  doc.text('Page 1 of 1 • EBC Energy Intelligence Engine', 196, 285, { align: 'right' });

  return doc;
}

export function downloadElectricBillPdf(options: PdfReportOptions, filename?: string): void {
  const doc = generateElectricBillPdf(options);
  const name = filename || `EBC-Electric-Bill-Report-${options.input.customerName || 'Statement'}.pdf`;
  doc.save(name);
}
