import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TaxComparisonRecommendation } from '../tax/types';

export function generateTaxPDFReport(
  recommendation: TaxComparisonRecommendation,
  employeeName?: string,
  companyName?: string
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const { oldRegimeResult, newRegimeResult, recommendedRegime, taxSavings, monthlySavings } = recommendation;
  const fy = oldRegimeResult.financialYear;
  const ay = fy === '2025-2026' ? '2026-2027' : fy === '2024-2025' ? '2025-2026' : '2024-2025';

  // Header Banner
  doc.setFillColor(15, 23, 42); // Deep Navy (#0f172a)
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SALCAL', 14, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('Smart Tax Regime Advisor & Salary Analyzer', 14, 23);
  doc.text(`Financial Year: ${fy} | Assessment Year: ${ay}`, 14, 29);

  // Generation Date & User
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 150, 16);
  if (employeeName) {
    doc.text(`Employee: ${employeeName}`, 150, 22);
  }
  if (companyName) {
    doc.text(`Company: ${companyName}`, 150, 28);
  }

  // Recommendation Card
  let recFillColor: [number, number, number] = [236, 253, 245]; // Emerald 50
  let recTextColor: [number, number, number] = [6, 95, 70]; // Emerald 800
  let recBorderColor: [number, number, number] = [16, 185, 129]; // Emerald 500
  let recTitle = 'RECOMMENDED: OLD TAX REGIME';

  if (recommendedRegime === 'NEW') {
    recTitle = 'RECOMMENDED: NEW TAX REGIME (Section 115BAC)';
  } else if (recommendedRegime === 'EQUAL') {
    recFillColor = [241, 245, 249];
    recTextColor = [30, 41, 59];
    recBorderColor = [148, 163, 184];
    recTitle = 'BOTH REGIMES HAVE EQUAL TAX LIABILITY';
  }

  doc.setFillColor(...recFillColor);
  doc.setDrawColor(...recBorderColor);
  doc.roundedRect(14, 42, 182, 28, 3, 3, 'FD');

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...recTextColor);
  doc.text(recTitle, 20, 52);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  if (taxSavings > 0) {
    doc.text(
      `Estimated Annual Tax Savings: Rs. ${taxSavings.toLocaleString('en-IN')} (approx. Rs. ${monthlySavings.toLocaleString('en-IN')}/month)`,
      20,
      60
    );
  } else {
    doc.text('Both regimes calculate the same tax liability. You may opt for the New Regime for simpler compliance.', 20, 60);
  }

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Old Regime Tax: Rs. ${oldRegimeResult.finalTaxLiability.toLocaleString('en-IN')}   |   New Regime Tax: Rs. ${newRegimeResult.finalTaxLiability.toLocaleString('en-IN')}`,
    20,
    66
  );

  // Table Data
  const formatRs = (val: number) => `Rs. ${val.toLocaleString('en-IN')}`;

  const tableBody = [
    ['Gross Salary Income', formatRs(oldRegimeResult.grossSalary), formatRs(newRegimeResult.grossSalary)],
    ['Less: HRA Exemption u/s 10(13A)', formatRs(oldRegimeResult.exemptions.hraExemption), 'Rs. 0 (Not Allowed)'],
    ['Less: Standard Deduction u/s 16(ia)', formatRs(oldRegimeResult.exemptions.standardDeduction), formatRs(newRegimeResult.exemptions.standardDeduction)],
    ['Less: Professional Tax u/s 16(iii)', formatRs(oldRegimeResult.exemptions.professionalTax), 'Rs. 0 (Not Allowed)'],
    ['Add: Other Income (Interest, etc.)', formatRs(oldRegimeResult.otherIncomeTotal), formatRs(newRegimeResult.otherIncomeTotal)],
    ['Gross Total Income (GTI)', formatRs(oldRegimeResult.grossTotalIncome), formatRs(newRegimeResult.grossTotalIncome)],
    ['Less: Section 80C Deductions (PF, PPF, etc.)', formatRs(oldRegimeResult.deductions.section80C), 'Rs. 0 (Not Allowed)'],
    ['Less: Section 80D Health Insurance', formatRs(oldRegimeResult.deductions.section80D), 'Rs. 0 (Not Allowed)'],
    ['Less: Section 80CCD(1B) Self NPS', formatRs(oldRegimeResult.deductions.section80CCD1B), 'Rs. 0 (Not Allowed)'],
    ['Less: Section 80CCD(2) Employer NPS', formatRs(oldRegimeResult.deductions.section80CCD2), formatRs(newRegimeResult.deductions.section80CCD2)],
    ['Less: Section 24(b) Home Loan Interest', formatRs(oldRegimeResult.deductions.section24b), 'Rs. 0 (Not Allowed)'],
    ['Less: Other Eligible Deductions', formatRs(oldRegimeResult.deductions.otherDeductions + oldRegimeResult.deductions.section80E), 'Rs. 0 (Not Allowed)'],
    ['Total Chapter VI-A Deductions', formatRs(oldRegimeResult.deductions.totalDeductions), formatRs(newRegimeResult.deductions.totalDeductions)],
    ['Net Taxable Income', formatRs(oldRegimeResult.taxableIncome), formatRs(newRegimeResult.taxableIncome)],
    ['Tax on Taxable Income (Before Rebate)', formatRs(oldRegimeResult.taxBeforeRebate), formatRs(newRegimeResult.taxBeforeRebate)],
    ['Less: Rebate u/s 87A & Marginal Relief', formatRs(oldRegimeResult.rebate87A), formatRs(newRegimeResult.rebate87A + newRegimeResult.marginalRelief)],
    ['Tax Payable After Rebate', formatRs(oldRegimeResult.taxAfterRebate), formatRs(newRegimeResult.taxAfterRebate)],
    ['Add: Surcharge', formatRs(oldRegimeResult.surcharge), formatRs(newRegimeResult.surcharge)],
    ['Add: Health & Education Cess (4%)', formatRs(oldRegimeResult.cess), formatRs(newRegimeResult.cess)],
    ['Final Estimated Tax Liability', formatRs(oldRegimeResult.finalTaxLiability), formatRs(newRegimeResult.finalTaxLiability)],
    ['Estimated Monthly Tax Burden (TDS)', formatRs(oldRegimeResult.monthlyTaxLiability), formatRs(newRegimeResult.monthlyTaxLiability)],
    ['Effective Tax Rate (%)', `${oldRegimeResult.effectiveTaxRate}%`, `${newRegimeResult.effectiveTaxRate}%`],
  ];

  autoTable(doc, {
    startY: 76,
    head: [['Particulars', 'Old Tax Regime', 'New Tax Regime']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 92, fontSize: 8 },
      1: { cellWidth: 45, halign: 'right', fontSize: 8 },
      2: { cellWidth: 45, halign: 'right', fontSize: 8 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    // Highlight Final Tax row
    didParseCell: (data) => {
      if (data.row.index === 19) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [220, 252, 231]; // emerald 100
        data.cell.styles.textColor = [6, 78, 59];
      }
      if (data.row.index === 13) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // Footer Disclaimer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Disclaimer: This report is generated by TaxWise for educational and planning estimates based on Indian Income Tax provisions. Consult a qualified CA for official filing.',
    14,
    pageHeight - 8
  );

  return doc;
}
