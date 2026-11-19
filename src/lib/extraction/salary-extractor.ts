import { ExtractedSalaryData, ExtractedSalaryField } from '../tax/types';

/**
 * Text-based salary slip parser using regular expressions and heuristics
 * specifically tailored for Indian salary slips (TCS, Infosys, Wipro, Startups, MNCs).
 */
export function parseSalarySlipText(rawText: string): ExtractedSalaryData {
  const warnings: string[] = [];
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const normalizedText = rawText.replace(/,/g, ''); // remove comma formatting for numbers

  // Helper to extract numeric values following keywords
  function extractAmount(patterns: RegExp[]): ExtractedSalaryField {
    for (const pattern of patterns) {
      const match = normalizedText.match(pattern);
      if (match && match[1]) {
        const val = parseFloat(match[1].trim());
        if (!isNaN(val) && val > 0) {
          return {
            value: Math.round(val),
            rawText: match[0],
            confidence: 0.90,
            isUncertain: false,
          };
        }
      }
    }
    return {
      value: 0,
      confidence: 0,
      isUncertain: true,
    };
  }

  // 1. Basic Salary patterns
  const basicField = extractAmount([
    /(?:basic\s*(?:salary|pay)?|basic)\s*[:\-\s]*₹?\s*(\d+(?:\.\d{1,2})?)/i,
    /(?:basic)\s+(\d+(?:\.\d{1,2})?)/i,
  ]);

  // 2. HRA patterns
  const hraField = extractAmount([
    /(?:house\s*rent\s*allowance|hra)\s*[:\-\s]*₹?\s*(\d+(?:\.\d{1,2})?)/i,
    /(?:hra)\s+(\d+(?:\.\d{1,2})?)/i,
  ]);

  // 3. Special Allowance
  const specialAllowanceField = extractAmount([
    /(?:special\s*allowance|spl\s*alw|supplementary\s*allowance)\s*[:\-\s]*₹?\s*(\d+(?:\.\d{1,2})?)/i,
  ]);

  // 4. LTA (Leave Travel Allowance)
  const ltaField = extractAmount([
    /(?:leave\s*travel\s*allowance|lta|ltc)\s*[:\-\s]*₹?\s*(\d+(?:\.\d{1,2})?)/i,
  ]);

  // 5. Bonus / Incentives
  const bonusField = extractAmount([
    /(?:bonus|statutory\s*bonus|performance\s*pay|incentive)\s*[:\-\s]*₹?\s*(\d+(?:\.\d{1,2})?)/i,
  ]);

  // 6. Employee Provident Fund (PF / EPF)
  const employeePFField = extractAmount([
    /(?:provident\s*fund|pf\s*employee|employee\s*pf|epf\s*employee|epf|pf)\s*[:\-\s]*₹?\s*(\d+(?:\.\d{1,2})?)/i,
  ]);

  // 7. Employer PF
  const employerPFField = extractAmount([
    /(?:employer\s*pf|employer\s*contribution\s*to\s*pf|employer\s*epf)\s*[:\-\s]*₹?\s*(\d+(?:\.\d{1,2})?)/i,
  ]);

  // 8. Professional Tax (PT)
  const ptField = extractAmount([
    /(?:professional\s*tax|prof\s*tax|pt)\s*[:\-\s]*₹?\s*(\d+(?:\.\d{1,2})?)/i,
  ]);

  // 9. Gross Salary / Total Earnings
  let grossField = extractAmount([
    /(?:gross\s*(?:salary|earnings|pay|remuneration)?|total\s*earnings)\s*[:\-\s]*₹?\s*(\d+(?:\.\d{1,2})?)/i,
    /(?:gross)\s+(\d+(?:\.\d{1,2})?)/i,
  ]);

  // Detect Pay Period (Monthly vs Annual)
  let isMonthly = true;
  // If gross is > 2,00,000 or basic > 1,50,000, it might be annual, but high earners can have 3L/month
  // Check for month names in rawText
  const monthNames = /january|february|march|april|may|june|july|august|september|october|november|december|pay\s*slip\s*for\s*(?:month|the\s*month)/i;
  const annualKeywords = /annual|per\s*annum|ctc|annexure|breakup/i;
  
  if (annualKeywords.test(rawText) && !monthNames.test(rawText) && grossField.value > 300000) {
    isMonthly = false;
  }

  // Company and Employee Name heuristics
  let companyName: string | undefined;
  let employeeName: string | undefined;

  for (const line of lines.slice(0, 8)) {
    if (/pvt|ltd|limited|technologies|solutions|services|corp|bank|consultancy/i.test(line)) {
      companyName = line;
      break;
    }
  }

  const nameMatch = rawText.match(/(?:employee\s*name|name)\s*[:\-\s]*([A-Za-z\s.]+)/i);
  if (nameMatch && nameMatch[1]) {
    employeeName = nameMatch[1].trim();
  }

  // If Gross was not found, check if we can compute it from sum of earnings
  const componentsSum = basicField.value + hraField.value + specialAllowanceField.value + ltaField.value + bonusField.value;
  if (grossField.value === 0 && componentsSum > 0) {
    grossField = {
      value: componentsSum,
      confidence: 0.70,
      isUncertain: true,
      rawText: 'Calculated as sum of earnings',
    };
    warnings.push('Gross salary was estimated by summing detected earnings components.');
  }

  // Check for other allowances
  let otherAllowancesValue = 0;
  if (grossField.value > componentsSum) {
    otherAllowancesValue = grossField.value - componentsSum;
  }
  const otherAllowancesField: ExtractedSalaryField = {
    value: otherAllowancesValue,
    confidence: otherAllowancesValue > 0 ? 0.75 : 0.5,
    isUncertain: otherAllowancesValue > 0,
  };

  // Convert to Annual values if monthly is detected
  const multiplier = isMonthly ? 12 : 1;

  if (isMonthly) {
    warnings.push('Monthly salary slip detected. Values have been annualized (x12). You can review and adjust each field below.');
  }

  // Record uncertainty warnings
  if (basicField.isUncertain || basicField.value === 0) {
    warnings.push('Basic Salary could not be confidently detected. Please confirm this value.');
  }
  if (hraField.isUncertain || hraField.value === 0) {
    warnings.push('HRA was not detected or is ₹0. If you receive HRA, please enter it manually.');
  }
  if (employeePFField.isUncertain && basicField.value > 0) {
    warnings.push('Employee PF was not clearly found. Please check your EPF contribution.');
  }

  return {
    annualGrossSalary: {
      ...grossField,
      value: grossField.value * multiplier,
    },
    basicSalary: {
      ...basicField,
      value: basicField.value * multiplier,
    },
    hraReceived: {
      ...hraField,
      value: hraField.value * multiplier,
    },
    specialAllowance: {
      ...specialAllowanceField,
      value: specialAllowanceField.value * multiplier,
    },
    lta: {
      ...ltaField,
      value: ltaField.value * multiplier,
    },
    bonus: {
      ...bonusField,
      value: bonusField.value * multiplier,
    },
    employeePF: {
      ...employeePFField,
      value: employeePFField.value * multiplier,
    },
    employerPF: {
      ...employerPFField,
      value: employerPFField.value * multiplier,
    },
    professionalTax: {
      ...ptField,
      value: ptField.value > 0 ? (isMonthly ? Math.min(2500, ptField.value * 12) : ptField.value) : 0,
    },
    otherAllowances: {
      ...otherAllowancesField,
      value: otherAllowancesField.value * multiplier,
    },
    monthlyOrAnnual: isMonthly ? 'monthly' : 'annual',
    companyName,
    employeeName,
    warnings,
  };
}
