import { ConstructionType, UsageType, TaxSettings } from './types';

export const CONSTRUCTION_TYPE_LABELS: Record<ConstructionType, string> = {
  rcc: 'आर.सी.सी. (RCC / पक्के बांधकाम)',
  other_permanent: 'इतर पक्के',
  semi_permanent: 'अर्ध पक्के',
  temporary: 'कच्चे घर / मातीचे घर',
  open_land: 'बखल (खुली जागा)'
};

export const USAGE_TYPE_LABELS: Record<UsageType, string> = {
  residential: 'निवासी (भारांक: १.००)',
  commercial: 'वाणिज्य (भारांक: १.२०)',
  industrial: 'औद्योगिक (भारांक: १.२५)'
};

export const PROPERTY_TYPE_LABELS: Record<'regular' | 'government' | 'educational' | 'local_authority' | 'religious', string> = {
  regular: 'सामान्य (करास पात्र / Regular)',
  government: 'शासकीय मिळकत (कर माफ / Government Exempt)',
  educational: 'शैक्षणिक संस्था मिळकत (कर माफ / Educational Exempt)',
  local_authority: 'स्थानिक प्राधिकरण मिळकत (कर माफ / Local Authority Exempt)',
  religious: 'धार्मिक / प्रार्थना स्थळ मिळकत (कर माफ / Religious Exempt)'
};

export const DEFAULT_TAX_SETTINGS: TaxSettings = {
  defaultReadyReckonerLand: 1500, // Rs per Sq. M.
  defaultReadyReckonerBuilding: 12000, // Rs per Sq. M.
  defaultReadyReckonerBuildingByConstructionType: {
    rcc: 12000,
    other_permanent: 8000,
    semi_permanent: 5000,
    temporary: 2500,
    open_land: 0
  },
  taxRatesByConstructionType: {
    rcc: 3.5, // Rs per Rs 1,000 Capital Value (3.5 दर हजारी)
    other_permanent: 3.0, // Rs per Rs 1,000 Capital Value (3.0 दर हजारी)
    semi_permanent: 2.5, // Rs per Rs 1,000 Capital Value (2.5 दर हजारी)
    temporary: 2.0, // Rs per Rs 1,000 Capital Value (2.0 दर हजारी)
    open_land: 1.5 // Rs per Rs 1,000 Capital Value (1.5 दर हजारी)
  },
  usageWeights: {
    residential: 1.0,
    commercial: 1.20,
    industrial: 1.25
  },
  streetLightSlabs: {
    slab1: 100, // 0 - 300
    slab2: 200, // 301 - 700
    slab3: 350  // 701+
  },
  healthSlabs: {
    slab1: 80,  // 0 - 300
    slab2: 150, // 301 - 700
    slab3: 250  // 701+
  },
  defaultStreetLightTax: 150, // Rs.
  defaultHealthTax: 100, // Rs.
  defaultWaterTax: 800, // Rs.
  roadsList: [
    'मुख्य रस्ता (Main Road)',
    'विठ्ठल मंदिर गल्ली (Vitthal Mandir Lane)',
    'बाजार पेठ रस्ता (Market Yard Road)',
    'जि. प. शाळा गल्ली (Z. P. School Lane)',
    'ग्रामपंचायत रोड (Gram Panchayat Road)',
    'स्टेशन रोड (Station Road)',
    'शिवाजी नगर गल्ली (Shivaji Nagar Lane)'
  ]
};

// Function to calculate start year of Indian Financial Year (01 April to 31 March)
export const getFinancialYearStart = (date: Date = new Date()): number => {
  const month = date.getMonth(); // 0 is January, 3 is April
  const year = date.getFullYear();
  return month >= 3 ? year : year - 1;
};

// Function to calculate building age based on financial year
export const calculateAge = (constructionYear: number, currentYear: number = getFinancialYearStart()): number => {
  const age = currentYear - constructionYear;
  return age >= 0 ? age : 0;
};

// Function to recommend depreciation rate % based on building construction type and age
// Maharashtra Grammar/Village Panchayat general depreciation model as per user requirements
export const getRecommendedDepreciation = (type: ConstructionType, age: number): number => {
  if (type === 'open_land') return 0;
  
  const isTemporaryOrSemi = type === 'temporary' || type === 'semi_permanent';

  if (isTemporaryOrSemi) {
    // कच्चे घर व अर्धे पक्के (Temporary & Semi-Permanent Categories)
    if (age <= 2) return 0;     // शिल्लक १०० % -> घसार वजा दर ०%
    if (age <= 5) return 5;     // शिल्लक ९५ % -> घसार वजा दर ५%
    if (age <= 10) return 15;   // शिल्लक ८५ % -> घसार वजा दर १५%
    if (age <= 20) return 25;   // शिल्लक ७५ % -> घसार वजा दर २५%
    if (age <= 30) return 40;   // शिल्लक ६० % -> घसार वजा दर ४०%
    if (age <= 40) return 55;   // शिल्लक ४५ % -> घसार वजा दर ५५%
    if (age <= 50) return 70;   // शिल्लक ३० % -> घसार वजा दर ७०%
    if (age <= 60) return 80;   // शिल्लक २० % -> घसार वजा दर ८०%
    return 85;                  // शिल्लक १५ % -> घसार वजा दर ८५%
  } else {
    // इतर पक्के व पूर्ण पक्के किंवा आर सी सी (Other Permanent & RCC)
    if (age <= 2) return 0;     // शिल्लक १०० % -> घसार वजा दर ०%
    if (age <= 5) return 5;     // शिल्लक ९५ % -> घसार वजा दर ५%
    if (age <= 10) return 10;   // शिल्लक ९० % -> घसार वजा दर १०%
    if (age <= 20) return 20;   // शिल्लक ८० % -> घसार वजा दर २०%
    if (age <= 30) return 30;   // शिल्लक ७० % -> घसार वजा दर ३०%
    if (age <= 40) return 40;   // शिल्लक ६० % -> घसार वजा दर ४०%
    if (age <= 50) return 50;   // शिल्लक ५० % -> घसार वजा दर ५०%
    if (age <= 60) return 60;   // शिल्लक ४० % -> घसार वजा दर ६०%
    return 70;                  // शिल्लक ३० % -> घसार वजा दर ७०%
  }
};

// Convert Sq Ft to Sq Meter (1 Sq Ft = 0.092903 Sq Meter)
export const convertSqFtToSqM = (sqFt: number): number => {
  return parseFloat((sqFt * 0.092903).toFixed(3));
};
