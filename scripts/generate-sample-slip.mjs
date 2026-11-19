import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
});

// Company Header
doc.setFillColor(15, 23, 42); // #0f172a
doc.rect(0, 0, 210, 28, 'F');

doc.setTextColor(255, 255, 255);
doc.setFontSize(16);
doc.setFont('helvetica', 'bold');
doc.text('TECHFLOW SOLUTIONS PRIVATE LIMITED', 14, 12);

doc.setFontSize(8.5);
doc.setFont('helvetica', 'normal');
doc.setTextColor(148, 163, 184);
doc.text('CIN: U72200KA2021PTC145892 | Outer Ring Road, Bellandur, Bengaluru - 560103', 14, 18);
doc.text('PAYSLIP FOR THE MONTH OF OCTOBER 2024', 14, 23);

// Employee Details Grid
doc.setTextColor(15, 23, 42);
doc.setFontSize(9);
doc.setFont('helvetica', 'bold');
doc.text('Employee Information', 14, 35);

const empDetails = [
  ['Employee Name:', 'Rohan S. Deshmukh', 'Employee ID:', 'TF-89420'],
  ['Designation:', 'Senior Software Engineer', 'Department:', 'Platform Engineering'],
  ['Date of Joining:', '14-Jul-2021', 'Location:', 'Bengaluru (Metro)'],
  ['Bank Name:', 'HDFC Bank Ltd', 'Bank Account No:', '50100492817291'],
  ['PAN:', 'ABCDE1234F', 'UAN (PF No):', '101489201842'],
  ['PF Account No:', 'KN/BNG/0048192/000/001428', 'Days Paid / LOP:', '31 / 0'],
];

autoTable(doc, {
  startY: 38,
  body: empDetails,
  theme: 'plain',
  styles: { fontSize: 7.5, cellPadding: 1.5, textColor: [30, 41, 59] },
  columnStyles: {
    0: { fontStyle: 'bold', cellWidth: 32, textColor: [71, 85, 105] },
    1: { cellWidth: 60, fontStyle: 'bold' },
    2: { fontStyle: 'bold', cellWidth: 32, textColor: [71, 85, 105] },
    3: { cellWidth: 56, fontStyle: 'bold' },
  },
});

// Earnings & Deductions Table
// Monthly Values:
// Basic Salary: 55,000
// House Rent Allowance (HRA): 27,500
// Special Allowance: 32,000
// Leave Travel Allowance: 5,000
// Performance Bonus: 15,000
// Total Earnings / Gross: 1,34,500
//
// Deductions:
// Employee Provident Fund (PF): 6,600
// Employer Provident Fund (EPF): 6,600
// Professional Tax (PT): 200
// Income Tax (TDS): 8,500
// Total Deductions: 15,300

const financialTable = [
  ['Basic Salary', '55000', 'Employee Provident Fund (EPF)', '6600'],
  ['House Rent Allowance (HRA)', '27500', 'Professional Tax (PT)', '200'],
  ['Special Allowance', '32000', 'Income Tax (TDS)', '8500'],
  ['Leave Travel Allowance (LTA)', '5000', 'Employer PF Contribution', '6600'],
  ['Performance Bonus / Incentives', '15000', '', ''],
  ['Total Earnings (Gross Salary)', '134500', 'Total Deductions', '15300'],
];

autoTable(doc, {
  startY: 72,
  head: [['Earnings Component', 'Amount (INR)', 'Deductions Component', 'Amount (INR)']],
  body: financialTable,
  theme: 'grid',
  headStyles: {
    fillColor: [15, 23, 42],
    textColor: [255, 255, 255],
    fontStyle: 'bold',
    fontSize: 8,
    halign: 'left',
  },
  bodyStyles: {
    fontSize: 7.5,
    cellPadding: 2,
  },
  columnStyles: {
    0: { cellWidth: 60 },
    1: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
    2: { cellWidth: 60 },
    3: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
  },
  alternateRowStyles: {
    fillColor: [248, 250, 252],
  },
  didParseCell: (data) => {
    // Total Row bold & background
    if (data.row.index === 5) {
      data.cell.styles.fontStyle = 'bold';
      data.cell.styles.fillColor = [224, 231, 255]; // indigo-100
      data.cell.styles.textColor = [30, 27, 75];
    }
  },
});

// Net Pay Banner
const lastY = doc.lastAutoTable.finalY + 6;

doc.setFillColor(240, 253, 244); // emerald-50
doc.setDrawColor(34, 197, 94); // emerald-500
doc.roundedRect(14, lastY, 182, 16, 2, 2, 'FD');

doc.setFontSize(9);
doc.setFont('helvetica', 'bold');
doc.setTextColor(22, 101, 52); // emerald-800
doc.text('NET SALARY PAYABLE: INR 1,19,200', 20, lastY + 6);

doc.setFontSize(8);
doc.setFont('helvetica', 'normal');
doc.setTextColor(21, 128, 61);
doc.text('Amount in words: One Lakh Nineteen Thousand Two Hundred Rupees Only', 20, lastY + 11);

// Annualized Note for Verification
doc.setFontSize(7.5);
doc.setTextColor(100, 116, 139);
doc.text(
  'Note: This is a computer generated monthly payslip and requires no physical signature.',
  14,
  lastY + 24
);

// Write to public/sample-salary-slip.pdf
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const outputPath = path.join(publicDir, 'sample-salary-slip.pdf');
fs.writeFileSync(outputPath, Buffer.from(doc.output('arraybuffer')));
console.log('Saved sample salary slip PDF to:', outputPath);

// Also copy to root workspace so user can find it easily
const rootCopy = path.join(process.cwd(), 'sample-salary-slip.pdf');
fs.copyFileSync(outputPath, rootCopy);
console.log('Saved copy to workspace root:', rootCopy);
