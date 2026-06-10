import { useState, FormEvent } from 'react';
import { PropertyAssessment, WelfareData } from '../types';
import { 
  Building2, 
  Lock, 
  Unlock, 
  Coins, 
  ArrowRight, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle,
  UserCheck,
  CheckCircle,
  HelpCircle,
  Info,
  Trash2,
  LayoutGrid,
  List,
  KeyRound,
  Calendar,
  Accessibility,
  Users,
  Heart
} from 'lucide-react';

export interface GramPanchayat {
  name: string;
  adminPassword?: string;
  taluka?: string;
  district?: string;
}

interface HomeDashboardProps {
  registeredGPs: GramPanchayat[];
  savedAssessments: PropertyAssessment[];
  activeGP: GramPanchayat | null;
  onLogin: (gpName: string, password?: string) => boolean;
  onLogout: () => void;
  onRegisterGP: (name: string, password?: string, taluka?: string, district?: string) => boolean;
  onSwitchTab: (tab: 'new-assessment' | 'saved-list' | 'demand-register' | 'settings') => void;
  isPSAdminActive?: boolean;
  onPSLogin?: (password?: string) => boolean;
  onPSLogout?: () => void;
  onDeleteGP?: (gpName: string) => void;
  savedWelfareList?: WelfareData[];
  assessmentYear?: number;
}


