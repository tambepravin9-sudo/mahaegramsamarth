import { useState, useEffect } from 'react';
import { PropertyAssessment } from '../types';
import { 
  Search, 
  Printer, 
  Download, 
  Edit3, 
  Coins, 
  CheckCircle, 
  Calendar, 
  X, 
  Save, 
  MapPin, 
  RotateCcw,
  Plus,
  ArrowRight
} from 'lucide-react';

interface DemandRegisterProps {
  assessments: PropertyAssessment[];
  roadsList: string[];
  onUpdateAssessment: (assessment: PropertyAssessment) => void;
  onAddNewAssessment: () => void;
  assessmentYear: number;
  activeGPName?: string;
  activeGPTaluka?: string;
  activeGPDistrict?: string;
}

export default function DemandRegister({
  assessments,
  roadsList,
  onUpdateAssessment,
  onAddNewAssessment,
  assessmentYear,
  activeGPName,
  activeGPTaluka,
  activeGPDistrict
}: DemandRegisterProps) {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoad, setSelectedRoad] = useState('');

  // Editable Ledger Headers
  const [gpName, setGpName] = useState(() => localStorage.getItem('cfg_gp') || 'पिंपळगाव कोंझिरा');
  const [talukaName, setTalukaName] = useState(() => localStorage.getItem('cfg_taluka') || 'संगमनेर');
  const [districtName, setDistrictName] = useState(() => localStorage.getItem('cfg_dist') || 'अहिल्यानगर');

  useEffect(() => {
    if (activeGPName) {
      setGpName(activeGPName);
    }
    if (activeGPTaluka) {
      setTalukaName(activeGPTaluka);
    }
    if (activeGPDistrict) {
      setDistrictName(activeGPDistrict);
    }
  }, [activeGPName, activeGPTaluka, activeGPDistrict]);

  // Modal Editing State
  const [editingItem, setEditingItem] = useState<PropertyAssessment | null>(null);

  // Quick Arrears Panel States
  const [showQuickArrears, setShowQuickArrears] = useState(false);
  const [qSelectedPropId, setQSelectedPropId] = useState('');
  const [qArrearsBuilding, setQArrearsBuilding] = useState<number>(0);
  const [qArrearsStreetLight, setQArrearsStreetLight] = useState<number>(0);
  const [qArrearsHealth, setQArrearsHealth] = useState<number>(0);
  const [qArrearsWater, setQArrearsWater] = useState<number>(0);
  const [qSavedMsg, setQSavedMsg] = useState('');

  // Handle auto-population for quick arrears entry
  useEffect(() => {
    if (qSelectedPropId) {
      const found = assessments.find(a => a.id === qSelectedPropId);
      if (found) {
        setQArrearsBuilding(found.arrearsBuildingTax ?? 0);
        setQArrearsStreetLight(found.arrearsStreetLightTax ?? 0);
        setQArrearsHealth(found.arrearsHealthTax ?? 0);
        setQArrearsWater(found.arrearsWaterTax ?? 0);
      }
    } else {
      setQArrearsBuilding(0);
      setQArrearsStreetLight(0);
      setQArrearsHealth(0);
      setQArrearsWater(0);
    }
  }, [qSelectedPropId, assessments]);

  const handleSaveQuickArrears = () => {
    const found = assessments.find(a => a.id === qSelectedPropId);
    if (!found) return;

    const updated: PropertyAssessment = {
      ...found,
      arrearsBuildingTax: qArrearsBuilding,
      arrearsStreetLightTax: qArrearsStreetLight,
      arrearsHealthTax: qArrearsHealth,
      arrearsWaterTax: qArrearsWater
    };

    onUpdateAssessment(updated);
    setQSavedMsg(`मिळकत क्र. ${found.propertyNumber} ची थकबाकी यशस्वीरित्या जतन केली!`);
    setTimeout(() => {
      setQSavedMsg('');
    }, 4500);
  };

  // Edit fields (temporary local states inside modal)
  const [arrearsBuilding, setArrearsBuilding] = useState<number>(0);
  const [arrearsStreetLight, setArrearsStreetLight] = useState<number>(0);
  const [arrearsHealth, setArrearsHealth] = useState<number>(0);
  const [arrearsWater, setArrearsWater] = useState<number>(0);

  const [bookNo, setBookNo] = useState<string>('');
  const [receiptNo, setReceiptNo] = useState<string>('');
  const [receiptDate, setReceiptDate] = useState<string>('');

  const [recoveredBuilding, setRecoveredBuilding] = useState<number>(0);
  const [recoveredStreetLight, setRecoveredStreetLight] = useState<number>(0);
  const [recoveredHealth, setRecoveredHealth] = useState<number>(0);
  const [recoveredWater, setRecoveredWater] = useState<number>(0);

  const [rebate, setRebate] = useState<number>(0);

  // Sync edits of headers
  useEffect(() => {
    localStorage.setItem('cfg_gp', gpName);
    localStorage.setItem('cfg_taluka', talukaName);
    localStorage.setItem('cfg_dist', districtName);
  }, [gpName, talukaName, districtName]);

  // Open modal and prefill values
  const [highlightArrearsSection, setHighlightArrearsSection] = useState(false);

  const openEditModal = (item: PropertyAssessment, focusArrearsSection: boolean = false) => {
    setEditingItem(item);
    setHighlightArrearsSection(focusArrearsSection);
    setArrearsBuilding(item.arrearsBuildingTax ?? 0);
    setArrearsStreetLight(item.arrearsStreetLightTax ?? 0);
    setArrearsHealth(item.arrearsHealthTax ?? 0);
    setArrearsWater(item.arrearsWaterTax ?? 0);

    setBookNo(item.receiptBookNo ?? '');
    setReceiptNo(item.receiptNo ?? '');
    setReceiptDate(item.receiptDate ?? '');

    setRecoveredBuilding(item.recoveredBuildingTax ?? 0);
    setRecoveredStreetLight(item.recoveredStreetLightTax ?? 0);
    setRecoveredHealth(item.recoveredHealthTax ?? 0);
    setRecoveredWater(item.recoveredWaterTax ?? 0);

    setRebate(item.taxRebate ?? 0);
  };

  // Helper calculation details for current taxes
  const getBlockValues = (item: PropertyAssessment) => {
    const isExempt = item.propertyType && item.propertyType !== 'regular';
    const buildingTax = isExempt ? 0 : item.blocks.reduce((sum, b) => sum + b.constructionTax, 0);
    const streetLight = isExempt ? 0 : (item.streetLightTax ?? 0);
    const health = isExempt ? 0 : (item.healthTax ?? 0);
    const water = isExempt ? 0 : (item.waterTax ?? 0);
    
    return {
      buildingTax,
      streetLight,
      health,
      water,
      total: buildingTax + streetLight + health + water
    };
  };

  // Auto fill payments as fully paid (current + arrears)
  const autoFillFullyPaid = () => {
    if (!editingItem) return;
    const current = getBlockValues(editingItem);
    
    setRecoveredBuilding((editingItem.arrearsBuildingTax ?? 0) + current.buildingTax);
    setRecoveredStreetLight((editingItem.arrearsStreetLightTax ?? 0) + current.streetLight);
    setRecoveredHealth((editingItem.arrearsHealthTax ?? 0) + current.health);
    setRecoveredWater((editingItem.arrearsWaterTax ?? 0) + current.water);
  };

  // Handle save of demand / collection
  const handleSaveDemand = () => {
    if (!editingItem) return;

    const updated: PropertyAssessment = {
      ...editingItem,
      arrearsBuildingTax: arrearsBuilding,
      arrearsStreetLightTax: arrearsStreetLight,
      arrearsHealthTax: arrearsHealth,
      arrearsWaterTax: arrearsWater,
      receiptBookNo: bookNo,
      receiptNo: receiptNo,
      receiptDate: receiptDate,
      recoveredBuildingTax: recoveredBuilding,
      recoveredStreetLightTax: recoveredStreetLight,
      recoveredHealthTax: recoveredHealth,
      recoveredWaterTax: recoveredWater,
      taxRebate: rebate
    };

    onUpdateAssessment(updated);
    setEditingItem(null);
  };

  // Filter list
  const filtered = assessments
    .filter((item) => {
      const matchSearch = 
        item.propertyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.occupantName && item.occupantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.roadName && item.roadName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.gatNumber && item.gatNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchRoad = selectedRoad === '' || item.roadName === selectedRoad;

      return matchSearch && matchRoad;
    })
    .sort((a, b) => a.propertyNumber.localeCompare(b.propertyNumber, undefined, { numeric: true, sensitivity: 'base' }));

  // Grand totals computation for filtered register
  let sumArrBuilding = 0;
  let sumArrLight = 0;
  let sumArrHealth = 0;
  let sumArrWater = 0;
  let sumArrTotal = 0;

  let sumCurBuilding = 0;
  let sumCurLight = 0;
  let sumCurHealth = 0;
  let sumCurWater = 0;
  let sumCurTotal = 0;

  let sumTotBuilding = 0;
  let sumTotLight = 0;
  let sumTotHealth = 0;
  let sumTotWater = 0;
  let sumTotGrand = 0;

  let sumRecBuilding = 0;
  let sumRecLight = 0;
  let sumRecHealth = 0;
  let sumRecWater = 0;
  let sumRecTotal = 0;

  let sumRebate = 0;
  let sumBalance = 0;

  filtered.forEach((item) => {
    const cur = getBlockValues(item);

    const abBy = item.arrearsBuildingTax ?? 0;
    const alBy = item.arrearsStreetLightTax ?? 0;
    const ahBy = item.arrearsHealthTax ?? 0;
    const awBy = item.arrearsWaterTax ?? 0;
    const arrTot = abBy + alBy + ahBy + awBy;

    const totBuilding = abBy + cur.buildingTax;
    const totLight = alBy + cur.streetLight;
    const totHealth = ahBy + cur.health;
    const totWater = awBy + cur.water;
    const totTotal = totBuilding + totLight + totHealth + totWater;

    const recBuilding = item.recoveredBuildingTax ?? 0;
    const recLight = item.recoveredStreetLightTax ?? 0;
    const recHealth = item.recoveredHealthTax ?? 0;
    const recWater = item.recoveredWaterTax ?? 0;
    const recTotal = recBuilding + recLight + recHealth + recWater;

    const reb = item.taxRebate ?? 0;
    const bal = Math.max(0, totTotal - recTotal - reb);

    sumArrBuilding += abBy;
    sumArrLight += alBy;
    sumArrHealth += ahBy;
    sumArrWater += awBy;
    sumArrTotal += arrTot;

    sumCurBuilding += cur.buildingTax;
    sumCurLight += cur.streetLight;
    sumCurHealth += cur.health;
    sumCurWater += cur.water;
    sumCurTotal += cur.total;

    sumTotBuilding += totBuilding;
    sumTotLight += totLight;
    sumTotHealth += totHealth;
    sumTotWater += totWater;
    sumTotGrand += totTotal;

    sumRecBuilding += recBuilding;
    sumRecLight += recLight;
    sumRecHealth += recHealth;
    sumRecWater += recWater;
    sumRecTotal += recTotal;

    sumRebate += reb;
    sumBalance += bal;
  });

  // Export to CSV specific to Demand Register format (27 Columns)
  const exportDemandCSV = () => {
    if (filtered.length === 0) return;

    const headers = [
      'अ.क्र. (Col 1)',
      'मालमत्ता क्रमांक (Col 2)',
      'मालकाचे नाव (Col 3)',
      'भोगवटा करणाऱ्याचे नाव (Col 4)',
      'थकबाकी इमारत कर (Col 5)',
      'थकबाकी दिवा बत्ती कर (Col 6)',
      'थकबाकी आरोग्यकर (Col 7)',
      'थकबाकी पाणीपट्टी (Col 8)',
      'एकूण थकबाकी (Col 9)',
      'चालू वर्ष इमारत कर (Col 10)',
      'चालू वर्ष दिवा बत्ती कर (Col 11)',
      'चालू वर्ष आरोग्यकर (Col 12)',
      'चालू वर्ष पाणीपट्टी (Col 13)',
      'एकूण चालू कर (Col 14)',
      'एकूण इमारत कर (Col 15)',
      'एकूण दिवाबत्तीकर (Col 16)',
      'एकूण आरोग्यकर (Col 17)',
      'एकूण पाणीपट्टी (Col 18)',
      'एकूण कराची रक्कम (Col 19)',
      'पावती तपशील (Col 20)',
      'वसूल इमारत कर (Col 21)',
      'वसूल दिवाबत्तीकर (Col 22)',
      'वसूल आरोग्यकर (Col 23)',
      'वसूल पाणीपट्टी (Col 24)',
      'एकूण वसूल रक्कम (Col 25)',
      'सुट (Col 26)',
      'शिल्लक रक्कम (Col 27)'
    ];

    const rows = filtered.map((item, idx) => {
      const cur = getBlockValues(item);
      const abBy = item.arrearsBuildingTax ?? 0;
      const alBy = item.arrearsStreetLightTax ?? 0;
      const ahBy = item.arrearsHealthTax ?? 0;
      const awBy = item.arrearsWaterTax ?? 0;
      const arrTot = abBy + alBy + ahBy + awBy;

      const totBuilding = abBy + cur.buildingTax;
      const totLight = alBy + cur.streetLight;
      const totHealth = ahBy + cur.health;
      const totWater = awBy + cur.water;
      const totTotal = totBuilding + totLight + totHealth + totWater;

      const recBuilding = item.recoveredBuildingTax ?? 0;
      const recLight = item.recoveredStreetLightTax ?? 0;
      const recHealth = item.recoveredHealthTax ?? 0;
      const recWater = item.recoveredWaterTax ?? 0;
      const recTotal = recBuilding + recLight + recHealth + recWater;

      const reb = item.taxRebate ?? 0;
      const bal = Math.max(0, totTotal - recTotal - reb);

      const receiptDetails = item.receiptNo 
        ? `पु.नं. ${item.receiptBookNo || '-'} पा.नं. ${item.receiptNo} दि. ${item.receiptDate || '-'}`
        : 'निरंक';

      return [
        idx + 1,
        `"${item.propertyNumber}"`,
        `"${item.ownerName}"`,
        `"${item.occupantName || ''}"`,
        abBy,
        alBy,
        ahBy,
        awBy,
        arrTot,
        cur.buildingTax,
        cur.streetLight,
        cur.health,
        cur.water,
        cur.total,
        totBuilding,
        totLight,
        totHealth,
        totWater,
        totTotal,
        `"${receiptDetails}"`,
        recBuilding,
        recLight,
        recHealth,
        recWater,
        recTotal,
        reb,
        bal
      ];
    });

    // Totals row
    rows.push([
      'एकूण (Total बेरीज)',
      '',
      '',
      '',
      sumArrBuilding,
      sumArrLight,
      sumArrHealth,
      sumArrWater,
      sumArrTotal,
      sumCurBuilding,
      sumCurLight,
      sumCurHealth,
      sumCurWater,
      sumCurTotal,
      sumTotBuilding,
      sumTotLight,
      sumTotHealth,
      sumTotWater,
      sumTotGrand,
      '',
      sumRecBuilding,
      sumRecLight,
      sumRecHealth,
      sumRecWater,
      sumRecTotal,
      sumRebate,
      sumBalance
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kar_magani_nondvahi_${gpName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger browser print window for Demand Register page
  const handlePrintRegister = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Search & Header Row */}
      <div className="bg-slate-900 border-2 border-slate-950 p-5 rounded-none flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="space-y-1 w-full md:w-auto">
          <h2 className="text-sm font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-emerald-400" />
            नवीन कर मागणी व नोंदणी पुस्तक (Demand & collection register)
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase">
            आर्थिक वर्ष: ०१ एप्रिल {assessmentYear} ते ३१ मार्च {assessmentYear+1} कालावधीतील करांची संपूर्ण थकबाकी, चालू मागणी, वसुली पुस्तक आणि शिल्लक नोंद.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={exportDemandCSV}
            disabled={filtered.length === 0}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-[10px] uppercase tracking-wider rounded-none border border-slate-700 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            रजिस्टर डाऊनलोड (CSV)
          </button>
          
          <button
            type="button"
            onClick={() => setShowQuickArrears(!showQuickArrears)}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 font-black text-[10px] uppercase tracking-wider rounded-none border transition-all cursor-pointer ${
              showQuickArrears 
                ? 'bg-amber-600 border-amber-600 text-white hover:bg-amber-700' 
                : 'bg-slate-805 hover:bg-slate-700 text-amber-400 border-amber-400/35'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            {showQuickArrears ? 'थकबाकी पॅनेल बंद करा' : 'थकबाकी जोडा (जलद पर्याय)'}
          </button>

          <button
            type="button"
            onClick={handlePrintRegister}
            disabled={filtered.length === 0}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white font-black text-[10px] uppercase tracking-wider rounded-none shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            प्रिन्ट रजिस्टर (Print)
          </button>
        </div>
      </div>

      {showQuickArrears && (
        <div className="bg-amber-50 border-2 border-amber-300 p-5 rounded-none space-y-4 shadow-md transition-all print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-2">
            <div className="flex items-center gap-2 text-amber-950">
              <Coins className="w-5 h-5 text-amber-600 animate-pulse" />
              <div>
                <h3 className="font-black text-xs uppercase tracking-wider">
                  जलद थकबाकी नोंदणी फॉर्म (Quick Arrears Entry Form)
                </h3>
                <p className="text-[9px] text-amber-800 font-bold uppercase">
                  मिळकत निवडा आणि थेट थकबाकी निश्चित करा. हे थेट जतन केले जाईल.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowQuickArrears(false)}
              className="text-amber-800 hover:text-amber-950 text-xs font-black uppercase tracking-wider"
            >
              बंद करा [x]
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Property Selector */}
            <div className="md:col-span-2 space-y-1">
              <label className="block text-[9px] font-black uppercase text-amber-900">मालमत्ता निवडा (Select Property)</label>
              <select
                value={qSelectedPropId}
                onChange={(e) => setQSelectedPropId(e.target.value)}
                className="w-full bg-white border border-amber-300 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-600 rounded-none h-[38px] cursor-pointer"
              >
                <option value="">-- मालमत्ता क्रमांक व मालक निवडा --</option>
                {assessments.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.propertyNumber} - {item.ownerName} {item.gatNumber ? `(गट क्र ${item.gatNumber})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick stats for selected property */}
            <div className="md:col-span-2 flex items-center bg-white border border-amber-200 p-2.5 text-[10px] text-amber-950 font-bold rounded-none uppercase">
              {qSelectedPropId ? (
                <div>
                  <span className="text-amber-800 block text-[8px] font-black">चालू कर आकारणी बेरीज:</span>
                  <span>
                    चालू इमारत कर: ₹{getBlockValues(assessments.find(a => a.id === qSelectedPropId)!).buildingTax} | 
                    दिवाबत्ती: ₹{getBlockValues(assessments.find(a => a.id === qSelectedPropId)!).streetLight} | 
                    आरोग्यकर: ₹{getBlockValues(assessments.find(a => a.id === qSelectedPropId)!).health} | 
                    पाणीपट्टी: ₹{getBlockValues(assessments.find(a => a.id === qSelectedPropId)!).water}
                  </span>
                </div>
              ) : (
                <span className="text-amber-700 font-bold">थकबाकी जोडण्यासाठी कृपया वरील यादीतून मालमत्ता निवडा.</span>
              )}
            </div>
          </div>

          {qSelectedPropId && (
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 pt-2 items-end">
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">इमारत कर थकबाकी</label>
                <input
                  type="number"
                  min="0"
                  value={qArrearsBuilding || ''}
                  onChange={(e) => setQArrearsBuilding(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-amber-200 px-2.5 py-1.5 font-bold font-mono text-xs text-slate-905 focus:outline-none focus:border-amber-500 rounded-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">दिवाबत्ती थकबाकी</label>
                <input
                  type="number"
                  min="0"
                  value={qArrearsStreetLight || ''}
                  onChange={(e) => setQArrearsStreetLight(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-amber-200 px-2.5 py-1.5 font-bold font-mono text-xs text-slate-905 focus:outline-none focus:border-amber-500 rounded-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">आरोग्यकर थकबाकी</label>
                <input
                  type="number"
                  min="0"
                  value={qArrearsHealth || ''}
                  onChange={(e) => setQArrearsHealth(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-amber-200 px-2.5 py-1.5 font-bold font-mono text-xs text-slate-905 focus:outline-none focus:border-amber-500 rounded-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">पाणीपट्टी थकबाकी</label>
                <input
                  type="number"
                  min="0"
                  value={qArrearsWater || ''}
                  onChange={(e) => setQArrearsWater(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-amber-200 px-2.5 py-1.5 font-bold font-mono text-xs text-slate-905 focus:outline-none focus:border-amber-500 rounded-none"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleSaveQuickArrears}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-none shadow-md transition-all cursor-pointer h-[38px]"
                >
                  <Save className="w-4 h-4" />
                  थकबाकी जतन करा
                </button>
              </div>
            </div>
          )}

          {qSavedMsg && (
            <div className="bg-emerald-100 text-emerald-955 p-2 text-xs font-black uppercase border-l-4 border-emerald-600">
              ✓ {qSavedMsg}
            </div>
          )}
        </div>
      )}

      {/* Customizable Ledger Title & Sub-heading block */}
      <div className="bg-white p-6 border border-slate-200 rounded-none shadow-sm space-y-4 print:border-none print:shadow-none print:p-0">
        <div className="bg-slate-50 p-4 border border-slate-200 rounded-none flex flex-col md:flex-row gap-4 justify-between items-center print:hidden">
          <span className="text-[10px] font-black uppercase text-indigo-950 tracking-wider">
            नोंदवही मथळा सुधारणा (Edit Register Heading Details):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto md:max-w-xl">
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase">ग्रामपंचायत</label>
              <input
                type="text"
                value={gpName}
                disabled={!!activeGPName}
                onChange={(e) => setGpName(e.target.value)}
                className={`w-full bg-white border border-slate-200 px-2 py-1 text-xs font-bold text-slate-850 rounded-none ${!!activeGPName ? 'opacity-70 bg-slate-100 cursor-not-allowed' : ''}`}
              />
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase">तालुका</label>
              <input
                type="text"
                value={talukaName}
                disabled={!!activeGPName}
                onChange={(e) => setTalukaName(e.target.value)}
                className={`w-full bg-white border border-slate-200 px-2 py-1 text-xs font-bold text-slate-850 rounded-none ${!!activeGPName ? 'opacity-70 bg-slate-100 cursor-not-allowed' : ''}`}
              />
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase">जिल्हा</label>
              <input
                type="text"
                value={districtName}
                disabled={!!activeGPName}
                onChange={(e) => setDistrictName(e.target.value)}
                className={`w-full bg-white border border-slate-200 px-2 py-1 text-xs font-bold text-slate-850 rounded-none ${!!activeGPName ? 'opacity-70 bg-slate-100 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* PRINT VIEW HEADER */}
        <div className="text-center space-y-1 pb-4 border-b border-slate-200">
          <h1 className="text-base font-black text-slate-900 tracking-tight uppercase">
            आर्थिक वर्ष: ०१ एप्रिल {assessmentYear} ते ३१ मार्च {assessmentYear+1} कालावधीतील करांची मागणी नोंदणी पुस्तक
          </h1>
          <div className="flex justify-center gap-8 text-xs font-black text-indigo-900 uppercase">
            <span>ग्रामपंचायत: {gpName}</span>
            <span>तालुका: {talukaName}</span>
            <span>जिल्हा: {districtName}</span>
          </div>
        </div>

        {/* Filters Controls */}
        <div className="flex flex-col sm:flex-row gap-4 bg-slate-50 p-3.5 border border-slate-200 rounded-none print:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="शोध: नाव किंवा मिळकत क्रमांक किंवा गट क्र..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 pl-9 pr-4 py-2.5 text-xs font-bold text-slate-900 placeholder-slate-450 focus:outline-none focus:border-indigo-500 rounded-none min-h-[38px]"
            />
          </div>

          <div className="w-full sm:w-64">
            <select
              value={selectedRoad}
              onChange={(e) => setSelectedRoad(e.target.value)}
              className="w-full bg-white border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 rounded-none min-h-[38px] cursor-pointer"
            >
              <option value="">-- सर्व रस्ते / गल्ली निवडा --</option>
              {roadsList.map((road, idx) => (
                <option key={idx} value={road}>{road}</option>
              ))}
            </select>
          </div>
        </div>

        {/* MAIN REGISTRY TABLE SCROLLABLE CONTAINER */}
        <div className="overflow-x-auto border-2 border-slate-900 print:overflow-visible">
          <table className="w-full text-left border-collapse min-w-[2100px] print:min-w-0 print:w-full">
            <thead className="bg-slate-100 text-slate-900 text-[10px] font-black uppercase text-center align-middle select-none">
              {/* Row 1 - Combined Category Groups */}
              <tr className="border-b-2 border-slate-900">
                <th colSpan={4} className="border-r border-slate-900 p-2 text-xs">मालमत्ता व मालक तपशील</th>
                <th colSpan={5} className="border-r border-slate-900 p-2 text-amber-950 bg-amber-50/50">वार्षिक कराची थकबाकी रक्कम (रुपयात)</th>
                <th colSpan={5} className="border-r border-slate-900 p-2 text-blue-950 bg-blue-50/50">वार्षिक कराची चालू रक्कम (रुपयात)</th>
                <th colSpan={5} className="border-r border-slate-900 p-2 text-indigo-950 bg-indigo-50/50">वार्षिक कराची एकूण रक्कम (रुपयात)</th>
                <th rowSpan={2} className="border-r border-slate-900 p-2 align-middle max-w-[120px]">पुस्तक नंबर पावती नंबर व दिनांक</th>
                <th colSpan={5} className="border-r border-slate-900 p-2 text-emerald-950 bg-emerald-50/50">वार्षिक कराची एकूण वसूल रक्कम (रुपयात)</th>
                <th rowSpan={2} className="border-r border-slate-900 p-2 bg-rose-50/50 text-rose-950 align-middle">सुट (Rebate)</th>
                <th rowSpan={2} className="p-2 bg-indigo-950 text-white align-middle text-xs">शिल्लक रक्कम (Col 27)</th>
                <th rowSpan={2} className="p-2 border-l border-slate-900 align-middle print:hidden">कृती</th>
              </tr>

              {/* Row 2 - Specific Fields */}
              <tr className="border-b-2 border-slate-900 bg-slate-50">
                {/* ID Columns */}
                <th className="border-r border-slate-400 p-1.5 w-10">अ.क्र.</th>
                <th className="border-r border-slate-400 p-1.5 w-24">मालमत्ता क्र.</th>
                <th className="border-r border-slate-400 p-1.5 text-left pl-2">मालकाचे धारण करणाऱ्याचे नाव</th>
                <th className="border-r border-slate-900 p-1.5 text-left pl-2">भोगवटा करणाऱ्याचे नाव</th>

                {/* Arrears Fields columns 5 - 9 */}
                <th className="border-r border-slate-400 p-1 w-16 font-bold bg-amber-50/20 text-amber-950">५. इमारत कर</th>
                <th className="border-r border-slate-400 p-1 w-16 font-bold bg-amber-50/20 text-amber-950">६. दिवा बत्ती</th>
                <th className="border-r border-slate-400 p-1 w-16 font-bold bg-amber-50/20 text-amber-950">७. आरोग्य</th>
                <th className="border-r border-slate-400 p-1 w-16 font-bold bg-amber-50/20 text-amber-950">८. पाणीपट्टी</th>
                <th className="border-r border-slate-900 p-1.5 w-20 font-black bg-amber-100/50 text-amber-950">९. एकूण</th>

                {/* Current Fields columns 10 - 14 */}
                <th className="border-r border-slate-400 p-1 w-16 font-bold bg-blue-50/20 text-blue-950">१०. इमारत कर</th>
                <th className="border-r border-slate-400 p-1 w-16 font-bold bg-blue-50/20 text-blue-950">११. दिवा बत्ती</th>
                <th className="border-r border-slate-400 p-1 w-16 font-bold bg-blue-50/20 text-blue-950">१२. आरोग्य</th>
                <th className="border-r border-slate-400 p-1 w-16 font-bold bg-blue-50/20 text-blue-950">१३. पाणीपट्टी</th>
                <th className="border-r border-slate-900 p-1.5 w-20 font-black bg-blue-100/50 text-blue-950">१४. एकूण</th>

                {/* Grand Total Arrears + Current sum columns 15 - 19 */}
                <th className="border-r border-slate-400 p-1 w-20 font-bold bg-indigo-50/20 text-indigo-950">१५. एकूण इमारत / जागा कर</th>
                <th className="border-r border-slate-400 p-1 w-20 font-bold bg-indigo-50/20 text-indigo-950">१६. दिवा बत्ती</th>
                <th className="border-r border-slate-400 p-1 w-20 font-bold bg-indigo-50/20 text-indigo-950">१७. आरोग्य</th>
                <th className="border-r border-slate-400 p-1 w-20 font-bold bg-indigo-50/20 text-indigo-950">१८. पाणीपट्टी</th>
                <th className="border-r border-slate-900 p-1.5 w-24 font-black bg-indigo-100/60 text-indigo-950">१९. एकूण</th>

                {/* Recovered Fields columns 21 - 25 */}
                <th className="border-r border-slate-400 p-1 w-20 font-bold bg-emerald-50/20 text-emerald-950">२१. एकूण इमारत / जागा कर</th>
                <th className="border-r border-slate-400 p-1 w-20 font-bold bg-emerald-50/20 text-emerald-950">२२. दिवा बत्ती</th>
                <th className="border-r border-slate-400 p-1 w-20 font-bold bg-emerald-50/20 text-emerald-950">२३. आरोग्य</th>
                <th className="border-r border-slate-400 p-1 w-20 font-bold bg-emerald-50/20 text-emerald-950">२४. पाणीपट्टी</th>
                <th className="border-r border-slate-900 p-1.5 w-24 font-black bg-emerald-100/50 text-emerald-950">२५. एकूण</th>
              </tr>

              {/* Row 3 - Numeric Index labels exactly matching the printed formats */}
              <tr className="bg-slate-200/65 font-black border-b border-slate-900 text-[9px] text-slate-800">
                <th className="border-r border-slate-400 p-0.5">१</th>
                <th className="border-r border-slate-400 p-0.5">२</th>
                <th className="border-r border-slate-400 p-0.5">३</th>
                <th className="border-r border-slate-900 p-0.5">४</th>
                <th className="border-r border-slate-400 p-0.5">५</th>
                <th className="border-r border-slate-400 p-0.5">६</th>
                <th className="border-r border-slate-400 p-0.5">७</th>
                <th className="border-r border-slate-400 p-0.5">८</th>
                <th className="border-r border-slate-900 p-0.5">९</th>
                <th className="border-r border-slate-400 p-0.5">१०</th>
                <th className="border-r border-slate-400 p-0.5">११</th>
                <th className="border-r border-slate-400 p-0.5">१२</th>
                <th className="border-r border-slate-400 p-0.5">१३</th>
                <th className="border-r border-slate-900 p-0.5">१४</th>
                <th className="border-r border-slate-400 p-0.5">१५</th>
                <th className="border-r border-slate-400 p-0.5">१६</th>
                <th className="border-r border-slate-400 p-0.5">१७</th>
                <th className="border-r border-slate-400 p-0.5">१८</th>
                <th className="border-r border-slate-900 p-0.5">१९</th>
                <th className="border-r border-slate-900 p-0.5">२०</th>
                <th className="border-r border-slate-400 p-0.5">२१</th>
                <th className="border-r border-slate-400 p-0.5">२२</th>
                <th className="border-r border-slate-400 p-0.5">२३</th>
                <th className="border-r border-slate-400 p-0.5">२४</th>
                <th className="border-r border-slate-900 p-0.5">२५</th>
                <th className="border-r border-slate-900 p-0.5">२६</th>
                <th className="border-r border-slate-900 p-0.5">२७</th>
                <th className="p-0.5 print:hidden">कृती</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-300 text-xs font-bold text-slate-900">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={28} className="p-10 text-center text-slate-400 uppercase font-black tracking-widest bg-slate-50">
                    मालमत्ता कर आकारणी नोंद सूची रिकामी आहे.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const cur = getBlockValues(item);

                  const ab = item.arrearsBuildingTax ?? 0;
                  const al = item.arrearsStreetLightTax ?? 0;
                  const ah = item.arrearsHealthTax ?? 0;
                  const aw = item.arrearsWaterTax ?? 0;
                  const arrTotal = ab + al + ah + aw;

                  const totBuilding = ab + cur.buildingTax;
                  const totLight = al + cur.streetLight;
                  const totHealth = ah + cur.health;
                  const totWater = aw + cur.water;
                  const totTotal = totBuilding + totLight + totHealth + totWater;

                  const recBuilding = item.recoveredBuildingTax ?? 0;
                  const recLight = item.recoveredStreetLightTax ?? 0;
                  const recHealth = item.recoveredHealthTax ?? 0;
                  const recWater = item.recoveredWaterTax ?? 0;
                  const recTotal = recBuilding + recLight + recHealth + recWater;

                  const reb = item.taxRebate ?? 0;
                  const bal = Math.max(0, totTotal - recTotal - reb);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors uppercase even:bg-slate-50/50">
                      {/* Sr, No & Property info */}
                      <td className="border-r border-slate-350 p-2 text-center text-[10px] text-slate-500 font-black">{idx + 1}</td>
                      <td className="border-r border-slate-350 p-2 text-center text-[11px] font-black text-indigo-950 font-mono bg-indigo-50/20">{item.propertyNumber}</td>
                      <td className="border-r border-slate-350 p-2 max-w-[200px] truncate" title={item.ownerName}>{item.ownerName}</td>
                      <td className="border-r border-slate-900 p-2 max-w-[150px] truncate text-slate-650" title={item.occupantName}>{item.occupantName || '—'}</td>

                      {/* Arrears Columns */}
                      <td className="border-r border-slate-350 p-2 text-right font-mono bg-amber-50/5 text-amber-900">{ab > 0 ? `₹${ab}` : '—'}</td>
                      <td className="border-r border-slate-350 p-2 text-right font-mono bg-amber-50/5 text-amber-900">{al > 0 ? `₹${al}` : '—'}</td>
                      <td className="border-r border-slate-350 p-2 text-right font-mono bg-amber-50/5 text-amber-900">{ah > 0 ? `₹${ah}` : '—'}</td>
                      <td className="border-r border-slate-350 p-2 text-right font-mono bg-amber-50/5 text-amber-900">{aw > 0 ? `₹${aw}` : '—'}</td>
                      <td className="border-r border-slate-900 p-2 text-right font-mono font-black bg-amber-50 text-amber-950">{arrTotal > 0 ? `₹${arrTotal}` : '—'}</td>

                      {/* Current Columns */}
                      <td className="border-r border-slate-350 p-2 text-right font-mono bg-blue-50/10 text-blue-900">{cur.buildingTax > 0 ? `₹${cur.buildingTax}` : '—'}</td>
                      <td className="border-r border-slate-350 p-2 text-right font-mono bg-blue-50/10 text-blue-900">{cur.streetLight > 0 ? `₹${cur.streetLight}` : '—'}</td>
                      <td className="border-r border-slate-350 p-2 text-right font-mono bg-blue-50/10 text-blue-900">{cur.health > 0 ? `₹${cur.health}` : '—'}</td>
                      <td className="border-r border-slate-350 p-2 text-right font-mono bg-blue-50/10 text-blue-900">{cur.water > 0 ? `₹${cur.water}` : '—'}</td>
                      <td className="border-r border-slate-900 p-2 text-right font-mono font-black bg-blue-55/10 text-blue-950">₹{cur.total}</td>

                      {/* Arrears + Current Sum Columns */}
                      <td className="border-r border-slate-350 p-2 text-right font-mono text-indigo-900 bg-indigo-50/5">₹{totBuilding}</td>
                      <td className="border-r border-slate-350 p-2 text-right font-mono text-indigo-900 bg-indigo-50/5">₹{totLight}</td>
                      <td className="border-r border-slate-350 p-2 text-right font-mono text-indigo-900 bg-indigo-50/5">₹{totHealth}</td>
                      <td className="border-r border-slate-350 p-2 text-right font-mono text-indigo-900 bg-indigo-50/5">₹{totWater}</td>
                      <td className="border-r border-slate-900 p-2 text-right font-mono font-black bg-indigo-50 text-indigo-950">₹{totTotal}</td>

                      {/* Receipt Details column 20 */}
                      <td className="border-r border-slate-900 p-1 text-center whitespace-pre-line text-[9px] font-bold leading-tight align-middle text-slate-755 bg-slate-50/40">
                        {item.receiptNo ? (
                          <div className="space-y-0.5">
                            <div>पु.नं: <span className="font-mono font-black">{item.receiptBookNo || '—'}</span></div>
                            <div>पा.नं: <span className="font-mono font-black">{item.receiptNo}</span></div>
                            <div>दि: <span className="font-mono">{item.receiptDate || '—'}</span></div>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-bold uppercase text-[8px]">निरंक</span>
                        )}
                      </td>

                      {/* Recovered Columns */}
                      <td className="border-r border-slate-350 p-2 text-right font-mono text-emerald-900 bg-emerald-50/10">{recBuilding > 0 ? `₹${recBuilding}` : '—'}</td>
                      <td className="border-r border-slate-350 p-2 text-right font-mono text-emerald-900 bg-emerald-50/10">{recLight > 0 ? `₹${recLight}` : '—'}</td>
                      <td className="border-r border-slate-350 p-2 text-right font-mono text-emerald-900 bg-emerald-50/10">{recHealth > 0 ? `₹${recHealth}` : '—'}</td>
                      <td className="border-r border-slate-350 p-2 text-right font-mono text-emerald-900 bg-emerald-50/10">{recWater > 0 ? `₹${recWater}` : '—'}</td>
                      <td className="border-r border-slate-900 p-2 text-right font-mono font-black bg-emerald-50 text-emerald-950">₹{recTotal}</td>

                      {/* Rebate Exemption Column */}
                      <td className="border-r border-slate-900 p-2 text-right font-mono text-rose-800 bg-rose-50/20">{reb > 0 ? `₹${reb}` : '—'}</td>

                      {/* Balance Column */}
                      <td className="p-2 text-right font-mono font-black text-rose-955 bg-rose-100/50 text-[13px]">
                        {bal > 0 ? `₹${bal}` : (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5">
                            <CheckCircle className="w-3 h-3" />
                            पूर्ण भरणा
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-1 px-2 text-center align-middle print:hidden whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-stretch min-w-[105px]">
                          <button
                            type="button"
                            onClick={() => openEditModal(item, true)}
                            className="inline-flex items-center justify-center gap-1 px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white font-black text-[9px] uppercase tracking-wide cursor-pointer transition-colors"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            थकबाकी जोडा
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => openEditModal(item, false)}
                            className="inline-flex items-center justify-center gap-1 px-2 py-1 bg-indigo-950 hover:bg-slate-800 text-white font-black text-[9px] uppercase tracking-wide cursor-pointer transition-colors"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                            मागणी/वसुली
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* LEDGER FOOTER ROW FOR SUM AGGREGATES */}
            {filtered.length > 0 && (
              <tfoot className="border-t-4 border-slate-950 bg-slate-200 text-slate-950 text-xs font-black text-right align-middle font-mono select-none">
                <tr>
                  <td colSpan={4} className="border-r border-slate-950 p-3.5 text-left text-[11px] font-black uppercase text-indigo-950">एकूण बेरीज (Totals):</td>
                  
                  {/* Arrears totals */}
                  <td className="border-r border-slate-350 p-2">₹{sumArrBuilding}</td>
                  <td className="border-r border-slate-350 p-2">₹{sumArrLight}</td>
                  <td className="border-r border-slate-350 p-2">₹{sumArrHealth}</td>
                  <td className="border-r border-slate-350 p-2">₹{sumArrWater}</td>
                  <td className="border-r border-slate-950 p-2 text-indigo-900 bg-slate-300">₹{sumArrTotal}</td>

                  {/* Current totals */}
                  <td className="border-r border-slate-350 p-2">₹{sumCurBuilding}</td>
                  <td className="border-r border-slate-350 p-2">₹{sumCurLight}</td>
                  <td className="border-r border-slate-350 p-2">₹{sumCurHealth}</td>
                  <td className="border-r border-slate-350 p-2">₹{sumCurWater}</td>
                  <td className="border-r border-slate-950 p-2 text-indigo-900 bg-slate-300">₹{sumCurTotal}</td>

                  {/* Grand totals of Arrears + Current */}
                  <td className="border-r border-slate-350 p-2 bg-indigo-100">₹{sumTotBuilding}</td>
                  <td className="border-r border-slate-350 p-2 bg-indigo-100">₹{sumTotLight}</td>
                  <td className="border-r border-slate-350 p-2 bg-indigo-100">₹{sumTotHealth}</td>
                  <td className="border-r border-slate-350 p-2 bg-indigo-100">₹{sumTotWater}</td>
                  <td className="border-r border-slate-950 p-2 text-indigo-950 font-extrabold bg-indigo-200">₹{sumTotGrand}</td>

                  {/* Receipt blank space */}
                  <td className="border-r border-slate-950 bg-slate-300"></td>

                  {/* Recovered totals */}
                  <td className="border-r border-slate-350 p-2">₹{sumRecBuilding}</td>
                  <td className="border-r border-slate-350 p-2">₹{sumRecLight}</td>
                  <td className="border-r border-slate-350 p-2">₹{sumRecHealth}</td>
                  <td className="border-r border-slate-350 p-2">₹{sumRecWater}</td>
                  <td className="border-r border-slate-950 p-2 text-emerald-950 bg-emerald-100">₹{sumRecTotal}</td>

                  {/* Rebate total */}
                  <td className="border-r border-slate-950 p-2 text-rose-950 bg-rose-50">₹{sumRebate}</td>

                  {/* Grand balance total */}
                  <td className="p-2 text-rose-900 bg-rose-200 font-extrabold text-[13px]">₹{sumBalance}</td>
                  <td className="print:hidden border-l border-slate-950 bg-slate-300"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        
        {/* Quick Help Summary details of columns */}
        <div className="p-4 bg-indigo-50 border border-indigo-150 rounded-none text-[10px] text-indigo-900 font-bold space-y-2 uppercase print:hidden">
          <span className="font-extrabold block text-indigo-950 border-b border-indigo-200 pb-1 text-xs">माहिती मार्गदर्शिका (Note Column Guidelines):</span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>• <b className="text-indigo-950">९. एकूण थकबाकी</b>: कॉलम ५, ६, ७, ८ ची बेरीज आहे.</div>
            <div>• <b className="text-indigo-950">१४. एकूण चालू मागणी</b>: कॉलम १०, ११, १२, १३ ची बेरीज आहे (बांधकाम कर + इतर कर).</div>
            <div>• <b className="text-indigo-950">१९. एकूण देय रक्कम</b>: थकबाकी + चालू मागणी बेरीज (उदा. १५=५+१०, १६=६+११, १७=७+१२, १८=८+१३).</div>
            <div>• <b className="text-indigo-950">२७. शिल्लक रक्कम</b>: एकूण मागणी (१९) मधून एकूण वसुली (२५) व सुट (२६) वजा करून शिल्लक उरलेला कर.</div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL DIALOG */}
      {editingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-900 w-full max-w-3xl rounded-none shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="bg-indigo-950 text-white p-4.5 border-b border-slate-900 flex justify-between items-center">
              <div className="space-y-0.5">
                <span className="block text-[10px] font-bold text-indigo-300 uppercase tracking-wider">कर मागणी व वसुली पत्रक दुरुस्ती (Demand & Collection Update)</span>
                <h3 className="text-xs font-black font-mono">
                  मिळकत क्रमांक: {editingItem.propertyNumber} | मालक: {editingItem.ownerName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-indigo-200 hover:text-white p-1 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Entry form fields */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {/* CURRENT YEAR DEMAND SUMMARY CARD */}
              <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-none">
                <span className="block text-[8px] font-black text-indigo-900 uppercase tracking-widest mb-2 border-b border-indigo-200 pb-1">चालू वर्षाची संगणकीकृत कर आकारणी (Active Assessment Demand)</span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-[10px] font-bold text-slate-800">
                  <div className="bg-white p-2 border border-slate-200">
                    <span className="block text-slate-500 uppercase text-[8px]">इमारत कर</span>
                    <span className="font-mono text-xs font-black text-indigo-950">₹{getBlockValues(editingItem).buildingTax}</span>
                  </div>
                  <div className="bg-white p-2 border border-slate-200">
                    <span className="block text-slate-500 uppercase text-[8px]">दिवाबत्ती कर</span>
                    <span className="font-mono text-xs font-black text-indigo-950">₹{getBlockValues(editingItem).streetLight}</span>
                  </div>
                  <div className="bg-white p-2 border border-slate-200">
                    <span className="block text-slate-500 uppercase text-[8px]">आरोग्यकर</span>
                    <span className="font-mono text-xs font-black text-indigo-950">₹{getBlockValues(editingItem).health}</span>
                  </div>
                  <div className="bg-white p-2 border border-slate-200">
                    <span className="block text-slate-500 uppercase text-[8px]">पाणीपट्टी</span>
                    <span className="font-mono text-xs font-black text-indigo-950">₹{getBlockValues(editingItem).water}</span>
                  </div>
                  <div className="bg-slate-900 text-white p-2 border border-slate-900 col-span-2 sm:col-span-1">
                    <span className="block text-indigo-300 uppercase text-[8px]">एकूण चालू कर</span>
                    <span className="font-mono text-xs font-black text-emerald-400">₹{getBlockValues(editingItem).total}</span>
                  </div>
                </div>
              </div>

              {/* INPUT FIELDS MAIN GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Demand & Arrears (मागची थकबाकी) */}
                <div className={`space-y-4 p-4 border rounded-none transition-all duration-300 ${
                  highlightArrearsSection 
                    ? 'bg-amber-50/75 border-amber-400 ring-2 ring-amber-400/35 scale-[1.01]' 
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                    <span className="block text-[10px] font-black text-amber-950 uppercase tracking-widest">
                      १. मागील थकबाकी रक्कम (Arrears Input)
                    </span>
                    {highlightArrearsSection && (
                      <span className="text-[8px] bg-amber-600 text-white font-black px-1.5 py-0.5 rounded-none animate-pulse">
                        थकबाकी जोडा / दुरुस्त करा
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">इमारत कर थकबाकी</label>
                      <input
                        type="number"
                        min="0"
                        value={arrearsBuilding || ''}
                        onChange={(e) => setArrearsBuilding(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 font-bold font-mono text-xs text-slate-900 focus:outline-none focus:border-indigo-500 rounded-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">दिवाबत्ती थकबाकी</label>
                      <input
                        type="number"
                        min="0"
                        value={arrearsStreetLight || ''}
                        onChange={(e) => setArrearsStreetLight(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 font-bold font-mono text-xs text-slate-900 focus:outline-none focus:border-indigo-500 rounded-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">आरोग्यकर थकबाकी</label>
                      <input
                        type="number"
                        min="0"
                        value={arrearsHealth || ''}
                        onChange={(e) => setArrearsHealth(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 font-bold font-mono text-xs text-slate-900 focus:outline-none focus:border-indigo-500 rounded-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">पाणीपट्टी थकबाकी</label>
                      <input
                        type="number"
                        min="0"
                        value={arrearsWater || ''}
                        onChange={(e) => setArrearsWater(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 font-bold font-mono text-xs text-slate-900 focus:outline-none focus:border-indigo-500 rounded-none"
                      />
                    </div>
                  </div>

                  <div className="bg-amber-100 p-2 text-right text-[10px] font-black text-amber-950 uppercase border-r-4 border-amber-600 font-mono">
                    एकूण थकबाकी: ₹{arrearsBuilding + arrearsStreetLight + arrearsHealth + arrearsWater}
                  </div>
                </div>

                {/* 2. Collection / Recovered (कर वसुली & भरणा) */}
                <div className="space-y-4 bg-slate-50 p-4 border border-slate-200 rounded-none flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-1.5 mb-2.5">
                      <span className="block text-[10px] font-black text-emerald-950 uppercase tracking-widest">
                        २. कर वसुली / भरणा वसूल रक्कम
                      </span>
                      <button
                        type="button"
                        onClick={autoFillFullyPaid}
                        className="text-[9px] text-indigo-900 hover:underline font-black uppercase flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        पूर्ण भरणा भरा (Shortcut)
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">इमारत कर वसूल</label>
                        <input
                          type="number"
                          min="0"
                          value={recoveredBuilding || ''}
                          onChange={(e) => setRecoveredBuilding(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-200 px-2.5 py-1.5 font-bold font-mono text-xs text-slate-900 focus:outline-none focus:border-indigo-500 rounded-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">दिवाबत्ती कर वसूल</label>
                        <input
                          type="number"
                          min="0"
                          value={recoveredStreetLight || ''}
                          onChange={(e) => setRecoveredStreetLight(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-200 px-2.5 py-1.5 font-bold font-mono text-xs text-slate-900 focus:outline-none focus:border-indigo-500 rounded-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">आरोग्यकर वसूल</label>
                        <input
                          type="number"
                          min="0"
                          value={recoveredHealth || ''}
                          onChange={(e) => setRecoveredHealth(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-200 px-2.5 py-1.5 font-bold font-mono text-xs text-slate-900 focus:outline-none focus:border-indigo-500 rounded-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">पाणीपट्टी वसूल</label>
                        <input
                          type="number"
                          min="0"
                          value={recoveredWater || ''}
                          onChange={(e) => setRecoveredWater(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-200 px-2.5 py-1.5 font-bold font-mono text-xs text-slate-900 focus:outline-none focus:border-indigo-500 rounded-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-100 p-2 text-right text-[10px] font-black text-emerald-950 uppercase border-r-4 border-emerald-600 font-mono mt-4">
                    एकूण वसूल रक्कम: ₹{recoveredBuilding + recoveredStreetLight + recoveredHealth + recoveredWater}
                  </div>
                </div>

                {/* 3. Receipt Details (पावती तपशील) */}
                <div className="space-y-4 bg-slate-50 p-4 border border-slate-200 rounded-none">
                  <span className="block text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2">
                    ३. वसुली पावती तपशील (Receipt Info)
                  </span>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">पुस्तक नंबर</label>
                      <input
                        type="text"
                        placeholder="उदा. ५१"
                        value={bookNo}
                        onChange={(e) => setBookNo(e.target.value)}
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 font-bold text-xs text-slate-950 focus:outline-none focus:border-indigo-500 rounded-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">पावती नंबर</label>
                      <input
                        type="text"
                        placeholder="उदा. १२०५"
                        value={receiptNo}
                        onChange={(e) => setReceiptNo(e.target.value)}
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 font-bold text-xs text-slate-950 focus:outline-none focus:border-indigo-500 rounded-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">पावती दिनांक</label>
                      <input
                        type="text"
                        placeholder="उदा. १५/०६/२०२५"
                        value={receiptDate}
                        onChange={(e) => setReceiptDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 font-bold text-xs text-slate-950 focus:outline-none focus:border-indigo-500 rounded-none"
                      />
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-450 font-bold uppercase leading-tight">
                    * वसुलीची पावती फाडल्यास येथे त्याचा निश्चित संदर्भ नोंदवा जेणेकरून नोदवही पूर्ण राहील.
                  </p>
                </div>

                {/* 4. Rebate / Discount & live Balance indicator */}
                <div className="space-y-4 bg-slate-50 p-4 border border-slate-200 rounded-none flex flex-col justify-between">
                  <div>
                    <span className="block text-[10px] font-black text-rose-950 uppercase tracking-widest border-b border-slate-200 pb-2">
                      ४. सवलत / सुट रक्कम (Tax Rebate)
                    </span>

                    <div className="mt-2.5">
                      <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">सुट दिलेली रक्कम (रुपये)</label>
                      <input
                        type="number"
                        min="0"
                        value={rebate || ''}
                        onChange={(e) => setRebate(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 font-bold font-mono text-xs text-slate-900 focus:outline-none focus:border-indigo-500 rounded-none"
                      />
                    </div>
                  </div>

                  {/* Live Outstanding calculation */}
                  {(() => {
                    const currentValues = getBlockValues(editingItem);
                    const demandVal = currentValues.buildingTax + currentValues.streetLight + currentValues.health + currentValues.water;
                    const arrearsVal = arrearsBuilding + arrearsStreetLight + arrearsHealth + arrearsWater;
                    
                    const grandDemand = demandVal + arrearsVal;
                    const totalCollected = recoveredBuilding + recoveredStreetLight + recoveredHealth + recoveredWater;
                    const remainingBalance = Math.max(0, grandDemand - totalCollected - rebate);

                    return (
                      <div className="bg-slate-900 text-white p-3 border-l-4 border-rose-500 flex justify-between items-center mt-3 font-bold text-[10px] uppercase">
                        <div>
                          <span className="block opacity-60 text-[8px]">एकूण देय कर: ₹{grandDemand}</span>
                          <span className="block opacity-60 text-[8px]">एकूण वजावट (भरणा + सुट): ₹{totalCollected + rebate}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-indigo-300 text-[8px]">शिल्लक रक्कम</span>
                          <span className="font-mono text-base font-black text-rose-400">₹{remainingBalance}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 bg-transparent text-slate-700 hover:bg-slate-200 font-bold text-xs uppercase tracking-wider rounded-none cursor-pointer"
              >
                रद्द करा (Close)
              </button>
              <button
                type="button"
                onClick={handleSaveDemand}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-950 hover:bg-slate-850 text-white font-black text-xs uppercase tracking-wider rounded-none shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                माहिती जतन करा
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
