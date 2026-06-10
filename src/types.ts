export type ConstructionType = 'rcc' | 'other_permanent' | 'semi_permanent' | 'temporary' | 'open_land';

export type PropertyType = 'regular' | 'government' | 'educational' | 'local_authority' | 'religious';

export type UsageType = 'residential' | 'commercial' | 'industrial';

export interface PropertyBlock {
  id: string;
  constructionType: ConstructionType;
  length: number; // in feet
  width: number;  // in feet
  areaSqFt: number; // calculated: length * width
  areaSqM: number;  // calculated: areaSqFt * 0.092903
  readyReckonerLand: number; // जमीन रेडी रेकनर दर (per sq. m.)
  readyReckonerBuilding: number; // इमारत रेडी रेकनर दर (per sq. m.)
  constructionYear: number; // बांधकामाचे वर्ष
  buildingAge: number; // इमारतीचे वय
  depreciationRate: number; // घसारा दर % (e.g. 10 for 10%)
  depreciatedBuildingRate: number; // घसारा वजा जाता इमारत दर = readyReckonerBuilding * (1 - depreciationRate / 100)
  usageType: UsageType; // वापरानुसार प्रकार
  usageWeight: number; // निवासी: 1.0, वाणिज्य: 1.2, औद्योगिक: 1.25
  capitalValue: number; // भांडवली मूल्य = [ (areaSqM * landRate) + (areaSqM * depreciatedBuildingRate) ] * usageWeight
  taxRate: number; // कराचे तर (दर हजारी - per thousand, e.g., 1.5, 2.0, 3.5)
  constructionTax: number; // बांधकाम कर = (capitalValue / 1000) * taxRate
}

export interface PropertyAssessment {
  id: string;
  propertyNumber: string; // मिळकत नंबर
  ownerName: string; // मिळकत धारक नाव
  occupantName: string; // भोगवटा धारक नाव
  roadName: string; // रस्त्याचे नाव/गल्लीचे नाव
  gatNumber: string; // गट क्र./भूमापन क्र./भू.म.
  propertyDescription: string; // मालमत्तेचे वर्णन
  assessmentYear: number; // कर आकारणीचे वर्ष (e.g., 2026)
  assessmentDate: string; // दिनांक
  blocks: PropertyBlock[]; // सर्व बांधकामे (अ क्र ४ ते १५)
  streetLightTax: number; // दिवाबत्ती कर
  healthTax: number; // आरोग्य कर
  waterTax: number; // पाणीपट्टी
  grandTotalTax: number; // एकूण वार्षिक कर
  propertyType?: PropertyType; // मालमत्तेचा प्रकार
  grampanchayat?: string; // ग्रामपंचायत नाव
  notes?: string; // इतर माहिती / शेरा

  // Demand / Arrears fields
  arrearsBuildingTax?: number;
  arrearsStreetLightTax?: number;
  arrearsHealthTax?: number;
  arrearsWaterTax?: number;

  // Receipt / Payment details
  receiptBookNo?: string;
  receiptNo?: string;
  receiptDate?: string;

  // Recovered Amounts
  recoveredBuildingTax?: number;
  recoveredStreetLightTax?: number;
  recoveredHealthTax?: number;
  recoveredWaterTax?: number;

  // Scheme Exemption / Tax Rebate
  taxRebate?: number;
}

export interface TaxSettings {
  defaultReadyReckonerLand: number;
  defaultReadyReckonerBuilding: number;
  defaultReadyReckonerBuildingByConstructionType: Record<ConstructionType, number>;
  taxRatesByConstructionType: Record<ConstructionType, number>; // per thousand
  usageWeights: Record<UsageType, number>;
  streetLightSlabs: {
    slab1: number; // 0-300
    slab2: number; // 301-700
    slab3: number; // 701+
  };
  healthSlabs: {
    slab1: number; // 0-300
    slab2: number; // 301-700
    slab3: number; // 701+
  };
  defaultStreetLightTax: number;
  defaultHealthTax: number;
  defaultWaterTax: number;
  roadsList?: string[];
}

export interface WelfareData {
  gpName: string;
  year: number; // e.g. 2026
  divyangAllocation: number;
  divyangExpense: number;
  magasvargiyaAllocation: number;
  magasvargiyaExpense: number;
  mbkAllocation: number;
  mbkExpense: number;
  lastUpdated?: string;
}

