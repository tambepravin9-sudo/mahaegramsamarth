import React, { useState, useEffect } from 'react';
import { 
  Accessibility, 
  Users, 
  Heart, 
  Save, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Coins, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { WelfareData } from '../types';

interface WelfareSchemesProps {
  activeGPName: string;
  assessmentYear: number;
  onSaveWelfare: (welfare: WelfareData) => void;
  savedWelfareList: WelfareData[];
}

export default function WelfareSchemes({
  activeGPName,
  assessmentYear,
  onSaveWelfare,
  savedWelfareList
}: WelfareSchemesProps) {
  // Available assessment years option list
  const yearOptions = [assessmentYear - 1, assessmentYear, assessmentYear + 1];
  const [selectedYear, setSelectedYear] = useState<number>(assessmentYear);

  // Form states
  const [divyangAlloc, setDivyangAlloc] = useState<string>('0');
  const [divyangExp, setDivyangExp] = useState<string>('0');
  
  const [magasAlloc, setMagasAlloc] = useState<string>('0');
  const [magasExp, setMagasExp] = useState<string>('0');

  const [mbkAlloc, setMbkAlloc] = useState<string>('0');
  const [mbkExp, setMbkExp] = useState<string>('0');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync data when selected year or list changes
  useEffect(() => {
    const existing = savedWelfareList.find(
      (item) => item.gpName === activeGPName && item.year === selectedYear
    );

    if (existing) {
      setDivyangAlloc(existing.divyangAllocation.toString());
      setDivyangExp(existing.divyangExpense.toString());
      setMagasAlloc(existing.magasvargiyaAllocation.toString());
      setMagasExp(existing.magasvargiyaExpense.toString());
      setMbkAlloc(existing.mbkAllocation.toString());
      setMbkExp(existing.mbkExpense.toString());
    } else {
      setDivyangAlloc('0');
      setDivyangExp('0');
      setMagasAlloc('0');
      setMagasExp('0');
      setMbkAlloc('0');
      setMbkExp('0');
    }
    setMessage(null);
  }, [selectedYear, savedWelfareList, activeGPName]);

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dAlloc = parseFloat(divyangAlloc) || 0;
    const dExp = parseFloat(divyangExp) || 0;
    
    const mAlloc = parseFloat(magasAlloc) || 0;
    const mExp = parseFloat(magasExp) || 0;

    const mbAlloc = parseFloat(mbkAlloc) || 0;
    const mbExp = parseFloat(mbkExp) || 0;

    if (dExp > dAlloc) {
      setMessage({
        type: 'error',
        text: 'चुकीची नोंद! ५% दिव्यांग कल्याण खर्च हा तरतूद रकमेपेक्षा जास्त असू शकत नाही.'
      });
      return;
    }
    
    if (mExp > mAlloc) {
      setMessage({
        type: 'error',
        text: 'चुकीची नोंद! १५% मागासवर्गीय कल्याण खर्च हा तरतूद रकमेपेक्षा जास्त असू शकत नाही.'
      });
      return;
    }

    if (mbExp > mbAlloc) {
      setMessage({
        type: 'error',
        text: 'चुकीची नोंद! १०% महिला व बाल कल्याण खर्च हा तरतूद रकमेपेक्षा जास्त असू शकत नाही.'
      });
      return;
    }

    const welfareEntry: WelfareData = {
      gpName: activeGPName,
      year: selectedYear,
      divyangAllocation: dAlloc,
      divyangExpense: dExp,
      magasvargiyaAllocation: mAlloc,
      magasvargiyaExpense: mExp,
      mbkAllocation: mbAlloc,
      mbkExpense: mbExp,
      lastUpdated: new Date().toISOString()
    };

    onSaveWelfare(welfareEntry);
    setMessage({
      type: 'success',
      text: 'विशेष निधी तरतूद व खर्च माहिती यशस्वीरित्या जतन करण्यात आली आहे!'
    });
  };

  const handleReset = () => {
    if (window.confirm('खरोखर या वर्षाची माहिती ० करून नव्याने भरायची आहे का?')) {
      setDivyangAlloc('0');
      setDivyangExp('0');
      setMagasAlloc('0');
      setMagasExp('0');
      setMbkAlloc('0');
      setMbkExp('0');
      setMessage(null);
    }
  };

  // Live calculations for current values
  const dAllocVal = parseFloat(divyangAlloc) || 0;
  const dExpVal = parseFloat(divyangExp) || 0;
  const dBalance = Math.max(0, dAllocVal - dExpVal);
  const dPercent = dAllocVal > 0 ? (dExpVal / dAllocVal) * 100 : 0;

  const mAllocVal = parseFloat(magasAlloc) || 0;
  const mExpVal = parseFloat(magasExp) || 0;
  const mBalance = Math.max(0, mAllocVal - mExpVal);
  const mPercent = mAllocVal > 0 ? (mExpVal / mAllocVal) * 100 : 0;

  const mbAllocVal = parseFloat(mbkAlloc) || 0;
  const mbExpVal = parseFloat(mbkExp) || 0;
  const mbBalance = Math.max(0, mbAllocVal - mbExpVal);
  const mbPercent = mbAllocVal > 0 ? (mbExpVal / mbAllocVal) * 100 : 0;

  // Total Summary
  const totalAlloc = dAllocVal + mAllocVal + mbAllocVal;
  const totalExp = dExpVal + mExpVal + mbExpVal;
  const totalBalance = totalAlloc - totalExp;
  const totalPercent = totalAlloc > 0 ? (totalExp / totalAlloc) * 100 : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Tab Header block */}
      <div className="bg-white border-2 border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1">
            शासकीय निधी विनियोग (Welfare Expenditure)
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase mt-2 flex items-center gap-2">
            <Coins className="w-6 h-6 text-indigo-600" />
            कल्याणकारी योजना विशेष निधी तरतूद व खर्च
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase mt-1">
            १५ व्या वित्त आयोग व स्वतःच्या उत्पन्नातून करावयाचा वैयक्तिक व सामूहिक लाभार्थी राखीव खर्च तपशील
          </p>
        </div>

        {/* Year Select & Active GP Banner */}
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <div className="bg-emerald-500/10 border border-emerald-550/30 text-emerald-800 p-2.5 flex items-center gap-2 text-xs font-black uppercase">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>{activeGPName}</span>
          </div>

          <div className="flex items-center bg-slate-100 border border-slate-300 p-1 rounded-none">
            <span className="px-2 text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> वर्ष:
            </span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white border border-slate-300 text-xs font-black px-2 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer text-slate-800"
            >
              {yearOptions.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}-{String(yr + 1).slice(-2)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Form + Analytics Preview Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Inputs Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: 5% Divyang */}
          <div className="bg-white border-2 border-slate-200 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-black rounded-none shrink-0 text-lg">
                <Accessibility className="w-5 h-5 text-indigo-700" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase">१) ५ % दिव्यांग कल्याण खर्च तरतूद</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">ग्रामपंचायत एकूण उत्पन्नाच्या किमान ५% निधी अपंग/दिव्यांग बांधवांच्या विकासासाठी राखीव असणे कायदेशीर बंधन आहे.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-slate-600">५% निधी तरतूद रक्कम (Budget Allocation) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={divyangAlloc}
                    onChange={(e) => setDivyangAlloc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 pl-7 pr-3 py-2.5 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none h-[42px] font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-slate-600">झालेला एकूण खर्च (Actual Spent) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={divyangExp}
                    onChange={(e) => setDivyangExp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 pl-7 pr-3 py-2.5 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none h-[42px] font-mono text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Micro Calculation Widget */}
            <div className="bg-slate-50/50 border border-slate-200/60 p-3 flex justify-between items-center text-xs text-slate-700 font-bold uppercase select-none">
              <div className="flex gap-4">
                <span>शिल्लक: <span className="font-mono font-black text-slate-900">₹{dBalance.toLocaleString('en-IN')}</span></span>
                <span>खर्च प्रमाण: <span className="font-mono font-black text-slate-900">{dPercent.toFixed(1)}%</span></span>
              </div>
              <div className="w-24 bg-slate-200 h-2 rounded-none overflow-hidden shrink-0">
                <div 
                  className={`h-full ${dPercent >= 80 ? 'bg-emerald-600' : (dPercent < 40 ? 'bg-rose-500' : 'bg-amber-500')}`}
                  style={{ width: `${Math.min(100, dPercent)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Card 2: 15% Magasvargiya */}
          <div className="bg-white border-2 border-slate-200 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-black rounded-none shrink-0 text-lg">
                <Users className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase">२) १५ % मागासवर्गीय कल्याण खर्च तरतूद</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">मागासवर्गीय समाजाच्या प्रगतीसाठी, पाणी पुरवठा आणि समाज सुधारणेसाठी राखीव निधी.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-slate-600">१५% निधी तरतूद रक्कम (Budget Allocation) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={magasAlloc}
                    onChange={(e) => setMagasAlloc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 pl-7 pr-3 py-2.5 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none h-[42px] font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-slate-600">झालेला एकूण खर्च (Actual Spent) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={magasExp}
                    onChange={(e) => setMagasExp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 pl-7 pr-3 py-2.5 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none h-[42px] font-mono text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Micro Calculation Widget */}
            <div className="bg-slate-50/50 border border-slate-200/60 p-3 flex justify-between items-center text-xs text-slate-700 font-bold uppercase select-none">
              <div className="flex gap-4">
                <span>शिल्लक: <span className="font-mono font-black text-slate-900">₹{mBalance.toLocaleString('en-IN')}</span></span>
                <span>खर्च प्रमाण: <span className="font-mono font-black text-slate-900">{mPercent.toFixed(1)}%</span></span>
              </div>
              <div className="w-24 bg-slate-200 h-2 rounded-none overflow-hidden shrink-0">
                <div 
                  className={`h-full ${mPercent >= 80 ? 'bg-emerald-600' : (mPercent < 40 ? 'bg-rose-500' : 'bg-amber-500')}`}
                  style={{ width: `${Math.min(100, mPercent)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Card 3: 10% Mahila v Bal Kalyan */}
          <div className="bg-white border-2 border-slate-200 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-black rounded-none shrink-0 text-lg">
                <Heart className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase">३) १० % महिला व बाल विकास (म.बा.क.) कल्याण खर्च तरतूद</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">ग्रामपंचायत क्षेत्रातील भगिनी व बालकांच्या पोषण, शिक्षण आणि आरोग्य सुविधांसाठी अनिवार्य १०% निधी खर्च तरतूद.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-slate-600">१०% निधी तरतूद रक्कम (Budget Allocation) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={mbkAlloc}
                    onChange={(e) => setMbkAlloc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 pl-7 pr-3 py-2.5 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none h-[42px] font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-slate-600">झालेला एकूण खर्च (Actual Spent) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={mbkExp}
                    onChange={(e) => setMbkExp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 pl-7 pr-3 py-2.5 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none h-[42px] font-mono text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Micro Calculation Widget */}
            <div className="bg-slate-50/50 border border-slate-200/60 p-3 flex justify-between items-center text-xs text-slate-700 font-bold uppercase select-none">
              <div className="flex gap-4">
                <span>शिल्लक: <span className="font-mono font-black text-slate-900">₹{mbBalance.toLocaleString('en-IN')}</span></span>
                <span>खर्च प्रमाण: <span className="font-mono font-black text-slate-900">{mbPercent.toFixed(1)}%</span></span>
              </div>
              <div className="w-24 bg-slate-200 h-2 rounded-none overflow-hidden shrink-0">
                <div 
                  className={`h-full ${mbPercent >= 80 ? 'bg-emerald-600' : (mbPercent < 40 ? 'bg-rose-500' : 'bg-amber-500')}`}
                  style={{ width: `${Math.min(100, mbPercent)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3">
            <div>
              {message && (
                <div className={`p-3 text-xs font-bold uppercase border-l-4 inline-flex items-center gap-2 ${
                  message.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-605 text-emerald-800' 
                    : 'bg-rose-50 border-rose-600 text-rose-800'
                }`}>
                  {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                  <span>{message.text}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-705 text-xs font-black uppercase rounded-none border border-slate-300 flex items-center gap-1 min-h-[40px] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                माहिती पुसा
              </button>
              
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-650 hover:bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-none shadow-md flex items-center gap-2 min-h-[40px] cursor-pointer"
              >
                <Save className="w-4 h-4" />
                माहिती जतन करा
              </button>
            </div>
          </div>

        </div>

        {/* Right Side aggregate metrics summary card */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-5 sm:p-6 border-b-8 border-indigo-600 space-y-4">
            <h3 className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest border-b border-white/10 pb-2">
              📊 एकूण जमा-खर्च विश्लेषण (Aggregated Schemes)
            </h3>

            <div className="space-y-3 pt-2 font-mono text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-sans text-xs uppercase font-bold">एकूण तरतूद (Total Budget)</span>
                <span className="font-extrabold text-white text-base">₹{totalAlloc.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-sans text-xs uppercase font-bold">एकूण खर्च (Total Spent)</span>
                <span className="font-extrabold text-emerald-400 text-base">₹{totalExp.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-2 text-rose-350">
                <span className="text-slate-400 font-sans text-xs uppercase font-bold">एकूण शिल्लक (Total Balance)</span>
                <span className="font-extrabold text-lg">₹{totalBalance.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-4 space-y-1.5 font-sans">
              <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                <span>एकूण निधी खर्च प्रमाण:</span>
                <span className="font-mono text-xs font-black text-indigo-300">{totalPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white/10 h-2.5 rounded-none overflow-hidden">
                <div 
                  className={`h-full ${totalPercent >= 75 ? 'bg-emerald-500' : (totalPercent < 45 ? 'bg-rose-500' : 'bg-amber-500')}`}
                  style={{ width: `${Math.min(100, totalPercent)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-none border border-white/10 text-[10.5px] font-medium leading-relaxed uppercase text-slate-350 space-y-2">
              <span className="font-black text-white block text-xs">💡 नियम व निकष (Rules Checklist)</span>
              <ul className="list-disc pl-4 space-y-1.5">
                <li>राखीव निधी विनियोग केवळ निर्धारित प्रवर्गाच्या कल्याणाकरिता करणे अनिवार्य आहे.</li>
                <li>मार्चअखेर अखर्चित राहिलेला निधी पुढील आर्थिक वर्षात वर्ग (Carry forward) करावा लागतो.</li>
              </ul>
            </div>
          </div>

          <div className="bg-indigo-50/50 border-2 border-indigo-100 p-5 rounded-none space-y-3.5 uppercase">
            <h4 className="text-xs font-black text-indigo-950 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-indigo-700" />
              कार्यक्षमता दर्जा (Efficiency Grade)
            </h4>
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-none font-bold text-center w-14 text-white text-base font-mono ${
                totalPercent >= 75 ? 'bg-emerald-600' : (totalPercent < 40 ? 'bg-rose-600 animate-pulse' : 'bg-amber-500')
              }`}>
                {totalPercent >= 90 ? 'A+' : totalPercent >= 75 ? 'A' : totalPercent >= 55 ? 'B' : totalPercent >= 35 ? 'C' : 'D'}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-900">
                  {totalPercent >= 75 
                    ? 'उत्कृष्ट निधी वापर! नियोजन योग्य दिशेने आहे.' 
                    : totalPercent < 40 
                    ? 'अतिशय कमी निधी विनियोग! कृपया विकासकामांना गती द्या.'
                    : 'मध्यम निधी वापर. विकासकामांत प्रगतीची आवश्यकता आहे.'}
                </p>
                <p className="text-[9px] text-slate-500 font-bold mt-0.5">सध्याचे वर्ष: {selectedYear}-{String(selectedYear + 1).slice(-2)}</p>
              </div>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
