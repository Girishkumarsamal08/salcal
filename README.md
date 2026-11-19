# TaxWise – Smart Indian Income Tax Regime Recommendation Portal

> An intelligent, production-quality salary-based tax recommendation portal for Indian salaried employees. Extract salary components from salary slips (PDF/Images) or enter data manually, compare tax liabilities under the Old and New Tax Regimes with full statutory accuracy (Finance Act 2024 / FY 2024-25 & FY 2023-24), and receive actionable mathematical recommendations.

---

## 🚀 Live Demo & Deployment

- **GitHub Repository**: [https://github.com/Girishkumarsamal08/salcal](https://github.com/Girishkumarsamal08/salcal)
- **Framework**: Next.js 16 (App Router) + TypeScript + Tailwind CSS

---

## 📌 Executive Summary

Salaried employees in India often face confusion when selecting between the **Old Tax Regime** and the **New Tax Regime (Section 115BAC)** during company declaration windows and year-end tax filing. Many default to the New Tax Regime without evaluating whether their HRA, 80C investments, health insurance (80D), or home loan interest (24b) would save them more under the Old Regime.

**TaxWise** solves this by:
1. **Automated Salary Parsing**: In-browser OCR (Tesseract.js) and server-side PDF parsing to extract Basic Pay, HRA, Special Allowances, PF, PT, and Bonus without storing documents.
2. **Deterministic Financial Engine**: Independent calculators for Old and New Regimes implementing official Indian Income Tax rules, including Finance Act 2024 changes (enhanced ₹75,000 standard deduction and revised slabs).
3. **Smart Recommendation**: Delivers a clear verdict (`OLD REGIME RECOMMENDED`, `NEW REGIME RECOMMENDED`, or `EQUAL`) backed by an itemized mathematical audit of why that regime won and the exact break-even deductions threshold.
4. **Exportable Audit Report**: One-click branded PDF comparison report generation and printable ledger.

---

## 🏛️ Architecture & Clean Architecture Separation

The project strictly follows clean architectural separation:

```
src/
├── app/
│   ├── api/
│   │   └── extract-salary/       # Document processing API endpoint
│   ├── globals.css               # Design system & print stylesheets
│   ├── layout.tsx                # App root layout & SEO metadata
│   └── page.tsx                  # Interactive multi-step SPA workflow
├── components/
│   ├── ComparisonDashboard.tsx   # Recommendation hero, top metrics & report export
│   ├── ComparisonTable.tsx       # Side-by-side ledger table (Old vs New)
│   ├── DeductionsForm.tsx        # Chapter VI-A investments & live HRA calculator
│   ├── LandingHero.tsx           # Fintech landing page & sample profile loader
│   ├── Navbar.tsx                # Brand header, FY switcher & demo menu
│   ├── SalaryReviewForm.tsx      # Editable salary review with monthly/annual toggle
│   ├── SalaryUpload.tsx          # Drag-and-drop dropzone (PDF & Image OCR)
│   └── VisualCharts.tsx          # Recharts visualizations (bar charts & donut)
└── lib/
    ├── demo-data.ts              # Pre-configured salary profiles (5L, 10.5L, 15L, 18L)
    ├── extraction/
    │   ├── ocr-service.ts        # Client-side Tesseract.js OCR engine
    │   └── salary-extractor.ts   # Regex & heuristics pattern matcher for Indian pay slips
    ├── reports/
    │   └── pdf-report.ts         # jsPDF + AutoTable comparison report generator
    ├── tax/
    │   ├── __tests__/            # Comprehensive Vitest unit test suite
    │   ├── epf-intelligence.ts   # 80C capping & Section 17(2)(vii) employer PF rules
    │   ├── hra-intelligence.ts   # Section 10(13A) Rule 2A 3-condition calculator
    │   ├── new-regime.ts         # Section 115BAC calculator (Budget 2024 revised)
    │   ├── old-regime.ts         # Traditional tax calculator with Chapter VI-A
    │   ├── recommendation-engine.ts # Differential analysis & break-even logic
    │   ├── tax-rules.ts          # Configurable tax slabs and statutory limits
    │   └── types.ts              # Strongly-typed financial data structures
    └── utils.ts                  # Currency formatting (INR) & class merger
```

---

## ⚖️ Indian Income Tax Methodology

### 1. New Tax Regime (Section 115BAC) – FY 2024-25 (AY 2025-26)
*Incorporating Finance Act (Budget 2024) updates:*

| Taxable Income Slab | Applicable Tax Rate |
| :--- | :--- |
| **Up to ₹3,00,000** | Nil (0%) |
| **₹3,00,001 to ₹7,00,000** | 5% |
| **₹7,00,001 to ₹10,00,000** | 10% |
| **₹10,00,001 to ₹12,00,000** | 15% |
| **₹12,00,001 to ₹15,00,000** | 20% |
| **Above ₹15,00,000** | 30% |

- **Standard Deduction**: ₹75,000 for salaried employees (increased from ₹50,000 in Budget 2024).
- **Section 87A Rebate**: If taxable income ≤ ₹7,00,000, 100% tax rebate applies (zero tax liability).
- **Section 87A Marginal Relief**: For taxable income slightly exceeding ₹7,00,000, tax payable cannot exceed `(Taxable Income - ₹7,00,000)`.
- **Allowed Deductions**: Standard Deduction (₹75,000) and Employer NPS contribution under Section 80CCD(2) up to 14% of Basic Salary. All other deductions (80C, 80D, HRA, 24b) are disallowed.

---

### 2. Old Tax Regime – FY 2024-25 & FY 2023-24

| Taxable Income Slab | Applicable Tax Rate |
| :--- | :--- |
| **Up to ₹2,50,000** | Nil (0%) |
| **₹2,50,001 to ₹5,00,000** | 5% |
| **₹5,00,001 to ₹10,00,000** | 20% |
| **Above ₹10,00,000** | 30% |

- **Standard Deduction**: ₹50,000 (Section 16(ia)).
- **Professional Tax**: Section 16(iii) fully deductible (typically up to ₹2,500).
- **Section 87A Rebate**: Full rebate if taxable income ≤ ₹5,00,000 (tax liability = ₹0).
- **Eligible Deductions & Exemptions**:
  - **HRA Exemption u/s 10(13A)**: Minimum of (1) Actual HRA received, (2) 50% of Basic (Metro: Delhi, Mumbai, Kolkata, Chennai) or 40% (Non-Metro), (3) Rent paid minus 10% of Basic.
  - **Section 80C**: Employee EPF + PPF + ELSS + Life Insurance + Principal repayment capped at ₹1,50,000.
  - **Section 80D**: Health Insurance (Self/Family: ₹25,000 or ₹50,000 if Senior Citizen; Parents: ₹25,000 or ₹50,000 if Senior Citizen; Preventive checkup ₹5,000 included).
  - **Section 80CCD(1B)**: Additional voluntary NPS self-contribution up to ₹50,000.
  - **Section 24(b)**: Home loan interest deduction up to ₹2,00,000 for self-occupied property.
  - **Section 80E**: Higher education loan interest (unlimited).
  - **Section 80TTA**: Savings account interest deduction up to ₹10,000.
- **Health & Education Cess**: 4% applied on (Tax after rebate + Surcharge).

---

## 💡 EPF & HRA Intelligence

### EPF Intelligence
- **Employee EPF**: 12% of (Basic + DA) is automatically categorized under Section 80C. TaxWise prevents double-counting by combining Employee EPF with other user-declared 80C investments and strictly enforcing the statutory ₹1,50,000 ceiling.
- **Employer EPF**: Exempt under Section 17(2)(vii) up to a combined ₹7,50,000 annual limit across EPF, NPS, and Superannuation. Any excess is added as taxable perquisite.

### HRA Intelligence
- Accurately checks the 3 statutory conditions:
  $$\text{Exemption} = \min\Big(\text{Actual HRA},\, \text{City \%} \times \text{Basic},\, \text{Rent Paid} - 10\% \times \text{Basic}\Big)$$
- If rent paid is less than 10% of basic salary, exemption is correctly computed as ₹0.

---

## 🧪 Testing & Verification

Comprehensive unit tests verify calculation precision across tax slabs, rebate limits, marginal relief, and edge cases:

```bash
# Run the test suite
npm test
```

### Verified Test Scenarios:
1. **HRA Zero Rent**: Confirms ₹0 exemption and 100% taxable HRA when rent = 0.
2. **HRA Metro vs Non-Metro**: Validates 50% vs 40% governing boundary conditions.
3. **EPF 80C Capping**: Confirms Employee EPF + Other 80C capped at ₹1,50,000.
4. **Employer PF Perquisite**: Verifies amounts exceeding ₹7.5L are tagged as perquisite.
5. **Old Regime 87A Rebate**: Taxable income ≤ ₹5,00,000 yields ₹0 tax.
6. **Old Regime 30% Slab**: Correct slab taxation, surcharge thresholds, and 4% cess.
7. **New Regime Standard Deduction**: Enforces ₹75,000 for FY 24-25.
8. **New Regime 87A Rebate**: Zero tax on taxable income up to ₹7,00,000.
9. **Section 87A Marginal Relief**: Confirms tax cannot exceed excess income over ₹7,00,000.
10. **Recommendation Engine**: Confirms Old Regime wins with high HRA + 80C + 80D.

---

## 💻 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict typing)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Visualizations**: Recharts
- **Document Processing**: Tesseract.js (In-browser OCR), pdf-parse
- **Report Generation**: jsPDF + jspdf-autotable
- **Testing**: Vitest

---

## 🛠️ Getting Started Locally

### Prerequisites
- Node.js 18+ (tested on v24.14.0)
- npm 9+

### Installation & Run
```bash
# 1. Clone the repository
git clone https://github.com/Girishkumarsamal08/salcal.git
cd salcal

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Run development server
npm run dev

# 4. Open in browser
# Visit http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

---

## 🔒 Privacy & Data Protection

- **In-Memory Processing**: Salary slips and OCR extracts are processed ephemerally and never written to disk or permanent databases.
- **Zero Document Retention**: Uploaded documents are discarded once parsed into the editable review form.

---

## 📜 Statutory Disclaimer

TaxWise provides estimated calculations for educational and comparative planning purposes based on Indian Income Tax provisions as amended by Finance Act 2024. It does not replace professional tax advisory from a certified Chartered Accountant (CA).
