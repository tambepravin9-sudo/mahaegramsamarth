import { PropertyBlock, ConstructionType, UsageType, TaxSettings } from '../types';
import { CONSTRUCTION_TYPE_LABELS, USAGE_TYPE_LABELS, getRecommendedDepreciation, getFinancialYearStart } from '../defaults';
import { Trash2, Calculator } from 'lucide-react';

interface BlockFormProps {
  block: PropertyBlock;
  index: number;
  settings: TaxSettings;
  canDelete: boolean;
  onUpdateBlock: (updatedFields: Partial<PropertyBlock>) => void;
  onDeleteBlock: () => void;
  key?: string;
}

export default function BlockForm({
  block,
  index,
  settings,
  canDelete,
  onUpdateBlock,
  onDeleteBlock
}: BlockFormProps) {
  const currentYear = getFinancialYearStart();

  // Handle local changes that propagate back to parent
  const handleChange = (key: keyof PropertyBlock, value: any) => {
    onUpdateBlock({ [key]: value });
  };

  const applyRecommendedDepreciation = () => {
    const recommended = getRecommendedDepreciation(block.constructionType, block.buildingAge);
    onUpdateBlock({ depreciationRate: recommended });
  };

  return (
    <div id={`block-card-${block.id}`} className="p-5 sm:p-6 bg-white rounded-none border-2 border-slate-200 relative hover:border-indigo-600 transition-all space-y-6">
      
      {/* Block Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-none bg-indigo-950 text-white text-[10px] font-black flex items-center justify-center">
            {index + 1}
          </div>
          <span className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
            इमारतीचा भाग क्र. {index + 1} (Building Block #{index + 1})
          </span>
        </div>
        {canDelete && (
          <button
            type="button"
            onClick={onDeleteBlock}
            className="text-rose-600 hover:text-white hover:bg-rose-600 px-3 py-1.5 border-2 border-rose-200 rounded-none transition-colors cursor-pointer min-h-[36px] flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
            title="हा भाग काढून टाका"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>काढून टाका (Remove)</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Connection Type */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase mb-1 opacity-60 text-slate-800">
            ४. बांधकाम प्रकार निवडा (Construction Type)
          </label>
          <select
            value={block.constructionType}
            onChange={(e) => {
              const type = e.target.value as ConstructionType;
              const defaultTaxRate = settings.taxRatesByConstructionType[type];
              onUpdateBlock({
                constructionType: type,
                taxRate: defaultTaxRate,
                readyReckonerBuilding: type === 'open_land' ? 0 : (settings.defaultReadyReckonerBuildingByConstructionType?.[type] ?? settings.defaultReadyReckonerBuilding ?? 12000),
                depreciationRate: getRecommendedDepreciation(type, block.buildingAge)
              });
            }}
            className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none min-h-[42px]"
          >
            {Object.entries(CONSTRUCTION_TYPE_LABELS).map(([type, label]) => (
              <option key={type} value={type}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Usage Type */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase mb-1 opacity-60 text-slate-800">
            १२. इमारत वापरानुसार प्रकार (Usage Type)
          </label>
          <select
            value={block.usageType}
            onChange={(e) => {
              const uType = e.target.value as UsageType;
              onUpdateBlock({
                usageType: uType,
                usageWeight: settings.usageWeights[uType]
              });
            }}
            className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none min-h-[42px]"
          >
            {Object.entries(USAGE_TYPE_LABELS).map(([type, label]) => (
              <option key={type} value={type}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Dimensions (Length & Width) */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase mb-1 opacity-60 text-slate-800">
            ५. इमारत मोजमाप (Length × Width Feet)
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="लांबी (Feet)"
                step="0.1"
                min="0"
                value={block.length || ''}
                onChange={(e) => handleChange('length', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 pl-3 pr-10 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none min-h-[42px]"
              />
              <span className="absolute right-2.5 top-2.5 text-[9px] uppercase font-black text-slate-400">FT</span>
            </div>
            <span className="text-slate-400 font-bold text-xs">×</span>
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="रुंदी (Feet)"
                step="0.1"
                min="0"
                value={block.width || ''}
                onChange={(e) => handleChange('width', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 pl-3 pr-10 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none min-h-[42px]"
              />
              <span className="absolute right-2.5 top-2.5 text-[9px] uppercase font-black text-slate-400">FT</span>
            </div>
          </div>
        </div>

        {/* Calculated Areas */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-none border border-slate-200 lg:col-span-1">
          <div>
            <span className="block text-[9px] font-black text-slate-450 uppercase tracking-widest">६. क्षेत्रफळ (Sq. Ft.)</span>
            <span className="text-sm font-black font-mono text-slate-900 mt-1 block">{block.areaSqFt} चौरस फूट</span>
          </div>
          <div className="border-l border-slate-200 pl-3">
            <span className="block text-[9px] font-black text-slate-450 uppercase tracking-widest">७. क्षेत्रफळ (Sq. Meters)</span>
            <span className="text-sm font-black font-mono text-indigo-700 mt-1 block">{block.areaSqM} Sq.M.</span>
          </div>
        </div>

        {/* Construction Year & Age */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-none border border-slate-200 lg:col-span-1">
          <div className="space-y-1">
            <span className="block text-[9px] font-black text-slate-455 uppercase tracking-widest">९. बांधकामाचे वर्ष</span>
            <input
              type="number"
              min="1900"
              max={currentYear + 1}
              value={block.constructionYear}
              onChange={(e) => {
                const year = parseInt(e.target.value) || currentYear;
                const age = Math.max(0, currentYear - year);
                onUpdateBlock({
                  constructionYear: year,
                  buildingAge: age,
                  depreciationRate: getRecommendedDepreciation(block.constructionType, age)
                });
              }}
              className="w-full bg-white border border-slate-200 px-2 py-0.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 rounded-none min-h-[26px]"
            />
          </div>
          <div className="border-l border-slate-200 pl-3">
            <span className="block text-[9px] font-black text-slate-455 uppercase tracking-widest">१०. इमारतीचे वय</span>
            <span className="text-sm font-black font-mono text-slate-900 mt-1 block">{block.buildingAge} वर्ष</span>
          </div>
        </div>

        {/* Depreciation Rate */}
        <div className="bg-slate-50 p-3.5 rounded-none border border-slate-200 space-y-1">
          <div className="flex justify-between items-center bg-transparent">
            <span className="block text-[9px] font-black text-slate-455 uppercase tracking-widest">११. घसारा वजावट दर (%)</span>
            {block.constructionType !== 'open_land' && (
              <button
                type="button"
                onClick={applyRecommendedDepreciation}
                className="text-[9px] font-black text-indigo-950 hover:underline uppercase flex items-center gap-1 cursor-pointer"
              >
                <Calculator className="w-2.5 h-2.5" />
                शासकीय दर
              </button>
            )}
          </div>
          {block.constructionType === 'open_land' ? (
            <span className="text-[11px] text-slate-400 block pt-1.5 font-bold uppercase">बखल जागेसाठी घसारा नसतो.</span>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="1"
                  value={block.depreciationRate}
                  onChange={(e) => handleChange('depreciationRate', parseInt(e.target.value) || 0)}
                  className="w-full accent-indigo-650 h-1.5 rounded-none bg-slate-200 cursor-pointer"
                />
                <span className="text-xs font-black font-mono text-slate-800 whitespace-nowrap">{block.depreciationRate}%</span>
              </div>
              <div className="flex justify-between text-[9px] font-bold text-indigo-900 bg-indigo-50/50 p-1 border-l-2 border-indigo-600">
                <span>घसारा वजावट: {block.depreciationRate}%</span>
                <span>शिल्लक किंमत: {100 - block.depreciationRate}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Ready Reckoner land rate */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase mb-1 opacity-60 text-slate-800">
            ८. रेडी रेकनर जमीन दर (₹ प्रति चौ. मीटर)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={block.readyReckonerLand}
              onChange={(e) => handleChange('readyReckonerLand', parseInt(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-200 pl-3 pr-16 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none min-h-[42px]"
            />
            <span className="absolute right-3 top-2.5 text-[9px] font-black text-slate-400 uppercase">/SQ.M.</span>
          </div>
        </div>

        {/* Ready Reckoner building rate */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase mb-1 opacity-60 text-slate-800">
            ८. रेडी रेकनर इमारत दर (₹ प्रति चौ. मीटर)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              disabled={block.constructionType === 'open_land'}
              value={block.readyReckonerBuilding}
              onChange={(e) => handleChange('readyReckonerBuilding', parseInt(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-200 pl-3 pr-16 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none disabled:bg-slate-200 disabled:text-slate-400 min-h-[42px]"
            />
            {block.constructionType !== 'open_land' && (
              <span className="absolute right-3 top-2.5 text-[9px] font-black text-slate-400 uppercase">/SQ.M.</span>
            )}
          </div>
        </div>

        {/* Depreciated Building Rate */}
        <div className="bg-slate-100 p-3.5 rounded-none border border-slate-200 flex flex-col justify-center">
          <span className="block text-[9px] font-black text-slate-455 uppercase tracking-widest">
            इमारत घसारा दर (₹ वजा घसारा)
          </span>
          {block.constructionType === 'open_land' ? (
            <span className="text-xs font-black font-mono text-slate-600 uppercase mt-1">₹० (खुली जागा)</span>
          ) : (
            <div className="space-y-0.5 mt-1">
              <span className="text-sm font-black font-mono text-slate-900">
                ₹{block.depreciatedBuildingRate < 0 ? 0 : block.depreciatedBuildingRate}
              </span>
              <span className="block text-[8px] text-slate-450 uppercase font-bold">
                ({block.readyReckonerBuilding} - {block.depreciationRate}% घसारा)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Maths block explanation in card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-indigo-50 p-4 sm:p-5 rounded-none border border-slate-200">
        
        {/* Capital Value Calculation */}
        <div className="lg:col-span-7 space-y-2">
          <span className="text-[10px] font-black text-indigo-905 uppercase tracking-widest block">
            १३. भांडवली मूल्य गणना (Formula for Capital Value)
          </span>
          <div className="text-xs text-slate-850 space-y-1 bg-white p-3 rounded-none border border-slate-200 leading-relaxed font-sans">
            <div className="text-[9px] text-slate-450 font-mono font-bold uppercase">
              [(Area × Land Rate) + (Area × Depreciated Building Rate)] × Usage Weight
            </div>
            <div className="font-bold text-slate-900 text-[11.5px] flex flex-wrap gap-x-1 items-center mt-1">
              <span>भां. मूल्य =</span>
              <span>[({block.areaSqM} × {block.readyReckonerLand})</span>
              <span>+</span>
              <span>({block.areaSqM} × {block.depreciatedBuildingRate})]</span>
              <span>×</span>
              <span className="text-indigo-850 font-black">{block.usageWeight}</span>
            </div>
            <div className="text-indigo-900 font-extrabold text-sm font-mono mt-1 pt-1 border-t border-slate-100">
              = ₹{block.capitalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Tax calculation */}
        <div className="lg:col-span-5 space-y-2 lg:border-l lg:border-slate-200 lg:pl-4">
          <span className="text-[10px] font-black text-indigo-905 uppercase tracking-widest block">
            १५. २. बांधकाम कर गणना (Construction Tax)
          </span>
          <div className="text-xs text-slate-850 space-y-2 bg-white p-3 rounded-none border border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-slate-455 font-black uppercase tracking-wider">कराचा दर (दर हजारी %):</span>
              <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-none border border-slate-200">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={block.taxRate}
                  onChange={(e) => handleChange('taxRate', parseFloat(e.target.value) || 0)}
                  className="w-10 text-center font-black text-indigo-900 bg-transparent py-0 focus:outline-none font-mono"
                />
                <span className="text-[9px] font-bold text-slate-400">/१०००</span>
              </div>
            </div>
            
            <div className="text-slate-800 font-bold text-[10px] font-mono leading-none pt-0.5">
              ({block.capitalValue} / १०००) × {block.taxRate}
            </div>

            <div className="border-t border-slate-200 pt-1.5 flex justify-between items-baseline">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">प्राप्त बांधकाम कर:</span>
              <span className="text-base font-black text-indigo-905 font-mono">
                ₹{block.constructionTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
