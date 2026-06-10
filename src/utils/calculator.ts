import { PropertyBlock, ConstructionType, UsageType, TaxSettings, PropertyType } from '../types';
import { calculateAge, getRecommendedDepreciation, convertSqFtToSqM, getFinancialYearStart } from '../defaults';

export const calculateBlockValues = (
  raw: Partial<PropertyBlock> & { id: string },
  settings: TaxSettings,
  currentYear: number = getFinancialYearStart()
): PropertyBlock => {
  const constructionType = raw.constructionType || 'rcc';
  const usageType = raw.usageType || 'residential';
  
  const length = Number(raw.length) || 0;
  const width = Number(raw.width) || 0;
  const areaSqFt = parseFloat((length * width).toFixed(2));
  const areaSqM = parseFloat(convertSqFtToSqM(areaSqFt).toFixed(3));
  
  const readyReckonerLand = Number(raw.readyReckonerLand) !== undefined && !isNaN(Number(raw.readyReckonerLand))
    ? Number(raw.readyReckonerLand) 
    : settings.defaultReadyReckonerLand;
    
  // If it's open land, building reckoner rate is 0
  const baseReckonerBuilding = constructionType === 'open_land'
    ? 0
    : (Number(raw.readyReckonerBuilding) !== undefined && !isNaN(Number(raw.readyReckonerBuilding))
        ? Number(raw.readyReckonerBuilding)
        : (settings.defaultReadyReckonerBuildingByConstructionType?.[constructionType] ?? settings.defaultReadyReckonerBuilding ?? 12000));

  const constructionYear = Number(raw.constructionYear) || currentYear;
  const buildingAge = calculateAge(constructionYear, currentYear);
  
  // Get recommended depreciation if depreciationRate is not explicitly styled/entered or use what is entered
  const depreciationRate = raw.depreciationRate !== undefined && !isNaN(Number(raw.depreciationRate))
    ? Number(raw.depreciationRate)
    : getRecommendedDepreciation(constructionType, buildingAge);
    
  const depreciatedBuildingRate = Math.round(baseReckonerBuilding * (1 - depreciationRate / 100));
  
  const usageWeight = settings.usageWeights[usageType] || 1.0;
  
  // भांडवली मूल्य = [ (बांधकाम क्षेत्रफळ चौ.मीटर X रेडीरेकनर दर जमीन ) + (बांधकाम क्षेत्रफळ चौ.मीटर X घसारा ) ] X इमारत भारांक वापरा नुसार
  // Let's write this clearly:
  const landTerm = areaSqM * readyReckonerLand;
  const buildingTerm = areaSqM * depreciatedBuildingRate;
  const capitalValue = Math.round((landTerm + buildingTerm) * usageWeight);
  
  const taxRate = raw.taxRate !== undefined && !isNaN(Number(raw.taxRate))
    ? Number(raw.taxRate)
    : settings.taxRatesByConstructionType[constructionType];
    
  // बांधकाम कर = (भांडवली मूल्य/1000) X कराचे दर
  const constructionTax = Math.round((capitalValue / 1000) * taxRate);

  return {
    id: raw.id,
    constructionType,
    length,
    width,
    areaSqFt,
    areaSqM,
    readyReckonerLand,
    readyReckonerBuilding: baseReckonerBuilding,
    constructionYear,
    buildingAge,
    depreciationRate,
    depreciatedBuildingRate,
    usageType,
    usageWeight,
    capitalValue,
    taxRate,
    constructionTax
  };
};

export const calculateTotalAssessment = (
  propertyNumber: string,
  ownerName: string,
  occupantName: string,
  roadName: string,
  gatNumber: string,
  propertyDescription: string,
  blocks: PropertyBlock[],
  streetLightTax: number,
  healthTax: number,
  waterTax: number,
  assessmentYear: number = getFinancialYearStart(),
  id?: string,
  notes?: string,
  propertyType: PropertyType = 'regular'
) => {
  const isExempt = propertyType !== 'regular';

  // For exempt properties, set building tax rate/taxes to 0
  const processedBlocks = isExempt
    ? blocks.map(b => ({ ...b, constructionTax: 0 }))
    : blocks;

  const totalConstructionTax = isExempt 
    ? 0 
    : Math.round(
        processedBlocks.reduce((sum, block) => sum + block.constructionTax, 0)
      );
  
  const finalStreetLightTax = isExempt ? 0 : Math.round(Number(streetLightTax) || 0);
  const finalHealthTax = isExempt ? 0 : Math.round(Number(healthTax) || 0);
  const finalWaterTax = isExempt ? 0 : Math.round(Number(waterTax) || 0);

  const grandTotalTax = isExempt
    ? 0
    : Math.round(totalConstructionTax + finalStreetLightTax + finalHealthTax + finalWaterTax);

  return {
    id: id || `prop_${Date.now()}`,
    propertyNumber: propertyNumber || '',
    ownerName: ownerName || '',
    occupantName: occupantName || '',
    roadName: roadName || '',
    gatNumber: gatNumber || '',
    propertyDescription: propertyDescription || '',
    assessmentYear,
    assessmentDate: new Date().toLocaleDateString('mr-IN'),
    blocks: processedBlocks,
    streetLightTax: finalStreetLightTax,
    healthTax: finalHealthTax,
    waterTax: finalWaterTax,
    grandTotalTax,
    propertyType,
    notes: notes || ''
  };
};