export default function HomeDashboard({
  registeredGPs,
  savedAssessments,
  activeGP,
  onLogin,
  onLogout,
  onRegisterGP,
  onSwitchTab,
  isPSAdminActive = false,
  onPSLogin,
  onPSLogout,
  onDeleteGP,
  savedWelfareList = [],
  assessmentYear = 2026
}: HomeDashboardProps) {
  // View mode format default is 'list' as requested!
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [dashboardSubTab, setDashboardSubTab] = useState<'recovery' | 'welfare'>('recovery');
  const [selectedWelfareYear, setSelectedWelfareYear] = useState<number>(assessmentYear);

  // Panchayat Samiti Admin login/logout states
  const [showPSLoginModal, setShowPSLoginModal] = useState(false);
  const [psPassword, setPsPassword] = useState('');
  const [psError, setPsError] = useState('');

  // Login modal / section state
  const [selectedGPForLogin, setSelectedGPForLogin] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // New States to handle the inline dropdown login directly on the main page
  const [selectedGPName, setSelectedGPName] = useState<string>('');
  const [gpPass, setGpPass] = useState<string>('');
  const [gpError, setGpError] = useState<string>('');

  const [psAdminPass, setPsAdminPass] = useState<string>('');
  const [psAdminError, setPsAdminError] = useState<string>('');

  const [loginTab, setLoginTab] = useState<'gp' | 'ps'>('gp');

  // Register state
  const [newGPName, setNewGPName] = useState('');
  const [newGPPassword, setNewGPPassword] = useState('admin');
  const [newGPTaluka, setNewGPTaluka] = useState('संगमनेर');
  const [newGPDistrict, setNewGPDistrict] = useState('अहिल्यानगर');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerError, setRegisterError] = useState('');

  // Calculate GP aggregates
  const gpStats = registeredGPs.map(gp => {
    // Filter property sheets for this specific GP
    const gpProperties = savedAssessments.filter(item => item.grampanchayat === gp.name);

    let totalDemand = 0;
    let totalRecovered = 0;

    gpProperties.forEach(prop => {
      // Current demand
      const currentVal = prop.grandTotalTax || 0;
      // Arrears
      const arrearsVal = (prop.arrearsBuildingTax || 0) + 
                         (prop.arrearsStreetLightTax || 0) + 
                         (prop.arrearsHealthTax || 0) + 
                         (prop.arrearsWaterTax || 0);
      
      const totalPropDemand = currentVal + arrearsVal;
      totalDemand += totalPropDemand;

      // Recovered
      const recVal = (prop.recoveredBuildingTax || 0) + 
                     (prop.recoveredStreetLightTax || 0) + 
                     (prop.recoveredHealthTax || 0) + 
                     (prop.recoveredWaterTax || 0);
      
      totalRecovered += recVal;
    });

    const recoveryPercentage = totalDemand > 0 ? (totalRecovered / totalDemand) * 100 : 0;
    const balance = Math.max(0, totalDemand - totalRecovered);

    return {
      gp,
      propertyCount: gpProperties.length,
      totalDemand,
      totalRecovered,
      balance,
      recoveryPercentage
    };
  });

  // Determine low vs high recovery bands for red/green marking
  // Red: lowest recovery GP, or < 40%
  // Green: highest recovery GP, or >= 70%
  const validPercentStats = gpStats.filter(s => s.totalDemand > 0);
  let minPct = 101;
  let maxPct = -1;

  if (validPercentStats.length > 0) {
    validPercentStats.forEach(s => {
      if (s.recoveryPercentage < minPct) minPct = s.recoveryPercentage;
      if (s.recoveryPercentage > maxPct) maxPct = s.recoveryPercentage;
    });
  }

  const welfareGrandSum = (() => {
    let dAlloc = 0;
    let dExp = 0;
    let mAlloc = 0;
    let mExp = 0;
    let mbAlloc = 0;
    let mbExp = 0;

    registeredGPs.forEach(gp => {
      const currentWelfare = savedWelfareList.find(w => w.gpName === gp.name && w.year === selectedWelfareYear);
      if (currentWelfare) {
        dAlloc += currentWelfare.divyangAllocation || 0;
        dExp += currentWelfare.divyangExpense || 0;
        mAlloc += currentWelfare.magasvargiyaAllocation || 0;
        mExp += currentWelfare.magasvargiyaExpense || 0;
        mbAlloc += currentWelfare.mbkAllocation || 0;
        mbExp += currentWelfare.mbkExpense || 0;
      }
    });

    return { dAlloc, dExp, mAlloc, mExp, mbAlloc, mbExp };
  })();

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedGPForLogin) return;

    const success = onLogin(selectedGPForLogin, password);
    if (success) {
      setSelectedGPForLogin(null);
      setPassword('');
      setLoginError('');
    } else {
      setLoginError('चुकीचा पासवर्ड! कृपया पुन्हा प्रयत्न करा.');
    }
  };

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newGPName.trim()) {
      setRegisterError('कृपया ग्रामपंचायतीचे नाव प्रविष्ट करा.');
      return;
    }

    const success = onRegisterGP(newGPName.trim(), newGPPassword, newGPTaluka, newGPDistrict);
    if (success) {
      setRegisterSuccess('नवीन ग्रामपंचायत यशस्वीरीत्या नोंदणीकृत झाली!');
      setNewGPName('');
      setNewGPPassword('admin');
      setRegisterError('');
      setTimeout(() => setRegisterSuccess(''), 4000);
    } else {
      setRegisterError('या नावाची ग्रामपंचायत आधीपासून नोंदणीकृत आहे.');
    }
  };

  // Log in quick helper
  const openLoginForGP = (gpName: string) => {
    setSelectedGPForLogin(gpName);
    setPassword('admin'); // prefilled for simple UX
    setLoginError('');
  };

  const handlePSLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onPSLogin && onPSLogin(psPassword)) {
      setPsPassword('');
      setPsError('');
      setShowPSLoginModal(false);
    } else {
      setPsError('चुकीचा मुख्य प्रशासक पासवर्ड! कृपया पुन्हा प्रयत्न करा.');
    }
  };

  const handleDeleteGPClick = (gpName: string) => {
    if (window.confirm(`खरोखर ${gpName} ग्रामपंचायत आणि त्या अंतर्गत असणाऱ्या मिळकतींचा सर्व डेटा काढून टाकायचा आहे का?`)) {
      if (onDeleteGP) {
        onDeleteGP(gpName);
      }
    }
  };

  const handleInlineGPLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedGPName) {
      setGpError('कृपया प्रथम यादीमधून आपली ग्रामपंचायत निवडा.');
      return;
    }
    const success = onLogin(selectedGPName, gpPass);
    if (success) {
      setSelectedGPName('');
      setGpPass('');
      setGpError('');
    } else {
      setGpError('चुकीचा पासवर्ड! कृपया पुन्हा प्रयत्न करा (मूळाक्षर लहान-मोठे तपासा).');
    }
  };

  const handleInlinePSLogin = (e: FormEvent) => {
    e.preventDefault();
    if (onPSLogin && onPSLogin(psAdminPass)) {
      setPsAdminPass('');
      setPsAdminError('');
    } else {
      setPsAdminError('चुकीचा मुख्य प्रशासक पासवर्ड! कृपया पुन्हा प्रयत्न करा.');
    }
  };

  if (!activeGP && !isPSAdminActive) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* 1. Header Hero Panel */}
        <div className="gradient-header bg-slate-900 border-2 border-slate-800 text-white p-6 sm:p-8 rounded-none relative overflow-hidden shadow-2xl text-center">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
          
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-extrabold text-[10px] uppercase tracking-wider rounded-none mb-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              ग्रामपंचायत मालमत्ता कर प्रणाली
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white leading-tight uppercase">
              कर निर्धारण, मागणी व वसुली मुख्य केंद्र
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto font-semibold leading-relaxed">
              खालील लॉगिन टॅबमधून आपली ग्रामपंचायत निवडून किंवा "PS Admin" निवडून थेट लॉगिन करा.
            </p>
          </div>
        </div>

        {/* 2. Login Tab & Form Box */}
        <div className="max-w-md mx-auto">
          <div className="bg-white border-4 border-slate-900 p-5 sm:p-6 shadow-2xl relative">
            
            {/* Tab selector */}
            <div className="flex border-b-2 border-slate-200 mb-6 font-semibold select-none">
              <button
                type="button"
                onClick={() => { setLoginTab('gp'); setGpError(''); setPsAdminError(''); }}
                className={`flex-1 pb-3 text-xs font-black uppercase tracking-wider text-center border-b-4 transition-all cursor-pointer ${
                  loginTab === 'gp' 
                    ? 'border-indigo-600 text-slate-950 font-black' 
                    : 'border-transparent text-slate-500 hover:text-slate-950'
                }`}
              >
                १. ग्रामपंचायत लॉगिन
              </button>
              <button
                type="button"
                onClick={() => { setLoginTab('ps'); setGpError(''); setPsAdminError(''); }}
                className={`flex-1 pb-3 text-xs font-black uppercase tracking-wider text-center border-b-4 transition-all cursor-pointer ${
                  loginTab === 'ps' 
                    ? 'border-indigo-600 text-slate-950 font-black' 
                    : 'border-transparent text-slate-500 hover:text-slate-950'
                }`}
              >
                २. PS Admin लॉगिन
              </button>
            </div>

            {loginTab === 'gp' ? (
              <form onSubmit={handleInlineGPLogin} className="space-y-4">
                <div className="text-xs text-indigo-850 bg-indigo-50 p-3 border border-indigo-150 font-medium leading-relaxed">
                  ⚡ लॉगिन करण्यासाठी आपली ग्रामपंचायत निवडा व पासवर्ड लिहा.
                  <br />
                  <span className="text-slate-600 font-extrabold block mt-1">💡 सोयीसाठी मूळ पासवर्ड <strong className="underline text-indigo-850">"admin"</strong> ठेवलेला आहे.</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-600 tracking-wider">१. ग्रामपंचायत निवडा (Select Grampanchayat)</label>
                  <select
                    value={selectedGPName}
                    onChange={(e) => { setSelectedGPName(e.target.value); setGpError(''); }}
                    required
                    className="w-full bg-slate-50 border-2 border-slate-300 text-slate-950 px-3 py-2.5 text-sm font-black focus:outline-none focus:border-indigo-600 rounded-none cursor-pointer text-ellipsis overflow-hidden"
                  >
                    <option value="">-- यादीमधून ग्रामपंचायत निवडा --</option>
                    {registeredGPs.map((gp) => (
                      <option key={gp.name} value={gp.name} className="font-extrabold text-slate-900">
                        {gp.name} (तालुका: {gp.taluka || 'संगमनेर'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-600 tracking-wider">२. अ‍ॅडमीन पासवर्ड (Password)</label>
                  <input
                    type="password"
                    required
                    placeholder="पासवर्ड टाईप करा..."
                    value={gpPass}
                    onChange={(e) => { setGpPass(e.target.value); setGpError(''); }}
                    className="w-full bg-slate-50 border-2 border-slate-300 text-slate-900 px-3 py-2.5 text-sm font-black focus:outline-none focus:border-indigo-600 rounded-none font-mono"
                  />
                </div>

                {gpError && (
                  <p className="text-xs text-rose-650 font-black uppercase leading-normal border-l-4 border-rose-500 bg-rose-50 p-2">{gpError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-950 hover:bg-indigo-700 active:bg-indigo-950 text-white font-extrablack text-xs uppercase tracking-widest rounded-none transition-all cursor-pointer flex justify-center items-center gap-1.5 min-h-[44px]"
                >
                  <Unlock className="w-4 h-4 text-emerald-400 shrink-0" />
                  लॉगिन करा (Log In)
                </button>
              </form>
            ) : (
              <form onSubmit={handleInlinePSLogin} className="space-y-4">
                <div className="text-xs text-indigo-850 bg-indigo-50 p-3 border border-indigo-150 font-medium leading-relaxed">
                  🔑 हा टॅब केवळ पंचायत समिती अ‍ॅडमीन करिता आहे. (मूळ पासवर्ड <strong className="underline">"admin"</strong> ठेवा)
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-600 tracking-wider font-extrabold">मुख्य प्रशासक पासवर्ड (PS Admin Password)</label>
                  <input
                    type="password"
                    required
                    placeholder="Password टाईप करा..."
                    value={psAdminPass}
                    onChange={(e) => { setPsAdminPass(e.target.value); setPsAdminError(''); }}
                    className="w-full bg-slate-50 border-2 border-slate-300 text-slate-900 px-3 py-2.5 text-sm font-black focus:outline-none focus:border-indigo-600 rounded-none font-mono"
                  />
                </div>

                {psAdminError && (
                  <p className="text-xs text-rose-650 font-black uppercase leading-normal border-l-4 border-rose-500 bg-rose-50 p-2">{psAdminError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-950 hover:bg-indigo-700 active:bg-indigo-950 text-white font-extrablack text-xs uppercase tracking-widest rounded-none transition-all cursor-pointer flex justify-center items-center gap-1.5 min-h-[44px]"
                >
                  <Lock className="w-4 h-4 text-white shrink-0" />
                  PS Admin लॉगिन करा (Sign In)
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* 1. Hero Welcomer Card */}
      <div className="gradient-header bg-slate-900 border-2 border-slate-800 text-white p-6 sm:p-8 rounded-none relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-extrabold text-[10px] uppercase tracking-wider rounded-none mb-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              ग्रामपंचायत मालमत्ता कर प्रणाली
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight uppercase">
              {activeGP 
                ? `स्वागत आहे, ${activeGP.name} ग्रामपंचायत` 
                : 'कर निर्धारण, मागणी व वसुली मुख्य केंद्र'
              }
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-semibold leading-relaxed">
              {activeGP 
                ? 'आपण अॅडमीन पॅनेलमध्ये लॉगिन आहात. आपण नवीन मिळकत कर आकारणी, चालू मागणी रजिस्टर, वसुली नोंद करणे व नमुना ८ अहवाल काढणे इत्यादी सर्व कामे करू शकता.' 
                : 'खालील ग्रामपंचायतींमधून आपल्या ग्रामपंचायत नावावर क्लिक करा आणि "अ‍ॅडमीन लॉगिन" करून पुढील कामकाज व्यवस्थापित करा.'
              }
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 min-w-[210px]">
            {activeGP ? (
              <div className="flex flex-col items-stretch gap-1.5 p-2.5 bg-emerald-500/10 border border-emerald-500/30">
                <div className="text-emerald-400 text-center text-[11px] font-black uppercase flex items-center justify-center gap-1.5 py-1">
                  <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{activeGP.name}</span>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-[10px] font-black uppercase tracking-widest transition-all rounded-none cursor-pointer text-center"
                >
                  लॉग आऊट
                </button>
              </div>
            ) : (
              <div className="p-2 border border-slate-700 bg-slate-950/40 text-[10px] text-slate-300 font-bold uppercase text-center leading-normal">
                🔑 कामे करण्यासाठी आधी आपल्या ग्रामपंचायतीचे लॉगिन करा
              </div>
            )}

            {isPSAdminActive ? (
              <div className="flex flex-col items-stretch gap-1 p-2.5 bg-indigo-500/10 border border-indigo-500/30">
                <div className="text-indigo-300 text-center text-[10px] font-black uppercase flex items-center justify-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>मुख्य प्रशासक (PS Admin)</span>
                </div>
                <button
                  type="button"
                  onClick={onPSLogout}
                  className="px-3 py-1 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-200 text-[10px] font-black uppercase tracking-wider transition-all rounded-none cursor-pointer text-center"
                >
                  समिती लॅागआऊट
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-stretch gap-1 p-2.5 bg-slate-950/60 border border-slate-800">
                <div className="text-[9px] text-slate-400 font-bold uppercase text-center">पंचायत समिती संगमनेर</div>
                <button
                  type="button"
                  onClick={() => {
                    setPsPassword('admin');
                    setPsError('');
                    setShowPSLoginModal(true);
                  }}
                  className="w-full px-2 py-1 bg-indigo-650 hover:bg-indigo-600 text-white text-[10.5px] font-black uppercase tracking-wider rounded-none cursor-pointer text-center flex items-center justify-center gap-1"
                >
                  <KeyRound className="w-3.5 h-3.5 animate-pulse" />
                  PS Admin लॉगिन
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Logged-in Quick Action Grid */}
      {activeGP && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white border-2 border-slate-200 p-5 rounded-none hover:border-indigo-500 transition-colors cursor-pointer group flex flex-col justify-between" onClick={() => onSwitchTab('new-assessment')}>
            <div>
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 flex items-center justify-center font-black mb-3.5">१</div>
              <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 uppercase">नवीन कर आकारणी</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">नवीन मालमत्ता बांधकाम मोजणी व कर आकारणी फॉर्म</p>
            </div>
            <span className="text-xs font-black text-indigo-600 mt-4 flex items-center gap-1 group-hover:translate-x-1.5 transition-transform uppercase">सुरू करा <ArrowRight className="w-3.5 h-3.5" /></span>
          </div>

          <div className="bg-white border-2 border-slate-200 p-5 rounded-none hover:border-indigo-500 transition-colors cursor-pointer group flex flex-col justify-between" onClick={() => onSwitchTab('saved-list')}>
            <div>
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 flex items-center justify-center font-black mb-3.5">२</div>
              <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 uppercase">नमुना ८ आकारणी नोंदवही</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">जतन मालमत्तांची यादी, प्रिंट व नमुना न. ८ पत्रक</p>
            </div>
            <span className="text-xs font-black text-indigo-600 mt-4 flex items-center gap-1 group-hover:translate-x-1.5 transition-transform uppercase">सुरू करा <ArrowRight className="w-3.5 h-3.5" /></span>
          </div>

          <div className="bg-white border-2 border-slate-200 p-5 rounded-none hover:border-indigo-500 transition-colors cursor-pointer group flex flex-col justify-between" onClick={() => onSwitchTab('demand-register')}>
            <div>
              <div className="w-10 h-10 bg-amber-50 text-amber-600 flex items-center justify-center font-black mb-3.5">३</div>
              <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 uppercase">कर मागणी व वसुली</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">थकबाकी जोडा, पावती तयार करा आणि वसुली नोंद</p>
            </div>
            <span className="text-xs font-black text-indigo-600 mt-4 flex items-center gap-1 group-hover:translate-x-1.5 transition-transform uppercase">सुरू करा <ArrowRight className="w-3.5 h-3.5" /></span>
          </div>

          <div className="bg-white border-2 border-slate-200 p-5 rounded-none hover:border-indigo-500 transition-colors cursor-pointer group flex flex-col justify-between" onClick={() => onSwitchTab('settings')}>
            <div>
              <div className="w-10 h-10 bg-purple-50 text-purple-600 flex items-center justify-center font-black mb-3.5">४</div>
              <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 uppercase">कर नियमावली दर</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">रेडीरेकनर दर, दिवाबत्ती, पाणीपट्टी व इतर कर स्लॅब रचना</p>
            </div>
            <span className="text-xs font-black text-indigo-600 mt-4 flex items-center gap-1 group-hover:translate-x-1.5 transition-transform uppercase">सुरू करा <ArrowRight className="w-3.5 h-3.5" /></span>
          </div>
        </div>
      )}

      {/* 3. Global Dashboard Multi-Grampanchayat Panel (Only visible for Panchayat Samiti Admin) */}
      {isPSAdminActive && (
        <div className="space-y-4">
        {/* Sub-Tab Navigation Selector */}
        <div className="flex flex-col sm:flex-row gap-2 border-b-2 border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setDashboardSubTab('recovery')}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-none cursor-pointer border-2 transition-all flex items-center justify-center gap-2 ${
              dashboardSubTab === 'recovery'
                ? 'bg-indigo-950 border-indigo-950 text-white shadow-md'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-50'
            }`}
          >
            <Coins className="w-4 h-4 text-emerald-500 shrink-0" />
            १. कर मागणी व वसुली अहवाल (Tax Recovery)
          </button>
          
          <button
            type="button"
            onClick={() => setDashboardSubTab('welfare')}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-none cursor-pointer border-2 transition-all flex items-center justify-center gap-2 ${
              dashboardSubTab === 'welfare'
                ? 'bg-indigo-950 border-indigo-950 text-white shadow-md'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-50'
            }`}
          >
            <Accessibility className="w-4 h-4 text-indigo-600 shrink-0" />
            २. विशेष कल्याणकारी निधी तरतूद व खर्च अहवाल (Welfare Schemes)
          </button>
        </div>

        {dashboardSubTab === 'recovery' ? (
          <>
            <div className="border-b border-slate-200 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 uppercase">सर्व ग्रामपंचायतींच्या कर वसुलीचा तुलनात्मक आलेख (Dashboard)</h2>
            <p className="text-xs text-slate-500 font-bold uppercase mt-0.5">माहिती वर्गीकरण: कमी वसुली असलेल्या ग्रामपंचायती लाल रंगात आणि जास्त वसुली असलेल्या हिरव्या रंगात दिसतात</p>
          </div>

          <div className="inline-flex bg-slate-200 p-1 rounded-none select-none shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1 transition-all rounded-none cursor-pointer ${
                viewMode === 'list' 
                  ? 'bg-indigo-650 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              यादी रूप (List Format)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1 transition-all rounded-none cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-indigo-650 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              ग्रिड रूप (Grid Format)
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="bg-white border-2 border-slate-200 shadow-sm overflow-x-auto rounded-none">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider border-b-2 border-slate-200 select-none">
                  <th className="py-3 px-4 text-center w-16">अ.क्र.</th>
                  <th className="py-3 px-4">ग्रामपंचायत नाव (GP Name)</th>
                  <th className="py-3 px-4 text-center w-32">एकूण मिळकती</th>
                  <th className="py-3 px-4 text-right w-40">एकूण मागणी (Demand)</th>
                  <th className="py-3 px-4 text-right w-40">एकूण वसूल (Recovered)</th>
                  <th className="py-3 px-4 text-right w-40">शिल्लक कर (Balance)</th>
                  <th className="py-3 px-4 text-center w-40">वसुली प्रमाण (%)</th>
                  <th className="py-3 px-4 text-center w-36">वसुली दर्जा</th>
                  <th className="py-3 px-4 text-center w-40">कृती (Action)</th>
                  {isPSAdminActive && <th className="py-3 px-4 text-center text-rose-600 w-24">वजा</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs font-semibold text-slate-900">
                {gpStats.length === 0 ? (
                  <tr>
                    <td colSpan={isPSAdminActive ? 10 : 9} className="py-8 px-4 text-center text-slate-500 font-bold uppercase">
                      कोणतीही नोंदणीकृत ग्रामपंचायत उपलब्ध नाही. नवीन ग्रामपंचायत प्रविष्ट करा.
                    </td>
                  </tr>
                ) : (
                  gpStats.map(({ gp, propertyCount, totalDemand, totalRecovered, balance, recoveryPercentage }, idx) => {
                    const isLowest = totalDemand > 0 && recoveryPercentage === minPct;
                    const isHighest = totalDemand > 0 && recoveryPercentage === maxPct;
                    const isExemptGP = totalDemand === 0;

                    let rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';
                    const activeTextBold = activeGP?.name === gp.name;
                    if (activeTextBold) {
                      rowBg = 'bg-indigo-50/80 border-l-4 border-indigo-600';
                    }

                    let statusText = "मध्यम वसुली";
                    let statusBg = "bg-amber-100 border border-amber-300 text-amber-800";
                    if (isExemptGP) {
                      statusText = "माहिती निरंक";
                      statusBg = "bg-slate-100 text-slate-800 border-slate-300";
                    } else if (isLowest || recoveryPercentage < 40) {
                      statusText = "कमी वसुली";
                      statusBg = "bg-rose-100 border border-rose-300 text-rose-800";
                    } else if (isHighest || recoveryPercentage >= 70) {
                      statusText = "उत्कृष्ट वसुली";
                      statusBg = "bg-emerald-100 border border-emerald-300 text-emerald-800";
                    }

                    return (
                      <tr key={gp.name} className={`${rowBg} hover:bg-indigo-50/40 transition-colors`}>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-500">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-extrabold text-slate-950 flex items-center gap-1">
                            <Building2 className={`w-4 h-4 ${activeTextBold ? 'text-indigo-650' : 'text-slate-500'}`} />
                            <span className="text-sm">{gp.name}</span>
                            {activeTextBold && (
                              <span className="ml-1.5 px-1.5 py-0.5 bg-indigo-600 text-white text-[8px] font-black uppercase">सक्रिय</span>
                            )}
                          </div>
                          <div className="text-[9.5px] text-slate-500 font-bold uppercase mt-0.5">
                            तालुका: {gp.taluka || 'संगमनेर'} | जिल्हा: {gp.district || 'अहिल्यानगर'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">{propertyCount}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">₹{totalDemand.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-800">₹{totalRecovered.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-900">₹{balance.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-center font-mono">
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="font-extrabold">{recoveryPercentage.toFixed(2)}%</div>
                            <div className="w-16 bg-slate-200 h-1.5 rounded-none overflow-hidden">
                              <div 
                                className={`h-full ${
                                  isExemptGP ? 'bg-slate-400' : 
                                  (recoveryPercentage >= 70 ? 'bg-emerald-600' : (recoveryPercentage < 40 ? 'bg-rose-500' : 'bg-amber-500'))
                                }`}
                                style={{ width: `${Math.min(100, recoveryPercentage)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-[9px] font-black px-2 py-0.5 uppercase ${statusBg}`}>
                            {statusText}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {activeTextBold ? (
                            <button
                              type="button"
                              onClick={() => onSwitchTab('saved-list')}
                              className="inline-flex items-center gap-1 bg-indigo-650 hover:bg-slate-900 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1.5 transition-all cursor-pointer rounded-none min-h-[30px]"
                            >
                              <Unlock className="w-3 h-3" />
                              कामकाज करा
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openLoginForGP(gp.name)}
                              className="inline-flex items-center gap-1 bg-slate-900 hover:bg-indigo-600 border border-slate-950 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1.5 transition-all cursor-pointer rounded-none min-h-[30px]"
                            >
                              <Lock className="w-3 h-3" />
                              लॉगिन
                            </button>
                          )}
                        </td>
                        {isPSAdminActive && (
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteGPClick(gp.name)}
                              title="काढून टाका"
                              className="inline-flex items-center justify-center p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-300 text-rose-600 transition-all cursor-pointer rounded-none"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Dashboard Grid Cards View */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gpStats.length === 0 ? (
              <div className="md:col-span-3 text-center py-10 bg-white border border-slate-200 text-slate-500 font-bold uppercase rounded-none">
                कोणतीही नोंदणीकृत ग्रामपंचायत उपलब्ध नाही. नवीन ग्रामपंचायत प्रविष्ट करा.
              </div>
            ) : (
              gpStats.map(({ gp, propertyCount, totalDemand, totalRecovered, balance, recoveryPercentage }) => {
                const isLowest = totalDemand > 0 && recoveryPercentage === minPct;
                const isHighest = totalDemand > 0 && recoveryPercentage === maxPct;
                const isExemptGP = totalDemand === 0;

                let bgColor = "bg-white border-slate-200";
                let statusBadge = null;

                if (isExemptGP) {
                  bgColor = "bg-white border-slate-250 opacity-90";
                  statusBadge = (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-slate-100 border border-slate-350 text-slate-600">
                      माहिती निरंक
                    </span>
                  );
                } else if (isLowest || recoveryPercentage < 40) {
                  bgColor = "bg-rose-50/70 border-rose-350 shadow-md shadow-rose-200/50";
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 bg-rose-600 text-white ring-1 ring-rose-600/20">
                      <TrendingDown className="w-3 h-3" />
                      कमी वसुली (RED ZONE)
                    </span>
                  );
                } else if (isHighest || recoveryPercentage >= 70) {
                  bgColor = "bg-emerald-50/70 border-emerald-350 shadow-md shadow-emerald-250/30";
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 bg-emerald-600 text-white ring-1 ring-emerald-600/20">
                      <TrendingUp className="w-3 h-3" />
                      उत्कृष्ट वसुली (GREEN ZONE)
                    </span>
                  );
                } else {
                  bgColor = "bg-amber-50/30 border-amber-300";
                  statusBadge = (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-amber-500 text-white">
                      मध्यम वसुली (ORANGE)
                    </span>
                  );
                }

                const activeTextBold = activeGP?.name === gp.name;

                return (
                  <div 
                    key={gp.name} 
                    className={`border-4 p-5 flex flex-col justify-between transition-all ${bgColor} rounded-none relative ${
                      activeTextBold ? 'ring-4 ring-indigo-500 ring-offset-2' : ''
                    }`}
                  >
                    {activeTextBold && (
                      <span className="absolute -top-3.5 right-4 bg-indigo-600 text-white text-[9.5px] font-black px-2 py-0.5 uppercase tracking-wider shadow-md">
                        सध्या लॉगिनकृत (Logged In)
                      </span>
                    )}

                    {isPSAdminActive && (
                      <button
                        type="button"
                        onClick={() => handleDeleteGPClick(gp.name)}
                        className="absolute -top-3.5 left-4 bg-rose-600 text-white text-[9.5px] font-black px-2.5 py-0.5 uppercase tracking-wider shadow-md hover:bg-rose-700 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        काढून टाका
                      </button>
                    )}

                    <div className="space-y-4">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 flex items-center gap-1.5 uppercase">
                            <Building2 className={`w-5 h-5 ${activeTextBold ? 'text-indigo-600' : 'text-slate-700'}`} />
                            {gp.name}
                          </h3>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                            तालुका: {gp.taluka || 'संगमनेर'} | जिल्हा: {gp.district || 'अहिल्यानगर'}
                          </p>
                        </div>
                        {statusBadge}
                      </div>

                      <div className="bg-white/80 p-3 select-none space-y-2 border border-slate-200 font-mono text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans font-bold uppercase text-[10px]">१. एकूण मिळकती:</span>
                          <span className="font-bold text-slate-900">{propertyCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans font-bold uppercase text-[10px]">२. एकूण मागणी (Demand):</span>
                          <span className="font-bold text-slate-950">₹{totalDemand.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans font-bold uppercase text-[10px]">३. एकूण वसूल (Recovered):</span>
                          <span className="font-black text-emerald-850">₹{totalRecovered.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-0.5">
                          <span className="text-slate-500 font-sans font-bold uppercase text-[10px]">४. शिल्लक (Balance):</span>
                          <span className="font-bold text-rose-900">₹{balance.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-dashed border-slate-200 space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-black uppercase text-slate-700 mb-1">
                          <span>वसूल टक्केवारी:</span>
                          <span className={`text-sm ${
                            isExemptGP ? 'text-slate-500' : 
                            (recoveryPercentage >= 70 ? 'text-emerald-700' : (recoveryPercentage < 40 ? 'text-rose-700 font-black' : 'text-amber-700'))
                          }`}>
                            {recoveryPercentage.toFixed(2)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2">
                          <div 
                            className={`h-2 transition-all duration-500 ${
                              isExemptGP ? 'bg-slate-400' : 
                              (recoveryPercentage >= 70 ? 'bg-emerald-600' : (recoveryPercentage < 40 ? 'bg-rose-500' : 'bg-amber-500'))
                            }`}
                            style={{ width: `${Math.min(100, recoveryPercentage)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="pt-2 flex gap-2">
                        {activeTextBold ? (
                          <button
                            type="button"
                            onClick={() => onSwitchTab('saved-list')}
                            className="w-full inline-flex items-center justify-center gap-1 bg-indigo-650 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider py-2 transition-all cursor-pointer rounded-none min-h-[38px]"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            कामकाज करा (Manage)
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openLoginForGP(gp.name)}
                            className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-indigo-600 text-white font-extrablack text-xs uppercase tracking-wider py-2 transition-all cursor-pointer rounded-none border border-slate-950 min-h-[38px] hover:shadow"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            अ‍ॅडमीन लॉगिन
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
          </>
        ) : (
          /* Welfare Report Sub-Tab Section */
          <div className="space-y-6">
            {/* Year filter & info banner of Welfare report */}
            <div className="bg-white border-2 border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase flex items-center gap-1.5">
                  <Calendar className="w-5 h-5 text-indigo-700 shrink-0" />
                  कल्याणकारी योजना विशेष निधी अहवाल वर्षवार ({selectedWelfareYear}-{String(selectedWelfareYear+1).slice(-2)})
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">अहवालातील वर्ष बदलण्यासाठी उजवीकडील ड्रॉपडाऊनचा वापर करा</p>
              </div>

              <div className="flex items-center gap-2 bg-slate-100 border border-slate-300 p-1.5 shrink-0 select-none">
                <span className="text-[10px] font-black uppercase text-slate-650 px-1">आर्थिक वर्ष निवडा (Select Year):</span>
                <select
                  value={selectedWelfareYear}
                  onChange={(e) => setSelectedWelfareYear(Number(e.target.value))}
                  className="bg-white border border-slate-350 px-2 py-1.5 text-xs font-black text-slate-800 focus:outline-none cursor-pointer"
                >
                  {[assessmentYear - 1, assessmentYear, assessmentYear + 1].map(yr => (
                    <option key={yr} value={yr}>
                      {yr}-{String(yr+1).slice(-2)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Panchayat Samiti Aggregates KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* 5% Divyang KPI Card */}
              <div className="bg-indigo-50 border border-indigo-250 p-4.5 space-y-3 font-sans relative">
                <div className="flex items-center gap-2 border-b border-indigo-200 pb-2">
                  <Accessibility className="w-4 h-4 text-indigo-700 shrink-0" />
                  <h4 className="text-[11px] font-extrabold text-indigo-950 uppercase">१. एकूण ५% दिव्यांग कल्याण निधी (All GPs)</h4>
                </div>
                <div className="font-mono text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans font-bold text-[10px] uppercase">एकूण तरतूद:</span>
                    <span className="font-bold text-slate-900 font-mono">₹{welfareGrandSum.dAlloc.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans font-bold text-[10px] uppercase">एकूण खर्च:</span>
                    <span className="font-black text-emerald-800 font-mono font-bold">₹{welfareGrandSum.dExp.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between border-t border-indigo-200/60 pt-1 text-rose-905">
                    <span className="text-[10px] font-sans font-bold uppercase">शिल्लक:</span>
                    <span className="font-bold font-mono">₹{Math.max(0, welfareGrandSum.dAlloc - welfareGrandSum.dExp).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="pt-1 select-none">
                  <div className="w-full bg-slate-200 h-2">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${welfareGrandSum.dAlloc > 0 ? Math.min(100, (welfareGrandSum.dExp / welfareGrandSum.dAlloc) * 100) : 0}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-[10px] font-black text-indigo-955 mt-1 font-mono">
                    {welfareGrandSum.dAlloc > 0 ? ((welfareGrandSum.dExp / welfareGrandSum.dAlloc) * 100).toFixed(1) : '0.0'}% खर्च
                  </div>
                </div>
              </div>

              {/* 15% Magasvargiya KPI Card */}
              <div className="bg-amber-50/55 border border-amber-250 p-4.5 space-y-3 font-sans relative">
                <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
                  <Users className="w-4 h-4 text-amber-700 shrink-0" />
                  <h4 className="text-[11px] font-extrabold text-amber-955 uppercase">२. एकूण १५% मागासवर्गीय निधी (All GPs)</h4>
                </div>
                <div className="font-mono text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans font-bold text-[10px] uppercase">एकूण तरतूद:</span>
                    <span className="font-bold text-slate-900 font-mono">₹{welfareGrandSum.mAlloc.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans font-bold text-[10px] uppercase">एकूण खर्च:</span>
                    <span className="font-black text-emerald-800 font-mono font-bold">₹{welfareGrandSum.mExp.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between border-t border-amber-200/60 pt-1 text-rose-905">
                    <span className="text-[10px] font-sans font-bold uppercase">शिल्लक:</span>
                    <span className="font-bold font-mono">₹{Math.max(0, welfareGrandSum.mAlloc - welfareGrandSum.mExp).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="pt-1 select-none">
                  <div className="w-full bg-slate-200 h-2">
                    <div 
                      className="h-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${welfareGrandSum.mAlloc > 0 ? Math.min(100, (welfareGrandSum.mExp / welfareGrandSum.mAlloc) * 100) : 0}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-[10px] font-black text-amber-955 mt-1 font-mono">
                    {welfareGrandSum.mAlloc > 0 ? ((welfareGrandSum.mExp / welfareGrandSum.mAlloc) * 100).toFixed(1) : '0.0'}% खर्च
                  </div>
                </div>
              </div>

              {/* 10% Women & Child Welfare Card */}
              <div className="bg-rose-50/50 border border-rose-250 p-4.5 space-y-3 font-sans relative">
                <div className="flex items-center gap-2 border-b border-rose-200 pb-2">
                  <Heart className="w-4 h-4 text-rose-700 shrink-0" />
                  <h4 className="text-[11px] font-extrabold text-rose-955 uppercase">३. एकूण १०% मबाक कल्याण निधी (All GPs)</h4>
                </div>
                <div className="font-mono text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-505 font-sans font-bold text-[10px] uppercase">एकूण तरतूद:</span>
                    <span className="font-bold text-slate-900 font-mono">₹{welfareGrandSum.mbAlloc.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-505 font-sans font-bold text-[10px] uppercase">एकूण खर्च:</span>
                    <span className="font-black text-emerald-800 font-mono font-bold">₹{welfareGrandSum.mbExp.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between border-t border-rose-200/60 pt-1 text-rose-905">
                    <span className="text-[10px] font-sans font-bold uppercase">शिल्लक:</span>
                    <span className="font-bold font-mono">₹{Math.max(0, welfareGrandSum.mbAlloc - welfareGrandSum.mbExp).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="pt-1 select-none">
                  <div className="w-full bg-slate-200 h-2">
                    <div 
                      className="h-full bg-rose-505 transition-all duration-300"
                      style={{ width: `${welfareGrandSum.mbAlloc > 0 ? Math.min(100, (welfareGrandSum.mbExp / welfareGrandSum.mbAlloc) * 100) : 0}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-[10px] font-black text-rose-950 mt-1 font-mono">
                    {welfareGrandSum.mbAlloc > 0 ? ((welfareGrandSum.mbExp / welfareGrandSum.mbAlloc) * 100).toFixed(1) : '0.0'}% खर्च
                  </div>
                </div>
              </div>
            </div>

            {/* Welfare Schemes Detailed GP Grid Table */}
            <div className="bg-white border-2 border-slate-200 shadow-sm overflow-x-auto rounded-none">
              <table className="w-full text-left border-collapse min-w-[1020px]">
                <thead>
                  <tr className="bg-indigo-950 text-white text-[9.5px] font-black uppercase tracking-wider border-b-2 border-indigo-900 select-none">
                    <th className="py-3 px-4 text-center w-14">अ.क्र.</th>
                    <th className="py-3 px-4 w-52">ग्रामपंचायत (GP Title)</th>
                    <th className="py-3 px-4 text-center bg-indigo-900/40 border-r border-indigo-900 w-60">१) ५% दिव्यांग निधी (₹ तरतूद / ₹ खर्च / शिल्लक)</th>
                    <th className="py-3 px-4 text-center bg-amber-900/20 border-r border-amber-900/50 w-60">२) १५% मागासवर्गीय निधी (₹ तरतूद / ₹ खर्च / शिल्लक)</th>
                    <th className="py-3 px-4 text-center bg-rose-900/20 border-r border-rose-900/50 w-60">३) १०% मबाक कल्याण निधी (₹ तरतूद / ₹ खर्च / शिल्लक)</th>
                    <th className="py-3 px-4 text-center bg-slate-900 w-52">एकूण एकत्रित प्रगती (Overall Progress)</th>
                    <th className="py-3 px-4 text-center w-24">श्रेणी (Grade)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs font-semibold text-slate-950">
                  {registeredGPs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 px-4 text-center text-slate-500 font-bold uppercase">
                        अहवाल दर्शवण्यासाठी कोणतीही ग्रामपंचायत उपलब्ध नाही.
                      </td>
                    </tr>
                  ) : (
                    registeredGPs.map((gp, idx) => {
                      const currentWelfare = savedWelfareList.find(w => w.gpName === gp.name && w.year === selectedWelfareYear) || {
                        divyangAllocation: 0,
                        divyangExpense: 0,
                        magasvargiyaAllocation: 0,
                        magasvargiyaExpense: 0,
                        mbkAllocation: 0,
                        mbkExpense: 0
                      };

                      const dAlloc = currentWelfare.divyangAllocation;
                      const dExp = currentWelfare.divyangExpense;
                      const dBal = Math.max(0, dAlloc - dExp);
                      const dPct = dAlloc > 0 ? (dExp / dAlloc) * 100 : 0;

                      const mAlloc = currentWelfare.magasvargiyaAllocation;
                      const mExp = currentWelfare.magasvargiyaExpense;
                      const mBal = Math.max(0, mAlloc - mExp);
                      const mPct = mAlloc > 0 ? (mExp / mAlloc) * 100 : 0;

                      const mbAlloc = currentWelfare.mbkAllocation;
                      const mbExp = currentWelfare.mbkExpense;
                      const mbBal = Math.max(0, mbAlloc - mbExp);
                      const mbPct = mbAlloc > 0 ? (mbExp / mbAlloc) * 100 : 0;

                      const tAlloc = dAlloc + mAlloc + mbAlloc;
                      const tExp = dExp + mExp + mbExp;
                      const tBal = Math.max(0, tAlloc - tExp);
                      const tPct = tAlloc > 0 ? (tExp / tAlloc) * 100 : 0;

                      // Grades
                      let grade = '-';
                      let gradeClass = "bg-slate-100 text-slate-650";
                      if (tAlloc > 0) {
                        if (tPct >= 90) { grade = 'A+'; gradeClass = 'bg-emerald-600 text-white'; }
                        else if (tPct >= 75) { grade = 'A'; gradeClass = 'bg-emerald-100 text-emerald-800 border border-emerald-300'; }
                        else if (tPct >= 55) { grade = 'B'; gradeClass = 'bg-amber-100 text-amber-800 border border-amber-300'; }
                        else if (tPct >= 35) { grade = 'C'; gradeClass = 'bg-orange-100 text-orange-850 border border-orange-300'; }
                        else { grade = 'D'; gradeClass = 'bg-rose-100 text-rose-800 border border-rose-350 animate-pulse'; }
                      }

                      const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40';

                      return (
                        <tr key={gp.name} className={`${rowBg} hover:bg-slate-50 transition-colors`}>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-500">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <span className="font-extrabold text-slate-950 border-b border-indigo-100 pb-0.5 inline-block">{gp.name}</span>
                            <span className="text-[9.5px] text-slate-500 font-bold block uppercase mt-0.5">तालुका: {gp.taluka || 'संगमनेर'}</span>
                          </td>

                          {/* 5% column */}
                          <td className="py-3 px-3 bg-indigo-50/15 border-r border-indigo-100 font-mono text-center">
                            {dAlloc === 0 ? (
                              <span className="text-[10px] text-slate-400 font-bold uppercase select-none">--- निरंक ---</span>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex justify-around items-center text-[10.5px]">
                                  <span className="text-slate-705 font-bold font-mono">₹{dAlloc}</span>
                                  <span className="text-slate-400 font-bold font-mono">/</span>
                                  <span className="text-emerald-700 font-extrabold font-mono">₹{dExp}</span>
                                  <span className="text-slate-400 font-bold font-mono">/</span>
                                  <span className="text-rose-805 font-bold font-mono">₹{dBal}</span>
                                </div>
                                <div className="text-[9.5px] font-black text-indigo-900 bg-indigo-50/95 py-0.5 px-1 truncate font-mono">
                                  प्रगती: {dPct.toFixed(1)}%
                                </div>
                              </div>
                            )}
                          </td>

                          {/* 15% column */}
                          <td className="py-3 px-3 bg-amber-50/10 border-r border-amber-100 font-mono text-center">
                            {mAlloc === 0 ? (
                              <span className="text-[10px] text-slate-400 font-bold uppercase select-none">--- निरंक ---</span>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex justify-around items-center text-[10.5px]">
                                  <span className="text-slate-705 font-bold font-mono">₹{mAlloc}</span>
                                  <span className="text-slate-400 font-bold font-mono">/</span>
                                  <span className="text-emerald-700 font-extrabold font-mono">₹{mExp}</span>
                                  <span className="text-slate-400 font-bold font-mono">/</span>
                                  <span className="text-rose-805 font-bold font-mono">₹{mBal}</span>
                                </div>
                                <div className="text-[9.5px] font-black text-amber-900 bg-amber-50 py-0.5 px-1 truncate border border-amber-205/30 font-mono">
                                  प्रगती: {mPct.toFixed(1)}%
                                </div>
                              </div>
                            )}
                          </td>

                          {/* 10% column */}
                          <td className="py-3 px-3 bg-rose-50/10 border-r border-rose-100 font-mono text-center">
                            {mbAlloc === 0 ? (
                              <span className="text-[10px] text-slate-400 font-bold uppercase select-none">--- निरंक ---</span>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex justify-around items-center text-[10.5px]">
                                  <span className="text-slate-705 font-bold font-mono">₹{mbAlloc}</span>
                                  <span className="text-slate-400 font-bold font-mono">/</span>
                                  <span className="text-emerald-700 font-extrabold font-mono">₹{mbExp}</span>
                                  <span className="text-slate-400 font-bold font-mono">/</span>
                                  <span className="text-rose-805 font-bold font-mono">₹{mbBal}</span>
                                </div>
                                <div className="text-[9.5px] font-black text-rose-900 bg-rose-50 py-0.5 px-1 truncate border border-rose-205/30 font-mono">
                                  प्रगती: {mbPct.toFixed(1)}%
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Overall combine stats */}
                          <td className="py-3 px-4 font-mono select-none bg-slate-50/50">
                            {tAlloc === 0 ? (
                              <div className="text-center text-[10.5px] font-black uppercase text-slate-400 font-sans">माहिती नाही</div>
                            ) : (
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[11px] font-black">
                                  <span className="text-slate-550 font-sans font-bold text-[9px] uppercase">एकूण तरतूद: ₹{tAlloc}</span>
                                  <span className="text-emerald-700 font-mono">₹{tExp} (खर्च)</span>
                                </div>
                                <div className="w-full bg-slate-200 h-2">
                                  <div 
                                    className={`h-2 transition-all ${tPct >= 75 ? 'bg-emerald-600' : (tPct < 40 ? 'bg-rose-505' : 'bg-amber-500')}`}
                                    style={{ width: `${Math.min(100, tPct)}%` }}
                                  ></div>
                                </div>
                                <div className="flex justify-between text-[9px] font-bold text-slate-505">
                                  <span className="font-mono">शिल्लक तरतूद: ₹{tBal}</span>
                                  <span className="font-extrabold text-slate-805 font-mono">{tPct.toFixed(1)}%</span>
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Rating Grade */}
                          <td className="py-3 px-4 text-center">
                            <span className={`text-[10px] font-black px-2.5 py-1 uppercase inline-block font-mono ${gradeClass}`}>
                              {grade}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      )}

      {/* 4. Login Inline Modal / Drawer overlay */}
      {selectedGPForLogin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border-4 border-indigo-950 max-w-md w-full p-6 shadow-2xl relative">
            <h2 className="text-lg font-black text-slate-950 uppercase border-b-2 border-slate-100 pb-2 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-700" />
              {selectedGPForLogin} • अ‍ॅडमीन लॉगिन
            </h2>

            <form onSubmit={handleLoginSubmit} className="space-y-4 mt-4">
              <div className="text-xs text-slate-500 font-bold uppercase leading-relaxed p-3 bg-indigo-50/50 border border-indigo-200">
                🔑 लॉगिन पासवर्ड प्रविष्ट करा. अधिकृत ग्रामसेवक किंवा कर निर्धारण अधिकारी म्हणून सर्व कामकाजScoping करण्यासाठी अ‍ॅडमीन लॉगिन आवश्यक आहे. 
                <br />
                <span className="text-indigo-800 font-black mt-1 block">💡 सोयीसाठी मूळ पासवर्ड <strong className="underline">"admin"</strong> ठेवलेला आहे.</span>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-slate-600">अ‍ॅडमीन पासवर्ड (Password)</label>
                <input
                  type="password"
                  required
                  placeholder="अ‍ॅडमीन पासवर्ड टाईप करा..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none font-mono"
                  autoFocus
                />
              </div>

              {loginError && (
                <p className="text-xs text-rose-600 font-black uppercase">{loginError}</p>
              )}

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedGPForLogin(null)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest rounded-none transition-colors cursor-pointer"
                >
                  बंद करा
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-950 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-none transition-all cursor-pointer"
                >
                  लॉगिन (Log In)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPSLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border-4 border-indigo-950 max-w-md w-full p-6 shadow-2xl relative">
            <h2 className="text-lg font-black text-slate-950 uppercase border-b-2 border-slate-100 pb-2 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-700" />
              मुख्य प्रशासक (PS Admin) लॉगिन
            </h2>

            <form onSubmit={handlePSLoginSubmit} className="space-y-4 mt-4">
              <div className="text-xs text-slate-500 font-bold uppercase leading-relaxed p-3 bg-indigo-50/50 border border-indigo-200">
                🔑 लॉगिन पासवर्ड प्रविष्ट करा. ग्रामपंचायती समाविष्ट करणे किंवा काढून टाकणे याकरिता पंचायत समिती संगमनेरचे प्रशासक लॉगिन आवश्यक आहे.
                <br />
                <span className="text-indigo-800 font-black mt-1 block">💡 सोयीसाठी मूळ पासवर्ड <strong className="underline">"admin"</strong> ठेवलेला आहे.</span>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-slate-600">प्रशासक पासवर्ड (Password)</label>
                <input
                  type="password"
                  required
                  placeholder="अ‍ॅडमीन पासवर्ड टाईप करा..."
                  value={psPassword}
                  onChange={(e) => setPsPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none font-mono"
                  autoFocus
                />
              </div>

              {psError && (
                <p className="text-xs text-rose-600 font-black uppercase">{psError}</p>
              )}

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowPSLoginModal(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest rounded-none transition-colors cursor-pointer"
                >
                  बंद करा
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-950 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-none transition-all cursor-pointer"
                >
                  लॉगिन (Log In)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Create / Register New Grampanchayat Panel */}
      {isPSAdminActive ? (
        <div className="bg-white border-2 border-slate-350 p-5 sm:p-6 rounded-none space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-sm font-black text-slate-900 border-b-2 border-slate-400 pb-1 inline-block uppercase tracking-widest leading-none">
              ५. नवीन ग्रामपंचायत समाविष्ट करणे (Add New Grampanchayat)
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">नवीन ग्रामपंचायत डेटा वाढवण्यासाठी खालील फॉर्म भरा (सध्या पंचायत समिती लॅागिन सुरू आहे)</p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-slate-600">
                १. ग्रामपंचायतीचे नाव (GP Name) *
              </label>
              <input
                type="text"
                required
                placeholder="उदा. राजापूर"
                value={newGPName}
                onChange={(e) => setNewGPName(e.target.value)}
                className="w-full bg-white border border-slate-350 px-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none h-[42px]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-slate-600">
                २. पासवर्ड (Default: "admin") *
              </label>
              <input
                type="password"
                required
                placeholder="पासवर्ड प्रविष्ट करा..."
                value={newGPPassword}
                onChange={(e) => setNewGPPassword(e.target.value)}
                className="w-full bg-white border border-slate-350 px-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none h-[42px]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-slate-600">
                ३. तालुका नाव (Taluka)
              </label>
              <input
                type="text"
                placeholder="संगमनेर"
                value={newGPTaluka}
                onChange={(e) => setNewGPTaluka(e.target.value)}
                className="w-full bg-white border border-slate-350 px-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none h-[42px]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-slate-600">
                ४. जिल्हा नाव (District)
              </label>
              <input
                type="text"
                placeholder="अहिल्यानगर"
                value={newGPDistrict}
                onChange={(e) => setNewGPDistrict(e.target.value)}
                className="w-full bg-white border border-slate-350 px-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none h-[42px]"
              />
            </div>

            <div className="md:col-span-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                {registerSuccess && (
                  <div className="text-xs text-emerald-700 font-extrabold uppercase bg-emerald-100/80 px-3 py-1.5 border-l-4 border-emerald-600">
                    {registerSuccess}
                  </div>
                )}
                {registerError && (
                  <div className="text-xs text-rose-700 font-extrabold uppercase bg-rose-100/80 px-3 py-1.5 border-l-4 border-rose-600">
                    {registerError}
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-650 hover:bg-slate-900 text-white font-extrablack text-xs uppercase tracking-widest rounded-none transition-all cursor-pointer shrink-0 min-h-[42px] inline-flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                नवीन ग्रामपंचायत समाविष्ट करा (Add Section)
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-slate-100 border-2 border-dashed border-slate-300 p-6 rounded-none text-center space-y-2 select-none">
          <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-black text-slate-700 uppercase">नवीन ग्रामपंचायत व्यवस्थापन लॉक</h3>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-lg mx-auto uppercase">
            नवीन ग्रामपंचायत समाविष्ट करणे किंवा जुनी ग्रामपंचायत काढून टाकणे (Add/Remove) स्वतंत्र अधिकार केवळ **पंचायत समिती संगमनेर (PS Admin)** लॉगिन केल्यानंतरच कार्यरत होतात. कृपया वरील "PS Admin लॉगिन" करा.
          </p>
        </div>
      )}

    </div>
  );
}
