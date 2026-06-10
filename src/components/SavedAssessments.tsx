import { useState, useEffect } from 'react';
import { PropertyAssessment } from '../types';
import { Search, Printer, Trash2, Edit3, ClipboardList, FileDown, Plus } from 'lucide-react';

interface SavedAssessmentsProps {
  assessments: PropertyAssessment[];
  onSelectAssessment: (assessment: PropertyAssessment) => void;
  onEditAssessment: (assessment: PropertyAssessment) => void;
  onDeleteAssessment: (id: string) => void;
  onAddNewAssessment: () => void;
  activeGPName?: string;
  activeGPTaluka?: string;
  activeGPDistrict?: string;
}

export default function SavedAssessments({
  assessments,
  onSelectAssessment,
  onEditAssessment,
  onDeleteAssessment,
  onAddNewAssessment,
  activeGPName,
  activeGPTaluka,
  activeGPDistrict
}: SavedAssessmentsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Editable Ledger Headers from local storage or defaults matching the PNG
  const [grampanchayat, setGrampanchayat] = useState(() => localStorage.getItem('cfg_gp') || 'पिंपळगाव कोंढिरा');
  const [taluka, setTaluka] = useState(() => localStorage.getItem('cfg_taluka') || 'संगमनेर');
  const [district, setDistrict] = useState(() => localStorage.getItem('cfg_dist') || 'अहिल्यानगर');
  const [rangeYears, setRangeYears] = useState(() => localStorage.getItem('cfg_range') || '२०२६-२०२७ ते २०२९-२०३०');

  useEffect(() => {
    if (activeGPName) {
      setGrampanchayat(activeGPName);
    }
    if (activeGPTaluka) {
      setTaluka(activeGPTaluka);
    }
    if (activeGPDistrict) {
      setDistrict(activeGPDistrict);
    }
  }, [activeGPName, activeGPTaluka, activeGPDistrict]);

  // Filter assessments based on search term and sort by propertyNumber naturally
  const filtered = assessments
    .filter(
      (item) =>
        item.propertyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.occupantName && item.occupantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.roadName && item.roadName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.gatNumber && item.gatNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => a.propertyNumber.localeCompare(b.propertyNumber, undefined, { numeric: true, sensitivity: 'base' }));

  // Compute aggregate totals for the summary dashboard and ledger footer
  const totalPropertiesSum = filtered.length;
  
  let totalAreaSqMSum = 0;
  let totalCapitalValueSum = 0;
  let totalConstructionTaxSum = 0;
  let totalStreetLightTaxSum = 0;
  let totalHealthTaxSum = 0;
  let totalWaterTaxSum = 0;
  let totalGrandTaxSum = 0;

  filtered.forEach(item => {
    item.blocks.forEach(block => {
      totalAreaSqMSum += block.areaSqM;
      totalCapitalValueSum += block.capitalValue;
      totalConstructionTaxSum += block.constructionTax;
    });
    totalStreetLightTaxSum += item.streetLightTax;
    totalHealthTaxSum += item.healthTax;
    totalWaterTaxSum += item.waterTax;
    totalGrandTaxSum += item.grandTotalTax;
  });

  // Export to full 31-column equivalent CSV
  const exportToCSV = () => {
    if (filtered.length === 0) return;
    
    // Header Row mapping the official columns
    const headers = [
      'अनुक्रमाक (Col 1)',
      'रस्त्याचे नाव/गल्लीचे नाव (Col 2)',
      'गट क्र./भूमापन क्र. (Col 3)',
      'मालमत्ता क्रमांक (Col 4)',
      'मालकाचे नाव (Col 5)',
      'भोगवटा करणाऱ्याचे नाव (Col 6)',
      'मालमत्तेचे वर्णन (Col 7)',
      'लांबी (Col 8)',
      'रुंदी (Col 9)',
      'क्षेत्रफळ (चौ.मी.) (Col 11)',
      'रेडी रेकनर दर जमीन (Col 12)',
      'रेडी रेकनर दर इमारत (Col 13)',
      'बांधकाम दर (Col 14)',
      'वय व वर्ष (Col 15)',
      'घसारा दर (Col 16)',
      'वापरानुसार भारांक (Col 17)',
      'भांडवली मूल्य (Col 18)',
      'कराचा दर (Col 19)',
      'इमारत/जागा कर (Col 20)',
      'दिवाबत्तीकर (Col 22)',
      'आरोग्यकर (Col 23)',
      'पाणीपट्टी (Col 24)',
      'एकूण कर (Col 25)',
      'अपिल निकाल इमारत (Col 26)',
      'अपिल निकाल दिवाबत्ती (Col 27)',
      'अपिल निकाल आरोग्य (Col 28)',
      'अपिल निकाल पाणीपट्टी (Col 29)',
      'अपिल निकाल एकूण (Col 30)',
      'शेरा/इतर माहिती (Col 31)'
    ];

    const rows: any[] = [];
    let counter = 1;

    filtered.forEach((item) => {
      item.blocks.forEach((block, bIdx) => {
        // Only include parent property details on the first block row to resemble ledger rowspan
        rows.push([
          bIdx === 0 ? counter : '',
          bIdx === 0 ? `"${item.roadName || ''}"` : '',
          bIdx === 0 ? `"${item.gatNumber || ''}"` : '',
          bIdx === 0 ? `"${item.propertyNumber}"` : '',
          bIdx === 0 ? `"${item.ownerName}"` : '',
          bIdx === 0 ? `"${item.occupantName || ''}"` : '',
          bIdx === 0 ? `"${item.propertyDescription || ''}"` : '',
          block.length,
          block.width,
          block.areaSqM,
          block.readyReckonerLand,
          block.readyReckonerBuilding,
          block.depreciatedBuildingRate,
          `"${block.constructionYear} (${block.buildingAge} वर्ष)"`,
          `"${block.depreciationRate}%"`,
          block.usageWeight,
          block.capitalValue,
          block.taxRate,
          block.constructionTax,
          bIdx === 0 ? item.streetLightTax : '',
          bIdx === 0 ? item.healthTax : '',
          bIdx === 0 ? item.waterTax : '',
          bIdx === 0 ? item.grandTotalTax : '',
          '—', // Col 26
          '—', // Col 27
          '—', // Col 28
          '—', // Col 29
          '—', // Col 30
          bIdx === 0 ? `"${item.propertyType && item.propertyType !== 'regular' ? `[कर माफ - ${item.propertyType === 'government' ? 'शासकीय' : item.propertyType === 'educational' ? 'शैक्षणिक' : item.propertyType === 'local_authority' ? 'स्थानिक प्राधिकरण' : 'धार्मिक'}] ` : ''}${item.notes || ''}"` : ''
        ]);
      });
      counter++;
    });

    // Add totals row
    rows.push([
      'एकूण बेरीज (Totals)', // Col 1
      '', // Col 2
      '', // Col 3
      '', // Col 4
      '', // Col 5
      '', // Col 6
      '', // Col 7
      '', // Col 8
      '', // Col 9
      totalAreaSqMSum.toFixed(3), // Col 11
      '', // Col 12
      '', // Col 13
      '', // Col 14
      '', // Col 15
      '', // Col 16
      '', // Col 17
      totalCapitalValueSum.toFixed(2), // Col 18
      '', // Col 19
      totalConstructionTaxSum.toFixed(2), // Col 20
      totalStreetLightTaxSum, // Col 22
      totalHealthTaxSum, // Col 23
      totalWaterTaxSum, // Col 24
      totalGrandTaxSum.toFixed(2), // Col 25
      '', '', '', '', '', // Col 26-30
      '' // Col 31
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kar_aakarani_nondvahi_${grampanchayat}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="saved-assessments-section" className="bg-white border-2 border-slate-200 p-4 sm:p-6 space-y-6 rounded-none">
      
      {/* Header and export actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 no-print">
        <div>
          <h2 className="text-xs font-black uppercase text-indigo-600 border-b-2 border-indigo-50 pb-1 inline-block tracking-widest">
            जतन नोंदवही (Saved Property Register Ledger)
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
            नोंदणी केलेल्या मिळकतींचा नमुना ८ नियम ३१ (१) प्रमाणे ३१ रकान्यांचा शासकीय रजिस्टर अहवाल.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {filtered.length > 0 && (
            <button
              onClick={exportToCSV}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider rounded-none transition-colors cursor-pointer min-h-[38px]"
              title="सर्व माहिती शासकीय नमुना ८ फॉरमॅट मध्ये एक्सेल मध्ये काढा"
            >
              <FileDown className="w-3.5 h-3.5 text-indigo-300" />
              एक्सेल निर्यात (Excel CSV Export)
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-650 hover:bg-indigo-750 text-white text-[10px] font-black uppercase tracking-wider rounded-none transition-colors cursor-pointer min-h-[38px]"
            title="नोंदवही छापील प्रत काढा"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-200" />
            नोंदवही प्रिंट (Print Ledger)
          </button>
        </div>
      </div>

      {/* Live Configuration bar for customized Print headings */}
      <div className="no-print bg-slate-50 border border-slate-200 p-4 rounded-none space-y-3.5">
        <span className="block text-[9px] font-black text-indigo-950 uppercase tracking-widest">
          ✏️ शासकीय नमुना ८ नोंदवही शिर्षक माहिती संपादन (Live Heading Settings for Print)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="space-y-1 bg-white p-2 border border-slate-200">
            <label className="block text-[8px] font-black text-slate-500 uppercase">१. ग्रामपंचायत नाव</label>
            <input 
              type="text" 
              value={grampanchayat} 
              disabled={!!activeGPName}
              onChange={(e) => { setGrampanchayat(e.target.value); localStorage.setItem('cfg_gp', e.target.value); }} 
              className={`w-full text-xs font-black text-slate-900 focus:outline-none focus:border-indigo-500 ${!!activeGPName ? 'opacity-70 bg-slate-50 cursor-not-allowed' : ''}`}
            />
          </div>
          <div className="space-y-1 bg-white p-2 border border-slate-200">
            <label className="block text-[8px] font-black text-slate-500 uppercase">२. तालुका</label>
            <input 
              type="text" 
              value={taluka} 
              disabled={!!activeGPName}
              onChange={(e) => { setTaluka(e.target.value); localStorage.setItem('cfg_taluka', e.target.value); }} 
              className={`w-full text-xs font-black text-slate-900 focus:outline-none ${!!activeGPName ? 'opacity-70 bg-slate-50 cursor-not-allowed' : ''}`}
            />
          </div>
          <div className="space-y-1 bg-white p-2 border border-slate-200">
            <label className="block text-[8px] font-black text-slate-500 uppercase">३. जिल्हा</label>
            <input 
              type="text" 
              value={district} 
              disabled={!!activeGPName}
              onChange={(e) => { setDistrict(e.target.value); localStorage.setItem('cfg_dist', e.target.value); }} 
              className={`w-full text-xs font-black text-slate-900 focus:outline-none ${!!activeGPName ? 'opacity-70 bg-slate-50 cursor-not-allowed' : ''}`}
            />
          </div>
          <div className="space-y-1 bg-white p-2 border border-slate-200">
            <label className="block text-[8px] font-black text-slate-500 uppercase">४. कर आकारणी कालावधी वर्ष</label>
            <input 
              type="text" 
              value={rangeYears} 
              onChange={(e) => { setRangeYears(e.target.value); localStorage.setItem('cfg_range', e.target.value); }} 
              className="w-full text-xs font-black text-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Aggregate Stats Tiles */}
      <div className="no-print grid grid-cols-2 md:grid-cols-4 gap-4 bg-indigo-950 text-white p-4">
        <div>
          <span className="block text-[8px] uppercase tracking-wider text-indigo-300 font-bold">एकूण मिळकती (Properties)</span>
          <span className="text-xl font-black font-mono">{totalPropertiesSum}</span>
        </div>
        <div>
          <span className="block text-[8px] uppercase tracking-wider text-indigo-300 font-bold">एकूण क्षेत्रफळ (SqM)</span>
          <span className="text-xl font-black font-mono">{totalAreaSqMSum.toFixed(2)} चौ.मी.</span>
        </div>
        <div>
          <span className="block text-[8px] uppercase tracking-wider text-indigo-300 font-bold">एकूण भांडवली मूल्य (Capital)</span>
          <span className="text-xl font-black font-mono">₹{totalCapitalValueSum.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
        </div>
        <div>
          <span className="block text-[8px] uppercase tracking-wider text-indigo-300 font-bold">एकूण जमा कर (Grand Total Tax)</span>
          <span className="text-xl font-black font-mono text-emerald-400">₹{totalGrandTaxSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Search Input bar */}
      <div className="relative no-print">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
          <Search className="w-4 h-4 text-slate-400" />
        </span>
        <input
          type="text"
          placeholder="शोध: मिळकत क्रमांक / मालकाचे नाव / गल्लीचे नाव / गट नंबर ने शोधा..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-none text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 min-h-[44px]"
        />
      </div>

      {/* Government register format container */}
      <div className="space-y-4">
        
        {/* Printable/Visible Title exactly of Rule 31(1) Ledger */}
        <div className="hidden print:block text-center space-y-1 pb-4">
          <h2 className="text-lg font-black tracking-widest text-slate-950 uppercase border-b-4 border-double border-slate-950 pb-1">
            नमुना नंबर.८ नियम ३१(१)
          </h2>
          <p className="text-sm font-black tracking-wide">
            आर्थिक वर्ष {rangeYears} साठी कर आकारणी नोंदवही
          </p>
          <p className="text-xs font-bold leading-relaxed">
            ग्रामपंचायत: <span className="underline font-black">{grampanchayat}</span> ,&nbsp;&nbsp;
            ता. <span className="underline font-black">{taluka}</span> ,&nbsp;&nbsp;
            जि. <span className="underline font-black">{district}</span>
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-none bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center max-w-lg mx-auto no-print">
            <div className="w-12 h-12 bg-indigo-950 text-white flex items-center justify-center mb-4 rounded-none">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">कोणतीही नोंदवही माहिती सापडली नाही!</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 mb-5 text-center leading-relaxed">
              शोधलेली मिळकत अस्तित्वात नाही किंवा जतन केलेली नाही.
            </p>
            <button
              onClick={onAddNewAssessment}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-indigo-650 text-white font-black text-[10px] uppercase tracking-wider rounded-none transition-colors cursor-pointer min-h-[38px]"
            >
              <Plus className="w-3.5 h-3.5" />
              नवीन कर आकारणी (New Entry)
            </button>
          </div>
        ) : (
          /* Wide Scrollable Table representing the 31 columns visually with pristine responsive control */
          <div className="overflow-x-auto border-2 border-slate-900 rounded-none bg-white">
            <table className="w-full text-center border-collapse border border-slate-900 text-[10px] leading-tight font-sans tracking-tight min-w-[2000px] print:min-w-[0] print:w-full">
              <thead>
                {/* Visual Header Row 1 */}
                <tr className="bg-slate-50 border-b border-slate-900 font-black text-slate-950">
                  <th rowSpan={2} className="border border-slate-900 p-2 w-[40px] text-center">अ.क्र.</th>
                  <th rowSpan={2} className="border border-slate-900 p-2 w-[120px] text-left">रस्त्याचे नाव/गल्लीचे नाव</th>
                  <th rowSpan={2} className="border border-slate-900 p-2 w-[80px] text-center">गट क्र./भूमापन क्र.</th>
                  <th rowSpan={2} className="border border-slate-900 p-2 w-[80px] text-center font-mono text-indigo-950">मालमत्ता क्रमांक</th>
                  <th rowSpan={2} className="border border-slate-900 p-2 w-[160px] text-left">मालकाचे (धारण करणाऱ्याचे) नाव</th>
                  <th rowSpan={2} className="border border-slate-900 p-2 w-[140px] text-left">भोगवटा करणाऱ्याचे नाव</th>
                  <th rowSpan={2} className="border border-slate-900 p-2 w-[120px] text-left">मालमत्तेचे वर्णन</th>
                  <th rowSpan={2} className="border border-slate-900 p-2 w-[50px] text-center">लांबी (फूट)</th>
                  <th rowSpan={2} className="border border-slate-900 p-2 w-[50px] text-center">रुंदी (फूट)</th>
                  <th rowSpan={2} className="border border-slate-900 p-2 w-[80px] text-center">क्षेत्रफळ (चौ.मी.)</th>
                  
                  {/* Ready Reckoner Column Group */}
                  <th colSpan={3} className="border border-slate-900 p-1 font-extrabold uppercase bg-indigo-50/40">रेडी रेकनर दर प्रती चौ. मी.</th>
                  
                  <th rowSpan={2} className="border border-slate-900 p-2 w-[110px] text-center">मिळकत बांधकामचे वर्ष (वय)</th>
                  <th rowSpan={2} className="border border-slate-900 p-2 w-[60px] text-center">घसारा दर</th>
                  <th rowSpan={2} className="border border-slate-900 p-2 w-[60px] text-center">वापरानुसार भारांक</th>
                  <th rowSpan={2} className="border border-slate-900 p-2 w-[110px] text-right font-mono">भांडवली मूल्य</th>
                  <th rowSpan={2} className="border border-slate-900 p-2 w-[50px] text-center">कराचा दर ‰</th>
                  
                  {/* Taxes Column Group */}
                  <th colSpan={5} className="border border-slate-900 p-1 font-extrabold bg-indigo-50/60 text-slate-900">वार्षिक कराची रक्कम (रुपयात)</th>
                  
                  {/* Alteration Group */}
                  <th colSpan={5} className="border border-slate-900 p-1 font-semibold text-slate-500 bg-slate-50">अपिलाचे निकाल व त्यावर केलेले फेरफार</th>
                  
                  <th rowSpan={2} className="border border-slate-900 p-2 w-[120px] text-left">शेरा (रिमार्क)</th>
                  <th rowSpan={2} className="border border-slate-900 p-2 w-[185px] text-center no-print bg-slate-100">कृती (Actions)</th>
                </tr>

                {/* Sub-Header Row 2 */}
                <tr className="bg-slate-50 border-b border-slate-900 font-black text-slate-950">
                  {/* Ready Reckoner */}
                  <th className="border border-slate-900 p-1 bg-indigo-50/20 text-center">जमीन</th>
                  <th className="border border-slate-900 p-1 bg-indigo-50/20 text-center">इमारत</th>
                  <th className="border border-slate-900 p-1 bg-indigo-50/20 text-center">बांधकाम दर</th>

                  {/* Taxes */}
                  <th className="border border-slate-900 p-1 bg-indigo-50/30 text-right">इमारत/जागा कर</th>
                  <th className="border border-slate-900 p-1 bg-indigo-50/30 text-right">दिवाबत्तीकर</th>
                  <th className="border border-slate-900 p-1 bg-indigo-50/30 text-right">आरोग्यकर</th>
                  <th className="border border-slate-900 p-1 bg-indigo-50/30 text-right">पाणीपट्टी</th>
                  <th className="border border-slate-900 p-1 bg-emerald-50 text-right text-emerald-950">एकूण वार्षिक कर</th>

                  {/* Appeal results */}
                  <th className="border border-slate-900 p-1 text-center text-slate-400 font-bold text-[9px]">इमारत</th>
                  <th className="border border-slate-900 p-1 text-center text-slate-400 font-bold text-[9px]">दिवाबत्ती</th>
                  <th className="border border-slate-900 p-1 text-center text-slate-400 font-bold text-[9px]">आरोग्य</th>
                  <th className="border border-slate-900 p-1 text-center text-slate-400 font-bold text-[9px]">पाणीपट्टी</th>
                  <th className="border border-slate-900 p-1 text-center text-slate-400 font-bold text-[9px]">एकूण</th>
                </tr>

                {/* Precise Marathi Column Numbering Sequence identical to the PNG */}
                <tr className="bg-slate-200 text-slate-800 text-[8px] font-bold border-b border-slate-900 select-none">
                  <td className="border border-slate-900 p-0.5">१</td>
                  <td className="border border-slate-900 p-0.5">२</td>
                  <td className="border border-slate-900 p-0.5">३</td>
                  <td className="border border-slate-900 p-0.5 font-mono">४</td>
                  <td className="border border-slate-900 p-0.5">५</td>
                  <td className="border border-slate-900 p-0.5">६</td>
                  <td className="border border-slate-900 p-0.5">७</td>
                  <td className="border border-slate-900 p-0.5">८</td>
                  <td className="border border-slate-900 p-0.5">९</td>
                  <td className="border border-slate-900 p-0.5">११</td>
                  
                  {/* RR numbers */}
                  <td className="border border-slate-900 p-0.5">१२</td>
                  <td className="border border-slate-900 p-0.5">१३</td>
                  <td className="border border-slate-900 p-0.5">१४</td>
                  
                  <td className="border border-slate-900 p-0.5">१५</td>
                  <td className="border border-slate-900 p-0.5">१६</td>
                  <td className="border border-slate-900 p-0.5">१७</td>
                  <td className="border border-slate-900 p-0.5">१८</td>
                  <td className="border border-slate-900 p-0.5 font-sans">१९</td>
                  
                  {/* Surcharges numbers */}
                  <td className="border border-slate-900 p-0.5">२०</td>
                  <td className="border border-slate-900 p-0.5">२२</td>
                  <td className="border border-slate-900 p-0.5">२३</td>
                  <td className="border border-slate-900 p-0.5">२४</td>
                  <td className="border border-slate-900 p-0.5 text-emerald-950 font-bold">२५</td>
                  
                  {/* Appeal numbers */}
                  <td className="border border-slate-900 p-0.5">२६</td>
                  <td className="border border-slate-900 p-0.5">२७</td>
                  <td className="border border-slate-900 p-0.5">२८</td>
                  <td className="border border-slate-900 p-0.5">२९</td>
                  <td className="border border-slate-900 p-0.5">३०</td>
                  
                  <td className="border border-slate-900 p-0.5">३१</td>
                  <td className="border border-slate-900 p-0.5 no-print bg-slate-200">कृती</td>
                </tr>
              </thead>

              <tbody className="divide-y-2 divide-slate-900 text-slate-950 text-[10px] font-bold">
                {filtered.map((item, index) => {
                  const blocksCount = item.blocks.length;
                  
                  return item.blocks.map((block, blockIdx) => (
                    <tr 
                      key={`${item.id}_block_${block.id}`} 
                      className={`hover:bg-slate-50 transition-colors ${blockIdx === 0 ? 'border-t-2 border-slate-900' : 'border-t border-slate-200'}`}
                    >
                      {/* Rowspan parent-level cells on blockIdx === 0 */}
                      {blockIdx === 0 && (
                        <>
                          <td rowSpan={blocksCount} className="border border-slate-900 p-2 text-center align-middle bg-slate-50/50">
                            {index + 1}
                          </td>
                          <td rowSpan={blocksCount} className="border border-slate-900 p-2 text-left align-middle break-words whitespace-normal max-w-[120px]">
                            {item.roadName || '—'}
                          </td>
                          <td rowSpan={blocksCount} className="border border-slate-900 p-2 text-center align-middle whitespace-normal break-words max-w-[80px]">
                            {item.gatNumber || '—'}
                          </td>
                          <td rowSpan={blocksCount} className="border border-slate-900 p-2 text-center align-middle font-mono font-black text-indigo-950 text-[11px]">
                            {item.propertyNumber}
                          </td>
                          <td rowSpan={blocksCount} className="border border-slate-900 p-2 text-left align-middle font-extrabold text-[11px] whitespace-normal max-w-[160px]">
                            {item.ownerName}
                          </td>
                          <td rowSpan={blocksCount} className="border border-slate-900 p-2 text-left align-middle text-slate-650 text-[10px] whitespace-normal max-w-[140px]">
                            {item.occupantName || '—'}
                          </td>
                          <td rowSpan={blocksCount} className="border border-slate-900 p-2 text-left align-middle text-slate-550 leading-tight whitespace-normal max-w-[120px]">
                            {item.propertyDescription || '—'}
                          </td>
                        </>
                      )}

                      {/* Block level measurement cells always shown */}
                      <td className="border border-slate-900 p-2 text-center">
                        {block.length}
                      </td>
                      <td className="border border-slate-900 p-2 text-center">
                        {block.width}
                      </td>
                      <td className="border border-slate-900 p-2 text-center font-mono font-semibold">
                        {block.areaSqM.toFixed(3)}
                      </td>
                      <td className="border border-slate-900 p-2 text-center font-mono text-slate-500">
                        ₹{block.readyReckonerLand}
                      </td>
                      <td className="border border-slate-900 p-2 text-center font-mono text-slate-500">
                        ₹{block.readyReckonerBuilding}
                      </td>
                      <td className="border border-slate-900 p-2 text-center font-mono text-slate-900 font-extrabold">
                        ₹{block.depreciatedBuildingRate.toFixed(0)}
                      </td>
                      <td className="border border-slate-900 p-2 text-center whitespace-nowrap">
                        {block.constructionYear} <span className="text-[8px] text-slate-500 font-bold">({block.buildingAge} वर्ष)</span>
                      </td>
                      <td className="border border-slate-900 p-2 text-center font-mono text-amber-900">
                        {block.depreciationRate}%
                      </td>
                      <td className="border border-slate-900 p-2 text-center font-mono text-indigo-900">
                        {block.usageWeight}
                      </td>
                      <td className="border border-slate-900 p-2 text-right font-mono font-black text-rose-950">
                        ₹{block.capitalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="border border-slate-900 p-2 text-center font-mono text-indigo-900 text-xs">
                        {block.taxRate}
                      </td>
                      <td className="border border-slate-900 p-2 text-right font-mono text-indigo-950 font-black">
                        ₹{block.constructionTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>

                      {/* Rowspan Surcharge assessments on blockIdx === 0 */}
                      {blockIdx === 0 && (
                        <>
                          <td rowSpan={blocksCount} className="border border-slate-900 p-2 text-right font-mono text-amber-700 align-middle">
                            ₹{item.streetLightTax}
                          </td>
                          <td rowSpan={blocksCount} className="border border-slate-900 p-2 text-right font-mono text-emerald-800 align-middle">
                            ₹{item.healthTax}
                          </td>
                          <td rowSpan={blocksCount} className="border border-slate-900 p-2 text-right font-mono text-blue-800 align-middle">
                            ₹{item.waterTax}
                          </td>
                          <td rowSpan={blocksCount} className="border border-slate-900 p-2 text-right font-mono text-emerald-950 font-black text-xs bg-emerald-50/60 align-middle">
                            ₹{item.grandTotalTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </td>
                          
                          {/* Blank Appeal results to mimic physical register format Columns 26-30 */}
                          <td rowSpan={blocksCount} className="border border-slate-900 p-2 text-center font-bold text-slate-300 align-middle">
                            —
                          </td>
                          <td rowSpan={blocksCount} className="border border-slate-900 p-2 text-center font-bold text-slate-300 align-middle">
                            —
                          </td>
                          <td rowSpan={blocksCount} className="border border-slate-900 p-2 text-center font-bold text-slate-300 align-middle">
                            —
                          </td>
                          <td rowSpan={blocksCount} className="border border-slate-900 p-2 text-center font-bold text-slate-300 align-middle">
                            —
                          </td>
                          <td rowSpan={blocksCount} className="border border-slate-900 p-2 text-center font-bold text-slate-300 align-middle">
                            —
                          </td>

                          {/* Notes column rowSpan */}
                          <td rowSpan={blocksCount} className="border border-slate-900 p-2 text-left text-slate-800 align-middle font-normal break-words max-w-[124px]">
                            {item.propertyType && item.propertyType !== 'regular' && (
                              <div className="mb-1.5 px-1.5 py-1 bg-red-50 text-rose-800 font-black text-[9px] border-l-2 border-red-500 rounded-none leading-normal">
                                कर मुक्त: {item.propertyType === 'government' ? 'शासकीय' : item.propertyType === 'educational' ? 'शैक्षणिक' : item.propertyType === 'local_authority' ? 'स्थानिक प्रा.' : 'धार्मिक'}
                              </div>
                            )}
                            <div className="text-slate-600 text-[10px]">{item.notes || '—'}</div>
                          </td>

                          {/* Interactive Action Menu Column on screens */}
                          <td rowSpan={blocksCount} className="border border-slate-900 p-2 text-center whitespace-nowrap bg-slate-50/50 align-middle no-print">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onSelectAssessment(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-950 hover:bg-indigo-900 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-none cursor-pointer min-h-[28px]"
                                title="पावती / कर बिल प्रिंट करा"
                              >
                                <Printer className="w-3 h-3" />
                                <span>पावती</span>
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => onEditAssessment(item)}
                                className="p-1 px-2 text-indigo-900 hover:bg-indigo-50 border border-indigo-200 rounded-none transition-colors cursor-pointer min-h-[28px] flex items-center justify-center"
                                title="या आकारणीत दुरुस्ती करा"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`खरोखर मिळकत क्रमांक ${item.propertyNumber} चा सर्व आकारणी आणि मोजणी इतिहास नोंदवहीतून कायमचा मिटवून टाकायचा का?`)) {
                                    onDeleteAssessment(item.id);
                                  }
                                }}
                                className="p-1 px-2 text-slate-400 hover:text-white hover:bg-rose-600 border border-slate-200 hover:border-rose-600 rounded-none transition-all cursor-pointer min-h-[28px] flex items-center justify-center"
                                title="मिळून आलेला डेटा मिटवा"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                })}

                {/* Aggregate Totals row at the bottom of the registry */}
                <tr className="bg-slate-100 font-black border-t-4 border-double border-slate-950 text-slate-950 text-[10px]">
                  <td colSpan={7} className="border border-slate-900 p-3.5 text-right font-black uppercase text-indigo-950 text-[11px]">
                    एकूण एकत्रित बेरीज (Aggregate Register Totals):
                  </td>
                  <td className="border border-slate-900 p-2"></td>
                  <td className="border border-slate-900 p-2"></td>
                  <td className="border border-slate-900 p-2 font-mono">{totalAreaSqMSum.toFixed(3)}</td>
                  <td className="border border-slate-900 p-2"></td>
                  <td className="border border-slate-900 p-2"></td>
                  <td className="border border-slate-900 p-2"></td>
                  <td className="border border-slate-900 p-2"></td>
                  <td className="border border-slate-900 p-2"></td>
                  <td className="border border-slate-900 p-2"></td>
                  <td className="border border-slate-900 p-2 font-mono">₹{totalCapitalValueSum.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                  <td className="border border-slate-900 p-2"></td>
                  <td className="border border-slate-900 p-2 font-mono text-[11px] text-slate-955">₹{totalConstructionTaxSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="border border-slate-900 p-2 font-mono text-amber-800">₹{totalStreetLightTaxSum}</td>
                  <td className="border border-slate-900 p-2 font-mono text-emerald-800">₹{totalHealthTaxSum}</td>
                  <td className="border border-slate-900 p-2 font-mono text-blue-800">₹{totalWaterTaxSum}</td>
                  <td colSpan={1} className="border border-slate-900 p-2 font-mono text-[11px] text-emerald-950 bg-emerald-50 font-black">
                    ₹{totalGrandTaxSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  {/* Appeals */}
                  <td className="border border-slate-900 p-2 text-slate-300">—</td>
                  <td className="border border-slate-900 p-2 text-slate-300">—</td>
                  <td className="border border-slate-900 p-2 text-slate-300">—</td>
                  <td className="border border-slate-900 p-2 text-slate-300">—</td>
                  <td className="border border-slate-900 p-2 text-slate-300">—</td>
                  
                  <td className="border border-slate-900 p-2"></td>
                  <td className="border border-slate-900 p-2 no-print bg-slate-100"></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
