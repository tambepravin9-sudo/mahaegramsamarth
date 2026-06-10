import { useState } from 'react';
import { TaxSettings, ConstructionType, UsageType } from '../types';
import { CONSTRUCTION_TYPE_LABELS } from '../defaults';
import { RotateCcw, LandPlot, Home, Lightbulb, Trash2, Droplets, MapPin, Plus } from 'lucide-react';

interface SettingsPanelProps {
  settings: TaxSettings;
  onUpdateSettings: (newSettings: TaxSettings) => void;
  onResetSettings: () => void;
}

export default function SettingsPanel({
  settings,
  onUpdateSettings,
  onResetSettings
}: SettingsPanelProps) {
  const [newRoadName, setNewRoadName] = useState('');

  const handleAddRoad = () => {
    if (!newRoadName.trim()) return;
    const currentRoads = settings.roadsList ?? [];
    if (currentRoads.includes(newRoadName.trim())) {
      alert('हा रस्ता/गल्ली आधीपासून साठवलेली आहे.');
      return;
    }
    onUpdateSettings({
      ...settings,
      roadsList: [...currentRoads, newRoadName.trim()]
    });
    setNewRoadName('');
  };

  const handleDeleteRoad = (roadToDelete: string) => {
    const currentRoads = settings.roadsList ?? [];
    onUpdateSettings({
      ...settings,
      roadsList: currentRoads.filter(r => r !== roadToDelete)
    });
  };

  const handleRateChange = (type: ConstructionType, value: number) => {
    onUpdateSettings({
      ...settings,
      taxRatesByConstructionType: {
        ...settings.taxRatesByConstructionType,
        [type]: value
      }
    });
  };

  const handleWeightChange = (type: UsageType, value: number) => {
    onUpdateSettings({
      ...settings,
      usageWeights: {
        ...settings.usageWeights,
        [type]: value
      }
    });
  };

  const handleGenSettingChange = (key: keyof TaxSettings, value: number) => {
    onUpdateSettings({
      ...settings,
      [key]: value
    });
  };

  const handleReadyReckonerBuildingTypeChange = (type: ConstructionType, value: number) => {
    onUpdateSettings({
      ...settings,
      defaultReadyReckonerBuildingByConstructionType: {
        ...(settings.defaultReadyReckonerBuildingByConstructionType || {
          rcc: 12000,
          other_permanent: 8000,
          semi_permanent: 5000,
          temporary: 2500,
          open_land: 0
        }),
        [type]: value
      }
    });
  };

  const handleStreetLightSlabChange = (slabKey: 'slab1' | 'slab2' | 'slab3', value: number) => {
    onUpdateSettings({
      ...settings,
      streetLightSlabs: {
        ...(settings.streetLightSlabs || { slab1: 100, slab2: 200, slab3: 350 }),
        [slabKey]: value
      }
    });
  };

  const handleHealthSlabChange = (slabKey: 'slab1' | 'slab2' | 'slab3', value: number) => {
    onUpdateSettings({
      ...settings,
      healthSlabs: {
        ...(settings.healthSlabs || { slab1: 80, slab2: 150, slab3: 250 }),
        [slabKey]: value
      }
    });
  };

  return (
    <div id="settings-panel-container" className="bg-white border-2 border-slate-200 p-5 sm:p-7 space-y-8 rounded-none">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-5">
        <div>
          <h2 className="text-xs font-black uppercase text-indigo-600 border-b-2 border-indigo-50 pb-1 inline-block tracking-widest">
            कर नियम व दर रचना सेटिंग्ज (Property Tax Parameters)
          </h2>
          <p className="text-[10px] text-slate-550 font-bold uppercase mt-1">
            तुमच्या ग्रामपंचायतीच्या किंवा स्थानिक स्वराज्य संस्थेच्या ठराव व रेडी रेकनर नियमांनुसार खालील दर बदला.
          </p>
        </div>
        
        <button
          onClick={onResetSettings}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border-2 border-slate-200 hover:border-indigo-600 text-slate-700 hover:text-indigo-900 bg-white font-black text-[10px] uppercase tracking-wider rounded-none transition-all cursor-pointer min-h-[36px]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          मूळ दर पुनर्संचयित करा (Defaults)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Construction Tax Rates (दर हजारी) */}
        <div className="space-y-6">
          <div>
            <h3 className="text-[10px] font-black text-indigo-950 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-indigo-600" />
              १. बांधकाम प्रकारानुसार कर दर (दर हजारी - Per Thousand)
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase">
              भांडवली मूल्याच्या प्रति १००० रुपयांवर लागू करावयाचा कर दर रुपयात: (उदा. ३.५ म्हणजे ०.३५%)
            </p>
          </div>

          <div className="space-y-3">
            {(Object.keys(settings.taxRatesByConstructionType) as ConstructionType[]).map((type) => (
              <div key={type} className="flex items-center justify-between bg-slate-50 p-4 rounded-none border border-slate-200">
                <span className="text-xs font-black uppercase text-slate-800">
                  {CONSTRUCTION_TYPE_LABELS[type]}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={settings.taxRatesByConstructionType[type]}
                    onChange={(e) => handleRateChange(type, parseFloat(e.target.value) || 0)}
                    className="w-24 bg-white border border-slate-200 px-3 py-1.5 text-right font-black font-mono text-slate-900 focus:outline-none focus:border-indigo-500 rounded-none min-h-[38px]"
                  />
                  <span className="text-[10px] font-black uppercase text-slate-400">/१०००</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Ready Reckoner Defaults and Weights */}
        <div className="space-y-8">
          
          {/* Ready Reckoner Defaults */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-indigo-950 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-indigo-600" />
              २. डीफॉल्ट रेडी रेकनर दर (प्रति चौ. मीटर)
            </h3>
            
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-none border border-slate-200 flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase text-slate-800 flex items-center gap-1.5">
                  <LandPlot className="w-3.5 h-3.5 text-indigo-600" />
                  डीफॉल्ट जमीन दर
                </span>
                <div className="flex items-center gap-2 max-w-xs">
                  <input
                    type="number"
                    value={settings.defaultReadyReckonerLand}
                    onChange={(e) => handleGenSettingChange('defaultReadyReckonerLand', parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 px-3 py-1.5 font-bold font-mono text-slate-900 focus:outline-none focus:border-indigo-500 rounded-none min-h-[38px]"
                  />
                  <span className="text-[10px] font-black text-slate-400 uppercase">₹/SQ.M.</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-none border border-slate-200 space-y-3">
                <span className="text-[10px] font-black uppercase text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-200">
                  <Home className="w-3.5 h-3.5 text-indigo-600" />
                  डीफॉल्ट इमारत बांधकाम दर (प्रकारानुसार)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {(Object.keys(CONSTRUCTION_TYPE_LABELS) as ConstructionType[]).map((type) => {
                    const value = settings.defaultReadyReckonerBuildingByConstructionType?.[type] ?? 
                      (type === 'open_land' ? 0 : settings.defaultReadyReckonerBuilding);
                    return (
                      <div key={type} className="space-y-1 bg-white p-2.5 border border-slate-200">
                        <label className="block text-[9px] font-bold uppercase text-slate-600 truncate">
                          {type === 'open_land' ? 'बखल (खुली जागा)' : type === 'rcc' ? 'आर.सी.सी. (RCC)' : type === 'other_permanent' ? 'इतर पक्के' : type === 'semi_permanent' ? 'अर्ध पक्के' : 'कच्चे मातीचे'}
                        </label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 text-[10px] font-bold">₹</span>
                          <input
                            type="number"
                            disabled={type === 'open_land'}
                            value={value}
                            onChange={(e) => handleReadyReckonerBuildingTypeChange(type, parseInt(e.target.value) || 0)}
                            className="w-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs font-black font-mono text-slate-950 focus:outline-none focus:border-indigo-500 rounded-none disabled:bg-slate-200 disabled:text-slate-400"
                          />
                          <span className="text-[8px] font-bold text-slate-400">/M²</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Usage Weights */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-indigo-950 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-indigo-600" />
              ३. इमारत वापरानुसार भारांक (Usage Weights)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(Object.keys(settings.usageWeights) as UsageType[]).map((type) => (
                <div key={type} className="bg-slate-50 p-4 rounded-none border border-slate-200 space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">
                    {type === 'residential' ? 'निवासी' : type === 'commercial' ? 'वाणिज्य' : 'औद्योगिक'}
                  </span>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    value={settings.usageWeights[type]}
                    onChange={(e) => handleWeightChange(type, parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 px-3 py-1.5 font-black font-mono text-slate-900 focus:outline-none focus:border-indigo-500 rounded-none min-h-[38px]"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Auxiliary Annual Taxes */}
      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-[10px] font-black text-indigo-950 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-indigo-600" />
          ४. दिवाबत्ती आणि आरोग्य कर क्षेत्रफळ स्लॅब रचना (Slab-Based Annual Taxes)
        </h3>
        
        <p className="text-[10px] text-slate-500 font-bold uppercase mb-4">
          इमारतीच्या एकूण बांधकाम क्षेत्रफळानुसार (चौरस फूट) लागू करावयाचे सुधारित वार्षिक कर स्लॅब निश्चित करा:
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Street Light Slabs */}
          <div className="bg-slate-50 p-4 rounded-none border border-slate-200 space-y-3.5">
            <span className="text-[10px] font-black uppercase text-indigo-900 flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              दिवाबत्ती कर आकारणी सुधारित स्लॅब (Street Light Slabs)
            </span>
            
            <div className="grid grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">
                  ० ते ३०० चौ.फू.
                </span>
                <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-none">
                  <span className="text-slate-400 text-[10px] font-bold">₹</span>
                  <input
                    type="number"
                    value={settings.streetLightSlabs?.slab1 ?? 100}
                    onChange={(e) => handleStreetLightSlabChange('slab1', parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-black font-mono focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">
                  ३०१ ते ७०० चौ.फू.
                </span>
                <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-none">
                  <span className="text-slate-400 text-[10px] font-bold">₹</span>
                  <input
                    type="number"
                    value={settings.streetLightSlabs?.slab2 ?? 200}
                    onChange={(e) => handleStreetLightSlabChange('slab2', parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-black font-mono focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">
                  ७०१ च्या पुढे
                </span>
                <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-none">
                  <span className="text-slate-400 text-[10px] font-bold">₹</span>
                  <input
                    type="number"
                    value={settings.streetLightSlabs?.slab3 ?? 350}
                    onChange={(e) => handleStreetLightSlabChange('slab3', parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-black font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Health Slabs */}
          <div className="bg-slate-50 p-4 rounded-none border border-slate-200 space-y-3.5">
            <span className="text-[10px] font-black uppercase text-indigo-900 flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <Trash2 className="w-3.5 h-3.5 text-emerald-600" />
              आरोग्य कर आकारणी सुधारित स्लॅब (Health Tax Slabs)
            </span>
            
            <div className="grid grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">
                  ० ते ३०० चौ.फू.
                </span>
                <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-none">
                  <span className="text-slate-400 text-[10px] font-bold">₹</span>
                  <input
                    type="number"
                    value={settings.healthSlabs?.slab1 ?? 80}
                    onChange={(e) => handleHealthSlabChange('slab1', parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-black font-mono focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">
                  ३०१ ते ७०० चौ.फू.
                </span>
                <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-none">
                  <span className="text-slate-400 text-[10px] font-bold">₹</span>
                  <input
                    type="number"
                    value={settings.healthSlabs?.slab2 ?? 150}
                    onChange={(e) => handleHealthSlabChange('slab2', parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-black font-mono focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">
                  ७०१ च्या पुढे
                </span>
                <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-none">
                  <span className="text-slate-400 text-[10px] font-bold">₹</span>
                  <input
                    type="number"
                    value={settings.healthSlabs?.slab3 ?? 250}
                    onChange={(e) => handleHealthSlabChange('slab3', parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-black font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Taxes / पाणीपट्टी & Flat Surcharges info */}
        <div className="bg-slate-50 p-4 rounded-none border border-slate-200 space-y-3.5 mt-6 max-w-sm">
          <span className="text-[10px] font-black uppercase text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-200">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            वार्षिक पाणीपट्टी कर (Flat Water Tax)
          </span>
          <div className="flex items-center gap-2 max-w-xs">
            <span className="text-slate-400 font-bold text-xs">₹</span>
            <input
              type="number"
              value={settings.defaultWaterTax}
              onChange={(e) => handleGenSettingChange('defaultWaterTax', parseInt(e.target.value) || 0)}
              className="w-full bg-white border border-slate-200 px-3 py-1.5 font-bold font-mono text-slate-900 focus:outline-none focus:border-indigo-500 rounded-none min-h-[38px]"
            />
          </div>
        </div>
      </div>

      {/* ५. गल्ली / रस्त्यांची यादी व्यवस्थापन */}
      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-[10px] font-black text-indigo-950 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-indigo-600" />
          ५. गल्ली / रस्त्यांची यादी व्यवस्थापन (Street & Road Names Directory)
        </h3>
        <p className="text-[10px] text-slate-550 font-bold uppercase mb-4">
          येथे तुम्ही नवीन रस्ता किंवा गल्लीचे नाव जोडू शकता, जेणेकरून कर आकारणी करताना ड्रॉपडाउन मधून ते निवडणे सोपे होईल.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* New Road Input Form */}
          <div className="md:col-span-4 bg-slate-50 p-4 border border-slate-200 rounded-none space-y-3">
            <span className="text-[10px] font-black uppercase text-indigo-900 flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              नवीन रस्ता / गल्ली जोडा
            </span>
            <div className="space-y-2">
              <input
                type="text"
                value={newRoadName}
                onChange={(e) => setNewRoadName(e.target.value)}
                placeholder="उदा. स्टेशन रोड, वॉर्ड क्र. १"
                className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 rounded-none min-h-[38px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRoad();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddRoad}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 border-2 border-indigo-950 hover:bg-indigo-950 text-indigo-950 hover:text-white bg-transparent font-black text-[10px] uppercase tracking-wider rounded-none transition-all cursor-pointer min-h-[36px]"
              >
                <Plus className="w-3.5 h-3.5" />
                यादीत समाविष्ट करा (Add)
              </button>
            </div>
          </div>

          {/* Existing List Directory */}
          <div className="md:col-span-8 bg-slate-50 p-4 border border-slate-200 rounded-none space-y-3.5">
            <span className="text-[10px] font-black uppercase text-slate-800 flex items-center justify-between pb-1 border-b border-slate-200">
              <span>सध्याची रस्ते / गल्ली यादी ({ (settings.roadsList ?? []).length })</span>
              { (settings.roadsList ?? []).length === 0 && (
                <span className="text-rose-600 text-[9px] font-bold">यादी रिकामी आहे</span>
              )}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
              {(settings.roadsList ?? []).map((road, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white p-2 border border-slate-150 rounded-none text-xs font-bold text-slate-850 hover:border-slate-350 transition-all">
                  <span className="truncate">{road}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteRoad(road)}
                    className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                    title="रस्ता यादीतून काढा"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
