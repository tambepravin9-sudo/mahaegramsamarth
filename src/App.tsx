import { useState, useEffect, FormEvent } from 'react';
import { PropertyBlock, PropertyAssessment, TaxSettings, PropertyType, WelfareData } from './types';
import { DEFAULT_TAX_SETTINGS, PROPERTY_TYPE_LABELS, getFinancialYearStart } from './defaults';
import { calculateBlockValues, calculateTotalAssessment } from './utils/calculator';
import BlockForm from './components/BlockForm';
import SettingsPanel from './components/SettingsPanel';
import SavedAssessments from './components/SavedAssessments';
import ReceiptPrint from './components/ReceiptPrint';
import DemandRegister from './components/DemandRegister';
import HomeDashboard, { GramPanchayat } from './components/HomeDashboard';
import WelfareSchemes from './components/WelfareSchemes';
import { 
  Building2, 
  Plus, 
  Save, 
  RotateCcw, 
  Trash2, 
  HelpCircle, 
  FileText, 
  Settings as SettingsIcon, 
  History,
  Coins,
  FileSpreadsheet,
  Calendar,
  Lightbulb,
  Trash2 as TrashIcon,
  Droplets,
  BadgeAlert,
  ClipboardList,
  Info,
  Home,
  Accessibility,
  Users,
  Heart
} from 'lucide-react';

export default function App() {
  const currentSystemYear = getFinancialYearStart();

  // --- Core State ---
  const [activeTab, setActiveTab] = useState<'home' | 'new-assessment' | 'saved-list' | 'demand-register' | 'settings' | 'welfare'>('home');
  const [settings, setSettings] = useState<TaxSettings>(DEFAULT_TAX_SETTINGS);
  const [savedAssessments, setSavedAssessments] = useState<PropertyAssessment[]>([]);
  const [registeredGPs, setRegisteredGPs] = useState<GramPanchayat[]>([]);
  const [activeGP, setActiveGP] = useState<GramPanchayat | null>(null);
  const [isPSAdminActive, setIsPSAdminActive] = useState<boolean>(() => {
    return localStorage.getItem('is_ps_admin_session') === 'true';
  });

  // --- Welfare State & Seeding ---
  const [savedWelfareList, setSavedWelfareList] = useState<WelfareData[]>(() => {
    const stored = localStorage.getItem('saved_welfare_schemes_list');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing saved welfare schemes:", e);
      }
    }
    // Seed standard defaults for demo representation
    const defaultWelfareSeeds: WelfareData[] = [
      {
        gpName: 'पिंपळगाव कोंढिरा',
        year: 2026,
        divyangAllocation: 25000,
        divyangExpense: 23500,
        magasvargiyaAllocation: 75000,
        magasvargiyaExpense: 72000,
        mbkAllocation: 50000,
        mbkExpense: 48000,
        lastUpdated: new Date().toISOString()
      },
      {
        gpName: 'पोखरी बाळेश्वर',
        year: 2026,
        divyangAllocation: 30000,
        divyangExpense: 18000,
        magasvargiyaAllocation: 90000,
        magasvargiyaExpense: 54000,
        mbkAllocation: 60000,
        mbkExpense: 45000,
        lastUpdated: new Date().toISOString()
      },
      {
        gpName: 'पिंपळगाव डेरे',
        year: 2026,
        divyangAllocation: 20000,
        divyangExpense: 7000,
        magasvargiyaAllocation: 60000,
        magasvargiyaExpense: 22000,
        mbkAllocation: 40000,
        mbkExpense: 15000,
        lastUpdated: new Date().toISOString()
      }
    ];
    localStorage.setItem('saved_welfare_schemes_list', JSON.stringify(defaultWelfareSeeds));
    return defaultWelfareSeeds;
  });

  const handleSaveWelfare = (welfare: WelfareData) => {
    const filtered = savedWelfareList.filter(
      item => !(item.gpName === welfare.gpName && item.year === welfare.year)
    );
    const updated = [welfare, ...filtered];
    setSavedWelfareList(updated);
    localStorage.setItem('saved_welfare_schemes_list', JSON.stringify(updated));
  };
  
  // Principal property state
  const [propertyId, setPropertyId] = useState<string | null>(null); // null means new, string means editing existing
  const [propertyNumber, setPropertyNumber] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('regular');
  const [ownerName, setOwnerName] = useState('');
  const [occupantName, setOccupantName] = useState('');
  const [roadName, setRoadName] = useState('');
  const [gatNumber, setGatNumber] = useState('');
  const [propertyDescription, setPropertyDescription] = useState('');
  const [assessmentYear, setAssessmentYear] = useState<number>(currentSystemYear);
  const [streetLightTax, setStreetLightTax] = useState<number>(DEFAULT_TAX_SETTINGS.defaultStreetLightTax);
  const [healthTax, setHealthTax] = useState<number>(DEFAULT_TAX_SETTINGS.defaultHealthTax);
  const [waterTax, setWaterTax] = useState<number>(DEFAULT_TAX_SETTINGS.defaultWaterTax);
  const [notes, setNotes] = useState('');

  // Building Block segments inside property (मिळकत अ क्र. ४ ते १५ प्रमाणे)
  const [blocks, setBlocks] = useState<PropertyBlock[]>([]);

  // Selected assessment to show in Print Modal
  const [selectedForPrint, setSelectedForPrint] = useState<PropertyAssessment | null>(null);

  // --- Initial Loading from LocalStorage ---
  useEffect(() => {
    // 1. Load settings
    const storedSettings = localStorage.getItem('malmatta_tax_settings');
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        setSettings({
          ...DEFAULT_TAX_SETTINGS,
          ...parsed,
          roadsList: parsed.roadsList ?? DEFAULT_TAX_SETTINGS.roadsList
        });
      } catch (e) {
        console.error("Error loading settings:", e);
      }
    }

    // 2. Load registered GPs
    let loadedGPs: GramPanchayat[] = [];
    const storedGPs = localStorage.getItem('registered_grampanchayats');
    if (storedGPs) {
      try {
        loadedGPs = JSON.parse(storedGPs);
        setRegisteredGPs(loadedGPs);
      } catch (e) {
        console.error("Error loading GPs:", e);
      }
    } else {
      const defaultGPs: GramPanchayat[] = [
        { name: 'पिंपळगाव कोंढिरा', adminPassword: 'admin', taluka: 'संगमनेर', district: 'अहिल्यानगर' },
        { name: 'पोखरी बाळेश्वर', adminPassword: 'admin', taluka: 'संगमनेर', district: 'अहिल्यानगर' },
        { name: 'पिंपळगाव डेरे', adminPassword: 'admin', taluka: 'संगमनेर', district: 'अहिल्यानगर' }
      ];
      loadedGPs = defaultGPs;
      setRegisteredGPs(defaultGPs);
      localStorage.setItem('registered_grampanchayats', JSON.stringify(defaultGPs));
    }

    // 3. Load active GP
    const storedActiveGP = localStorage.getItem('active_gp_session');
    if (storedActiveGP) {
      try {
        const parsedGP = JSON.parse(storedActiveGP);
        setActiveGP(parsedGP);
        // Also ensure current page config is synced with the loaded active GP session
        localStorage.setItem('cfg_gp', parsedGP.name);
        if (parsedGP.taluka) localStorage.setItem('cfg_taluka', parsedGP.taluka);
        if (parsedGP.district) localStorage.setItem('cfg_dist', parsedGP.district);
      } catch (e) {
        console.error("Error loading active GP session:", e);
      }
    }

    // 4. Load saved assessments or seed them
    const storedAssessments = localStorage.getItem('malmatta_assessments');
    if (storedAssessments) {
      try {
        setSavedAssessments(JSON.parse(storedAssessments));
      } catch (e) {
        console.error("Error loading assessments:", e);
      }
    } else {
      // Setup dynamic seeding objects
      const seedBlock1 = calculateBlockValues({
        id: 'seed-b1',
        constructionType: 'rcc',
        length: 30,
        width: 25,
        constructionYear: 2021,
        usageType: 'residential'
      }, DEFAULT_TAX_SETTINGS, currentSystemYear);

      const seedBlock2 = calculateBlockValues({
        id: 'seed-b2',
        constructionType: 'other_permanent',
        length: 20,
        width: 15,
        constructionYear: 2018,
        usageType: 'commercial'
      }, DEFAULT_TAX_SETTINGS, currentSystemYear);

      // Seed 1: Pimpalgav Kondhira - Prop 1 (Fully Paid)
      const propPK1 = calculateTotalAssessment(
        'अ/१००५',
        'कमल सोपान गुंजाळ',
        'स्वतः',
        'वार्ड नं. १, मेन रोड',
        'गट क्र. २४',
        'निवासी व कमर्शियल गाळा',
        [seedBlock1, seedBlock2],
        350,
        250,
        DEFAULT_TAX_SETTINGS.defaultWaterTax,
        currentSystemYear,
        'pk-1',
        'अपील नाही. कर वेळेत भरला जातो.'
      );
      const assPK1 = {
        ...propPK1,
        grampanchayat: 'पिंपळगाव कोंढिरा',
        arrearsBuildingTax: 0,
        arrearsStreetLightTax: 0,
        arrearsHealthTax: 0,
        arrearsWaterTax: 0,
        recoveredBuildingTax: propPK1.blocks.reduce((sum, b) => sum + b.constructionTax, 0),
        recoveredStreetLightTax: propPK1.streetLightTax,
        recoveredHealthTax: propPK1.healthTax,
        recoveredWaterTax: propPK1.waterTax,
        receiptBookNo: '१२',
        receiptNo: '३४५६',
        receiptDate: '२०२६-०४-२५'
      };

      // Seed 2: Pimpalgav Kondhira - Prop 2 (High Paid)
      const propPK2 = calculateTotalAssessment(
        'अ/१६३०',
        'भास्कर विठ्ठल सातपुते',
        'स्वतः',
        'वार्ड नं. ३, राम गल्ली',
        'गट क्र. १४२',
        'निवासी घर',
        [seedBlock1],
        200,
        150,
        DEFAULT_TAX_SETTINGS.defaultWaterTax,
        currentSystemYear,
        'pk-2',
        ''
      );
      const assPK2 = {
        ...propPK2,
        grampanchayat: 'पिंपळगाव कोंढिरा',
        arrearsBuildingTax: 500,
        arrearsStreetLightTax: 100,
        arrearsHealthTax: 100,
        arrearsWaterTax: 300,
        recoveredBuildingTax: propPK2.blocks.reduce((sum, b) => sum + b.constructionTax, 0),
        recoveredStreetLightTax: propPK2.streetLightTax,
        recoveredHealthTax: propPK2.healthTax,
        recoveredWaterTax: propPK2.waterTax + 300,
        receiptBookNo: '१२',
        receiptNo: '३४५७',
        receiptDate: '२०२६-०४-२८'
      };

      // Seed 3: Pokhari Baleshwar - Prop 1 (Medium Paid)
      const propPB1 = calculateTotalAssessment(
        'ब/३१२',
        'रवींद्र एकनाथ तांबे',
        'स्वतः',
        'मारुती चौक',
        'गट क्र. १८०',
        'निवासी कौलारू घर',
        [seedBlock1],
        200,
        150,
        DEFAULT_TAX_SETTINGS.defaultWaterTax,
        currentSystemYear,
        'pb-1',
        ''
      );
      const assPB1 = {
        ...propPB1,
        grampanchayat: 'पोखरी बाळेश्वर',
        arrearsBuildingTax: 1200,
        arrearsStreetLightTax: 300,
        arrearsHealthTax: 300,
        arrearsWaterTax: 1200,
        recoveredBuildingTax: Math.round(propPB1.blocks[0].constructionTax * 0.5),
        recoveredStreetLightTax: Math.round(propPB1.streetLightTax * 0.5),
        recoveredHealthTax: Math.round(propPB1.healthTax * 0.5),
        recoveredWaterTax: Math.round((propPB1.waterTax + 1200) * 0.4),
        receiptBookNo: '०५',
        receiptNo: '१८२२',
        receiptDate: '२०२६-०५-०२'
      };

      // Seed 4: Pokhari Baleshwar - Prop 2 (Medium Paid)
      const propPB2 = calculateTotalAssessment(
        'ब/४२०',
        'ज्ञानदेव पांडुरंग दिघे',
        'स्वतः',
        'हॉस्पिटल रोड',
        'गट क्र. ९५',
        'निवासी आरसीसी इमारत',
        [seedBlock1],
        100,
        80,
        DEFAULT_TAX_SETTINGS.defaultWaterTax,
        currentSystemYear,
        'pb-2',
        ''
      );
      const assPB2 = {
        ...propPB2,
        grampanchayat: 'पोखरी बाळेश्वर',
        arrearsBuildingTax: 1000,
        arrearsStreetLightTax: 200,
        arrearsHealthTax: 200,
        arrearsWaterTax: 600,
        recoveredBuildingTax: 1000,
        recoveredStreetLightTax: 0,
        recoveredHealthTax: 0,
        recoveredWaterTax: 600,
        receiptBookNo: '०५',
        receiptNo: '१८२३',
        receiptDate: '२०२6-०५-०३'
      };

      // Seed 5: Pimpalgav Dere - Prop 1 (Low Paid)
      const propPD1 = calculateTotalAssessment(
        'क/००७',
        'ज्ञानेश्वर नामदेव वर्पे',
        'स्वतः',
        'ठाकर वस्ती',
        'गट क्र. ७४',
        'निवासी जुने घर',
        [seedBlock1],
        100,
        80,
        DEFAULT_TAX_SETTINGS.defaultWaterTax,
        currentSystemYear,
        'pd-1',
        ''
      );
      const assPD1 = {
        ...propPD1,
        grampanchayat: 'पिंपळगाव डेरे',
        arrearsBuildingTax: 3000,
        arrearsStreetLightTax: 600,
        arrearsHealthTax: 600,
        arrearsWaterTax: 1800,
        recoveredBuildingTax: 400,
        recoveredStreetLightTax: 50,
        recoveredHealthTax: 50,
        recoveredWaterTax: 200,
        receiptBookNo: '४४',
        receiptNo: '४०१',
        receiptDate: '२०२६-०५-१५'
      };

      // Seed 6: Pimpalgav Dere - Prop 2 (Low Paid)
      const propPD2 = calculateTotalAssessment(
        'क/१५४',
        'सखाराम मारुती सांगळे',
        'स्वतः',
        'वार्ड नं. ४',
        'गट क्र. ११२',
        'झापडी वजा घर',
        [seedBlock2],
        100,
        80,
        DEFAULT_TAX_SETTINGS.defaultWaterTax,
        currentSystemYear,
        'pd-2',
        ''
      );
      const assPD2 = {
        ...propPD2,
        grampanchayat: 'पिंपळगाव डेरे',
        arrearsBuildingTax: 800,
        arrearsStreetLightTax: 150,
        arrearsHealthTax: 150,
        arrearsWaterTax: 400,
        recoveredBuildingTax: 100,
        recoveredStreetLightTax: 20,
        recoveredHealthTax: 20,
        recoveredWaterTax: 100,
        receiptBookNo: '४४',
        receiptNo: '४०२',
        receiptDate: '२०२६-०५-१६'
      };

      const seededList = [assPK1, assPK2, assPB1, assPB2, assPD1, assPD2];
      setSavedAssessments(seededList);
      localStorage.setItem('malmatta_assessments', JSON.stringify(seededList));
    }
  }, []);

  // Sync settings of default sub-taxes and dynamically compute slab rates when settings or blocks change
  useEffect(() => {
    if (!propertyId) {
      if (propertyType !== 'regular') {
        setStreetLightTax(0);
        setHealthTax(0);
        setWaterTax(0);
        return;
      }

      const totalAreaSqFt = blocks.reduce((sum, b) => sum + b.areaSqFt, 0);

      const slabsStreet = settings.streetLightSlabs || { slab1: 100, slab2: 200, slab3: 350 };
      const calculatedStreetLight = totalAreaSqFt <= 300 
        ? slabsStreet.slab1 
        : (totalAreaSqFt <= 700 ? slabsStreet.slab2 : slabsStreet.slab3);

      const slabsHealth = settings.healthSlabs || { slab1: 80, slab2: 150, slab3: 250 };
      const calculatedHealth = totalAreaSqFt <= 300 
        ? slabsHealth.slab1 
        : (totalAreaSqFt <= 700 ? slabsHealth.slab2 : slabsHealth.slab3);

      setStreetLightTax(calculatedStreetLight);
      setHealthTax(calculatedHealth);
      setWaterTax(settings.defaultWaterTax);
    }
  }, [settings, blocks, propertyId, propertyType]);

  // --- GramPanchayat Auth Handlers ---
  const handleLogin = (gpName: string, passwordOrPin?: string): boolean => {
    const gp = registeredGPs.find(g => g.name === gpName);
    if (!gp) return false;
    const storedPw = gp.adminPassword || 'admin';
    if (storedPw === passwordOrPin) {
      setActiveGP(gp);
      localStorage.setItem('active_gp_session', JSON.stringify(gp));
      // Prefill and sync configurations
      localStorage.setItem('cfg_gp', gp.name);
      if (gp.taluka) localStorage.setItem('cfg_taluka', gp.taluka);
      if (gp.district) localStorage.setItem('cfg_dist', gp.district);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setActiveGP(null);
    localStorage.removeItem('active_gp_session');
    setActiveTab('home');
  };

  const handleRegisterGP = (name: string, passwordOrPin?: string, taluka?: string, district?: string): boolean => {
    const exists = registeredGPs.some(g => g.name.trim().toLowerCase() === name.trim().toLowerCase());
    if (exists) return false;

    const newGP: GramPanchayat = {
      name: name.trim(),
      adminPassword: passwordOrPin || 'admin',
      taluka: taluka || 'संगमनेर',
      district: district || 'अहिल्यानगर'
    };

    const updated = [...registeredGPs, newGP];
    setRegisteredGPs(updated);
    localStorage.setItem('registered_grampanchayats', JSON.stringify(updated));
    return true;
  };

  const handleDeleteGP = (gpName: string) => {
    const updated = registeredGPs.filter(g => g.name !== gpName);
    setRegisteredGPs(updated);
    localStorage.setItem('registered_grampanchayats', JSON.stringify(updated));
    if (activeGP && activeGP.name === gpName) {
      handleLogout();
    }
  };

  const handlePSLogin = (password?: string): boolean => {
    if (password === 'admin' || password === 'psadmin') {
      setIsPSAdminActive(true);
      localStorage.setItem('is_ps_admin_session', 'true');
      return true;
    }
    return false;
  };

  const handlePSLogout = () => {
    setIsPSAdminActive(false);
    localStorage.setItem('is_ps_admin_session', 'false');
  };

  // Initializing first Block automatically when form is empty / clear
  useEffect(() => {
    if (blocks.length === 0) {
      addNewBlock();
    }
  }, [blocks]);

  // --- Block Handlers ---
  const addNewBlock = () => {
    const newId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newRawBlock: Partial<PropertyBlock> & { id: string } = {
      id: newId,
      constructionType: 'rcc',
      length: 25,
      width: 20,
      constructionYear: currentSystemYear,
      usageType: 'residential',
      readyReckonerLand: settings.defaultReadyReckonerLand,
      readyReckonerBuilding: settings.defaultReadyReckonerBuildingByConstructionType?.['rcc'] ?? settings.defaultReadyReckonerBuilding ?? 12000,
      depreciationRate: 0,
      taxRate: settings.taxRatesByConstructionType['rcc']
    };
    
    const fullyCalculated = calculateBlockValues(newRawBlock, settings, assessmentYear);
    setBlocks(prev => [...prev, fullyCalculated]);
  };

  const handleUpdateBlock = (blockId: string, updatedFields: Partial<PropertyBlock>) => {
    setBlocks(prev => 
      prev.map(b => {
        if (b.id === blockId) {
          const merged = { ...b, ...updatedFields };
          return calculateBlockValues(merged, settings, assessmentYear);
        }
        return b;
      })
    );
  };

  const handleDeleteBlock = (blockId: string) => {
    if (blocks.length <= 1) return; // Prevent deleting the last remaining block
    setBlocks(prev => prev.filter(b => b.id !== blockId));
  };

  // Recalculate all blocks if central variables (like general settings or Year) change
  const handleRecalculateAllBlocks = (newYear: number) => {
    setBlocks(prev => 
      prev.map(b => calculateBlockValues({ ...b }, settings, newYear))
    );
  };

  // --- General Form Reset ---
  const handleClearForm = () => {
    setPropertyId(null);
    setPropertyNumber('');
    setPropertyType('regular');
    setOwnerName('');
    setOccupantName('');
    setRoadName('');
    setGatNumber('');
    setPropertyDescription('');
    setAssessmentYear(currentSystemYear);
    setStreetLightTax(settings.defaultStreetLightTax);
    setHealthTax(settings.defaultHealthTax);
    setWaterTax(settings.defaultWaterTax);
    setNotes('');
    
    // Reset to single fresh block
    const sampleId = `block_${Date.now()}`;
    const freshBlock = calculateBlockValues({
      id: sampleId,
      constructionType: 'rcc',
      length: 20,
      width: 20,
      constructionYear: currentSystemYear,
      usageType: 'residential'
    }, settings, currentSystemYear);
    setBlocks([freshBlock]);
  };

  // --- Save / Submit Handlers ---
  const handleSaveAssessment = (e: FormEvent) => {
    e.preventDefault();
    if (!propertyNumber.trim()) {
      alert('कृपया मिळकत नंबर (Property No.) प्रविष्ट करा.');
      return;
    }

    // Check if property number already exists (duplicate check)
    const isDuplicate = savedAssessments.some(
      item => item.propertyNumber.trim().toLowerCase() === propertyNumber.trim().toLowerCase() && item.id !== propertyId
    );
    if (isDuplicate) {
      alert('या पूर्वी सदर मिळकत नंबर नोंदविला गेला आहे');
      return;
    }

    if (!ownerName.trim()) {
      alert('कृपया मिळकत धारकाचे नाव (Owner Name) प्रविष्ट करा.');
      return;
    }

    // Verify all blocks are calculated
    const finalBlocks = blocks.map(b => calculateBlockValues(b, settings, assessmentYear));
    const processedAssessment: PropertyAssessment = {
      ...calculateTotalAssessment(
        propertyNumber,
        ownerName,
        occupantName,
        roadName,
        gatNumber,
        propertyDescription,
        finalBlocks,
        streetLightTax,
        healthTax,
        waterTax,
        assessmentYear,
        propertyId || undefined,
        notes,
        propertyType
      ),
      grampanchayat: activeGP
        ? activeGP.name
        : (savedAssessments.find(item => item.id === propertyId)?.grampanchayat || localStorage.getItem('cfg_gp') || 'पिंपळगाव कोंढिरा')
    };

    let updatedList: PropertyAssessment[] = [];
    if (propertyId) {
      // Update existing
      updatedList = savedAssessments.map(item => item.id === propertyId ? processedAssessment : item);
    } else {
      // Add new
      updatedList = [processedAssessment, ...savedAssessments];
    }

    setSavedAssessments(updatedList);
    localStorage.setItem('malmatta_assessments', JSON.stringify(updatedList));
    
    // Automatically open the receipt preview for this saved sheet
    setSelectedForPrint(processedAssessment);

    // If we were editing, clear out the editing cursor
    setPropertyId(null);
  };

  // --- Database CRUD Actions ---
  const handleEditSavedAssessment = (assessment: PropertyAssessment) => {
    setPropertyId(assessment.id);
    setPropertyNumber(assessment.propertyNumber);
    setPropertyType(assessment.propertyType || 'regular');
    setOwnerName(assessment.ownerName);
    setOccupantName(assessment.occupantName);
    setRoadName(assessment.roadName || '');
    setGatNumber(assessment.gatNumber || '');
    setPropertyDescription(assessment.propertyDescription || '');
    setAssessmentYear(assessment.assessmentYear);
    setStreetLightTax(assessment.streetLightTax);
    setHealthTax(assessment.healthTax);
    setWaterTax(assessment.waterTax);
    setNotes(assessment.notes || '');
    setBlocks(assessment.blocks);

    // Route to main view to perform work
    setActiveTab('new-assessment');
  };

  const handleDeleteSavedAssessment = (id: string) => {
    const updated = savedAssessments.filter(item => item.id !== id);
    setSavedAssessments(updated);
    localStorage.setItem('malmatta_assessments', JSON.stringify(updated));
    
    // If we were editing the deleted record, reset form
    if (propertyId === id) {
      handleClearForm();
    }
  };

  const handleUpdateSavedAssessmentWithDemand = (updatedAssessment: PropertyAssessment) => {
    const updated = savedAssessments.map(item => item.id === updatedAssessment.id ? updatedAssessment : item);
    setSavedAssessments(updated);
    localStorage.setItem('malmatta_assessments', JSON.stringify(updated));
  };

  // --- Settings Panel Config ---
  const handleUpdateSettings = (newSettings: TaxSettings) => {
    setSettings(newSettings);
    localStorage.setItem('malmatta_tax_settings', JSON.stringify(newSettings));
    
    // Auto-update land rate, building rate, and tax rate of active blocks of the current form layout
    setBlocks(prev => 
      prev.map(b => {
        const merged = { 
          ...b, 
          readyReckonerLand: newSettings.defaultReadyReckonerLand,
          readyReckonerBuilding: b.constructionType === 'open_land' ? 0 : (newSettings.defaultReadyReckonerBuildingByConstructionType?.[b.constructionType] ?? newSettings.defaultReadyReckonerBuilding ?? 12000),
          taxRate: newSettings.taxRatesByConstructionType[b.constructionType] ?? b.taxRate
        };
        return calculateBlockValues(merged, newSettings, assessmentYear);
      })
    );
  };

  const handleResetSettings = () => {
    if (window.confirm('खरोखर सर्व दरांची पुनर्रचना राज्य सरकारी मूळ दरांमध्ये करायची आहे का?')) {
      const newSettings = DEFAULT_TAX_SETTINGS;
      setSettings(newSettings);
      localStorage.setItem('malmatta_tax_settings', JSON.stringify(newSettings));
      
      // Auto-update land rate, building rate, and tax rate of active blocks to default
      setBlocks(prev => 
        prev.map(b => {
          const merged = { 
            ...b, 
            readyReckonerLand: newSettings.defaultReadyReckonerLand,
            readyReckonerBuilding: b.constructionType === 'open_land' ? 0 : (newSettings.defaultReadyReckonerBuildingByConstructionType?.[b.constructionType] ?? newSettings.defaultReadyReckonerBuilding ?? 12000),
            taxRate: newSettings.taxRatesByConstructionType[b.constructionType] ?? b.taxRate
          };
          return calculateBlockValues(merged, newSettings, assessmentYear);
        })
      );
    }
  };

  // Live Math calculations in current form layout for summary side-card
  const formTotalAreaSqFt = blocks.reduce((sum, b) => sum + b.areaSqFt, 0);
  const formTotalAreaSqM = blocks.reduce((sum, b) => sum + b.areaSqM, 0);
  const formTotalConstructionTax = propertyType !== 'regular' ? 0 : blocks.reduce((sum, b) => sum + b.constructionTax, 0);
  const formGrandTotalTax = propertyType !== 'regular' ? 0 : Math.round(
    formTotalConstructionTax + Number(streetLightTax) + Number(healthTax) + Number(waterTax)
  );

  const gpScopedAssessments = activeGP 
    ? savedAssessments.filter(item => item.grampanchayat === activeGP.name)
    : savedAssessments;

  return (
    <div id="app-root-container" className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans">
      
      {/* Dynamic Header Block with UTC & Location Terms */}
      <header className="bg-indigo-950 text-white p-5 sm:p-6 shadow-xl sticky top-0 z-30 no-print">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 bg-white/10 px-2.5 py-1 rounded-none">
                महाराष्ट्र ग्रामपंचायत कर प्रणाली (Act Rule 8)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight uppercase leading-none mt-1.5">
              इमारत बांधकाम कर <span className="text-indigo-450">आकारणी</span>
            </h1>
            <p className="text-xs sm:text-sm font-semibold opacity-75 mt-1 tracking-widest uppercase">
              Property Construction Tax Assessment System • {currentSystemYear}-{String(currentSystemYear + 1).slice(-2)}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-auto justify-end">
            {/* Navigational Tabs row */}
            <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-none w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 font-black text-xs uppercase tracking-widest transition-all cursor-pointer min-h-[40px] rounded-none ${
                  activeTab === 'home' 
                    ? 'bg-indigo-650 text-white shadow-sm' 
                    : 'text-indigo-200 hover:text-white hover:bg-white/5'
                }`}
              >
                <Home className="w-4 h-4" />
                मुख्य पान
              </button>

              <button
                type="button"
                onClick={() => activeGP ? setActiveTab('new-assessment') : alert("कामकाज करण्यासाठी आधी मुख्य पानावरून आपल्या ग्रामपंचायतीचे अ‍ॅडमीन लॉगिन करा!")}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 font-black text-xs uppercase tracking-widest transition-all cursor-pointer min-h-[40px] rounded-none ${
                  activeTab === 'new-assessment' 
                    ? 'bg-indigo-650 text-white shadow-sm' 
                    : 'text-indigo-200 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileText className="w-4 h-4" />
                {propertyId ? 'बदल/दुरूस्ती' : 'नवीन आकारणी'}
              </button>

              <button
                type="button"
                onClick={() => activeGP ? setActiveTab('saved-list') : alert("कामकाज करण्यासाठी आधी मुख्य पानावरून आपल्या ग्रामपंचायतीचे अ‍ॅडमीन लॉगिन करा!")}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 font-black text-xs uppercase tracking-widest transition-all cursor-pointer min-h-[40px] rounded-none relative ${
                  activeTab === 'saved-list' 
                    ? 'bg-indigo-650 text-white shadow-sm' 
                    : 'text-indigo-200 hover:text-white hover:bg-white/5'
                }`}
              >
                <History className="w-4 h-4" />
                जतन यादी
                {activeGP && savedAssessments.filter(item => item.grampanchayat === activeGP.name).length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1.5 items-center justify-center rounded-none bg-rose-500 text-[9px] font-black text-white leading-none">
                    {savedAssessments.filter(item => item.grampanchayat === activeGP.name).length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => activeGP ? setActiveTab('demand-register') : alert("कामकाज करण्यासाठी आधी मुख्य पानावरून आपल्या ग्रामपंचायतीचे अ‍ॅडमीन लॉगिन करा!")}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 font-black text-xs uppercase tracking-widest transition-all cursor-pointer min-h-[40px] rounded-none ${
                  activeTab === 'demand-register' 
                    ? 'bg-indigo-650 text-white shadow-sm' 
                    : 'text-indigo-200 hover:text-white hover:bg-white/5'
                }`}
              >
                <Coins className="w-4 h-4 text-emerald-400" />
                नवीन कर मागणी
              </button>

              <button
                type="button"
                onClick={() => activeGP ? setActiveTab('settings') : alert("कामकाज करण्यासाठी आधी मुख्य पानावरून आपल्या ग्रामपंचायतीचे अ‍ॅडमीन लॉगिन करा!")}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 font-black text-xs uppercase tracking-widest transition-all cursor-pointer min-h-[40px] rounded-none ${
                  activeTab === 'settings' 
                    ? 'bg-indigo-650 text-white shadow-sm' 
                    : 'text-indigo-200 hover:text-white hover:bg-white/5'
                }`}
              >
                <SettingsIcon className="w-4 h-4" />
                नियमावली दर
              </button>

              {activeGP && (
                <button
                  type="button"
                  onClick={() => setActiveTab('welfare')}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 font-black text-xs uppercase tracking-widest transition-all cursor-pointer min-h-[40px] rounded-none relative border border-rose-500/10 ${
                    activeTab === 'welfare' 
                      ? 'bg-rose-700 text-white shadow-sm font-black border-rose-750' 
                      : 'text-rose-200 hover:text-white hover:bg-rose-900/30'
                  }`}
                >
                  <Accessibility className="w-4 h-4 text-rose-455 shrink-0" />
                  विशेष निधी
                </button>
              )}
            </div>

            <div className="hidden lg:block text-right min-w-[100px]">
              <div className="text-[10px] font-black opacity-50 uppercase tracking-widest">FORM ID</div>
              <div className="text-xl font-mono font-black tracking-tighter text-indigo-400">TAX-{currentSystemYear}-B02</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main id="main-content-layout" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 no-print">
        
        {/* Tab Selection Area */}
        {activeTab === 'new-assessment' && (
          <form onSubmit={handleSaveAssessment} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Side: Form Inputs (8 units wide on large screens) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Card 1: Primary Details */}
              <div className="bg-white border-2 border-slate-200 p-5 sm:p-6 rounded-none space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-xs font-black uppercase text-indigo-600 border-b-2 border-indigo-50 pb-1 inline-block tracking-widest">
                    १. प्राथमिक माहिती (Basic Info)
                  </h2>
                </div>

                {propertyId && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-none text-xs flex justify-between items-center font-bold">
                    <span>
                      ⚠️ तुम्ही सध्या नोंदणी क्रमांक <strong>{propertyNumber}</strong> च्या जतन केलेल्या माहितीत बदल करत आहात.
                    </span>
                    <button 
                      type="button" 
                      onClick={handleClearForm} 
                      className="underline font-black hover:text-amber-950 cursor-pointer uppercase tracking-widest ml-2 text-[10px]"
                    >
                      बदल रद्द करा (Cancel)
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase mb-1 opacity-60">
                      १. मिळकत नंबर (Property No. - Col 4) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. ८/१५४० अ"
                      value={propertyNumber}
                      onChange={(e) => setPropertyNumber(e.target.value)}
                      onBlur={() => {
                        const val = propertyNumber.trim();
                        if (val) {
                          const exists = savedAssessments.some(
                            item => item.propertyNumber.trim().toLowerCase() === val.toLowerCase() && item.id !== propertyId
                          );
                          if (exists) {
                            alert('या पूर्वी सदर मिळकत नंबर नोंदविला गेला आहे');
                          }
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none min-h-[42px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase mb-1 opacity-60">
                      २. रस्त्याचे नाव / गल्ली (Street / Road Name - Col 2)
                    </label>
                    <div className="space-y-2">
                      <select
                        value={(settings.roadsList ?? []).includes(roadName) ? roadName : (roadName === '' ? '' : '__custom__')}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '__custom__') {
                            setRoadName('');
                          } else {
                            setRoadName(val);
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none min-h-[42px] cursor-pointer"
                      >
                        <option value="">-- रस्ता / गल्ली निवडा --</option>
                        {(settings.roadsList ?? []).map((road, idx) => (
                          <option key={idx} value={road}>
                            {road}
                          </option>
                        ))}
                        <option value="__custom__">+ स्वतः नवीन नाव टाईप करा (Manual Entry)</option>
                      </select>

                      {/* Display custom input if roadName is not in the list or is empty with "__custom__" option active */}
                      {(!settings.roadsList || !settings.roadsList.includes(roadName) || roadName === '') && (
                        <input
                          type="text"
                          placeholder="रस्त्याचे नाव / गल्लीचे नाव टाईप करा..."
                          value={roadName}
                          onChange={(e) => setRoadName(e.target.value)}
                          className="w-full bg-indigo-50/50 border border-indigo-200 px-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none min-h-[42px]"
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase mb-1 opacity-60">
                      ३. गट क्र. / भूमापन क्रमांक (Gat / Survey No. - Col 3)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. गट ४५२/अ"
                      value={gatNumber}
                      onChange={(e) => setGatNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none min-h-[42px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase mb-1 opacity-60">
                      ४. मालमत्तेचे वर्णन (Property Description - Col 7)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. पक्के निवासी घर, दुमजली गाळा"
                      value={propertyDescription}
                      onChange={(e) => setPropertyDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none min-h-[42px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase mb-1 opacity-60">
                      ५. मिळकत धारकाचे नाव (Owner Name - Col 5) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="मालकाचे संपूर्ण नाव"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none min-h-[42px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase mb-1 opacity-60">
                      ६. भोगवटा धारकाचे नाव (Occupant Name - Col 6)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. मालक स्वतः किंवा भाडेकरू"
                      value={occupantName}
                      onChange={(e) => setOccupantName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none min-h-[42px]"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-1 bg-indigo-50/50 p-2.5 border border-indigo-200">
                    <label className="block text-[10px] font-bold uppercase mb-1 text-indigo-900 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-indigo-700" />
                      मालमत्ता प्रकार / श्रेणी (Property Category)
                    </label>
                    <select
                      value={propertyType}
                      onChange={(e) => {
                        const val = e.target.value as PropertyType;
                        setPropertyType(val);
                      }}
                      className="w-full bg-white border border-indigo-300 px-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none min-h-[42px] appearance-none cursor-pointer"
                    >
                      {Object.entries(PROPERTY_TYPE_LABELS).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-1">
                    <label className="block text-[10px] font-bold uppercase mb-1 opacity-60">
                      आर्थिक वर्ष (Financial Year - ०१ एप्रिल ते ३१ मार्च)
                    </label>
                    <select
                      value={assessmentYear}
                      onChange={(e) => {
                        const yr = parseInt(e.target.value) || currentSystemYear;
                        setAssessmentYear(yr);
                        handleRecalculateAllBlocks(yr);
                      }}
                      className="w-full bg-slate-50 border border-slate-250 px-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none min-h-[42px] appearance-none cursor-pointer"
                    >
                      <option value={currentSystemYear}>आर्थिक वर्ष {currentSystemYear} - {String(currentSystemYear + 1).slice(-2)} (०१ एप्रिल {currentSystemYear} ते ३१ मार्च {currentSystemYear + 1} - चालू वर्ष)</option>
                      <option value={currentSystemYear - 1}>आर्थिक वर्ष {currentSystemYear - 1} - {String(currentSystemYear).slice(-2)} (०१ एप्रिल {currentSystemYear - 1} ते ३१ मार्च {currentSystemYear})</option>
                      <option value={currentSystemYear - 2}>आर्थिक वर्ष {currentSystemYear - 2} - {String(currentSystemYear - 1).slice(-2)} (०१ एप्रिल {currentSystemYear - 2} ते ३१ मार्च {currentSystemYear - 1})</option>
                      <option value={currentSystemYear + 1}>आर्थिक वर्ष {currentSystemYear + 1} - {String(currentSystemYear + 2).slice(-2)} (०१ एप्रिल {currentSystemYear + 1} ते ३१ मार्च {currentSystemYear + 2})</option>
                    </select>
                  </div>
                </div>

                {propertyType !== 'regular' && (
                  <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-none text-xs flex items-start gap-2.5 font-bold">
                    <BadgeAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-black uppercase text-rose-800">कर माफी प्रमाणपत्र सक्रिय (Tax Exemption Active)</p>
                      <p className="mt-1 leading-relaxed opacity-90 text-[10px]">
                        महाराष्ट्र ग्रामपंचायत नियम अनुसार, निवडलेल्या श्रेणीतील (<strong>{PROPERTY_TYPE_LABELS[propertyType]}</strong>) मिळकतींसाठी मालमत्ता कर १००% माफ आहे. या मिळकतीवर कोणताही कर आकारला जाणार नाही (एकूण वार्षिक कर: ₹०.००).
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 2: Building Block segments List */}
              <div className="bg-white border-2 border-slate-200 p-5 sm:p-6 rounded-none space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex flex-col">
                    <h2 className="text-xs font-black uppercase text-indigo-600 border-b-2 border-indigo-50 pb-1 inline-block tracking-widest self-start">
                      ४-११. बांधकाम तपशील (Construction Details)
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                      स्वतंत्र बांधकाम ब्लॉक किंवा मजल्यांची नोंद करा
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={addNewBlock}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider rounded-none transition-colors cursor-pointer min-h-[36px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    नवीन फॉर्म जोडा (Add Block)
                  </button>
                </div>

                {/* Blocks Output list */}
                <div className="space-y-6">
                  {blocks.map((block, index) => (
                    <BlockForm
                      key={block.id}
                      block={block}
                      index={index}
                      settings={settings}
                      canDelete={blocks.length > 1}
                      onUpdateBlock={(fields) => handleUpdateBlock(block.id, fields)}
                      onDeleteBlock={() => handleDeleteBlock(block.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Card 3: Other Taxes list */}
              <div className="bg-white border-2 border-slate-200 p-5 sm:p-6 rounded-none space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-xs font-black uppercase text-indigo-600 border-b-2 border-indigo-50 pb-1 inline-block tracking-widest">
                    १६. २-४. इतर वार्षिक कर आणि उपकर (Other Taxes & Levies)
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase mb-1 opacity-60 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 text-amber-500" />
                      २. दिवाबत्ती कर (Light Tax)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400 font-bold text-sm">₹</span>
                      <input
                        type="number"
                        min="0"
                        disabled={propertyType !== 'regular'}
                        value={streetLightTax}
                        onChange={(e) => setStreetLightTax(parseInt(e.target.value) || 0)}
                        className={`w-full ${propertyType !== 'regular' ? 'bg-slate-100 opacity-60 text-slate-400 cursor-not-allowed' : 'bg-slate-50'} border border-slate-200 pl-7 pr-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none min-h-[42px]`}
                      />
                    </div>
                    {propertyType !== 'regular' ? (
                      <span className="block text-[9px] text-rose-600 font-black mt-1 bg-rose-50/50 p-1 border-l-2 border-rose-500">
                        कर माफी लागू: ₹0
                      </span>
                    ) : formTotalAreaSqFt > 0 && (
                      <span className="block text-[9px] text-indigo-600 font-black mt-1 bg-indigo-50/50 p-1 border-l-2 border-indigo-500">
                        एकूण {formTotalAreaSqFt.toFixed(0)} चौ.फू. वरून: ₹{streetLightTax} ({formTotalAreaSqFt <= 300 ? '०-३००' : formTotalAreaSqFt <= 700 ? '३०१-७००' : '७०१+'}) स्लॅब दर
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase mb-1 opacity-60 flex items-center gap-1">
                      <TrashIcon className="w-3 h-3 text-emerald-600" />
                      ३. आरोग्य कर (Sanitation)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400 font-bold text-sm">₹</span>
                      <input
                        type="number"
                        min="0"
                        disabled={propertyType !== 'regular'}
                        value={healthTax}
                        onChange={(e) => setHealthTax(parseInt(e.target.value) || 0)}
                        className={`w-full ${propertyType !== 'regular' ? 'bg-slate-100 opacity-60 text-slate-400 cursor-not-allowed' : 'bg-slate-50'} border border-slate-200 pl-7 pr-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none min-h-[42px]`}
                      />
                    </div>
                    {propertyType !== 'regular' ? (
                      <span className="block text-[9px] text-rose-600 font-black mt-1 bg-rose-50/50 p-1 border-l-2 border-rose-500">
                        कर माफी लागू: ₹0
                      </span>
                    ) : formTotalAreaSqFt > 0 && (
                      <span className="block text-[9px] text-emerald-600 font-black mt-1 bg-emerald-50/50 p-1 border-l-2 border-emerald-500">
                        एकूण {formTotalAreaSqFt.toFixed(0)} चौ.फू. वरून: ₹{healthTax} ({formTotalAreaSqFt <= 300 ? '०-३००' : formTotalAreaSqFt <= 700 ? '३०१-७००' : '७०१+'}) स्लॅब दर
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase mb-1 opacity-60 flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-500" />
                      ४. पाणीपट्टी कर (Water Tax)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400 font-bold text-sm">₹</span>
                      <input
                        type="number"
                        min="0"
                        disabled={propertyType !== 'regular'}
                        value={waterTax}
                        onChange={(e) => setWaterTax(parseInt(e.target.value) || 0)}
                        className={`w-full ${propertyType !== 'regular' ? 'bg-slate-100 opacity-60 text-slate-400 cursor-not-allowed' : 'bg-slate-50'} border border-slate-200 pl-7 pr-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none min-h-[42px]`}
                      />
                    </div>
                    {propertyType !== 'regular' && (
                      <span className="block text-[9px] text-rose-600 font-black mt-1 bg-rose-50/50 p-1 border-l-2 border-rose-500">
                        कर माफी लागू: ₹0
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase mb-1 opacity-60">
                    आकारणी बाबत अतिरिक्त टिप्पणी / विशेष शेरा (Additional Notes)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="उदा. मिळकतीत विशेष वापर किंवा नोंदणी..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 rounded-none"
                  />
                </div>
              </div>

            </div>

            {/* Right Side: Total summary card & actions panel (4 units wide) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Grand Live Calculation Summary Card */}
              <div id="live-tax-summary-card" className="bg-indigo-950 text-white p-5 rounded-none border-2 border-indigo-900 sticky top-24 space-y-6 shadow-xl">
                
                {/* Title */}
                <div>
                  <h2 className="text-[10px] font-black tracking-widest uppercase text-indigo-400">
                    कर सारांश (Live Tax Summary)
                  </h2>
                  <div className="text-[9px] font-extrabold text-emerald-400 tracking-wider uppercase mt-1">
                    ● Real-Time Calculation Active
                  </div>
                </div>

                {/* Numbers */}
                <div className="bg-white/5 p-4 rounded-none border border-white/10 space-y-3">
                  <div className="flex justify-between items-center text-xs text-indigo-200">
                    <span className="font-bold">१. एकूण बांधकाम कर (Blocks):</span>
                    <span className="font-bold font-mono text-white">₹{formTotalConstructionTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-indigo-200">
                    <span className="font-bold">२. दिवाबत्ती कर (Light):</span>
                    <span className="font-mono text-white">₹{(streetLightTax || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-indigo-200">
                    <span className="font-bold">३. आरोग्य कर (Sanitation):</span>
                    <span className="font-mono text-white">₹{(healthTax || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-indigo-200">
                    <span className="font-bold">४. पाणीपट्टी (Water):</span>
                    <span className="font-mono text-white">₹{(waterTax || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">एकूण वार्षिक कर =</span>
                    <span className="text-3xl font-black tracking-tighter text-white font-mono">
                      ₹{formGrandTotalTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                {/* Form submission operations */}
                <div className="space-y-3 pt-1">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-950/40 rounded-none transition-all cursor-pointer min-h-[44px]"
                  >
                    <Save className="w-4 h-4" />
                    जतन करा व पावती पहा
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('खरोखर सध्याचा सर्व तपशील खोडून नवीन कोरा अर्ज भरायचा आहे का?')) {
                        handleClearForm();
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-white/10 text-indigo-200 hover:text-white hover:bg-white/5 font-bold text-xs uppercase tracking-widest rounded-none transition-colors cursor-pointer min-h-[40px]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    कोरा फॉर्म (Reset)
                  </button>
                </div>

                {/* Instructions helper box */}
                <div className="text-[10px] bg-black/25 p-3.5 rounded-none border border-white/5 leading-relaxed space-y-1.5 text-indigo-200">
                  <div className="flex gap-1.5 items-start">
                    <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>
                      नवीन मिळकत कर नोंदवण्यासाठी सर्व बांधकाम ब्लॉक आणि इतर वार्षिक उपकर प्रविष्ट करून वरील <strong>"जतन करा"</strong> कळ दाबावी. जतन झाल्यानंतर त्याची छपाई किंवा पावती उपलब्ध होईल.
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </form>
        )}

        {activeTab === 'home' && (
          <HomeDashboard
            registeredGPs={registeredGPs}
            savedAssessments={savedAssessments}
            activeGP={activeGP}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onRegisterGP={handleRegisterGP}
            onSwitchTab={(tab) => setActiveTab(tab)}
            isPSAdminActive={isPSAdminActive}
            onPSLogin={handlePSLogin}
            onPSLogout={handlePSLogout}
            onDeleteGP={handleDeleteGP}
            assessmentYear={assessmentYear}
            savedWelfareList={savedWelfareList}
          />
        )}

        {activeTab === 'welfare' && activeGP && (
          <WelfareSchemes
            activeGPName={activeGP.name}
            assessmentYear={assessmentYear}
            onSaveWelfare={handleSaveWelfare}
            savedWelfareList={savedWelfareList}
          />
        )}

        {activeTab === 'saved-list' && (
          <SavedAssessments
            assessments={gpScopedAssessments}
            onSelectAssessment={(assessment) => setSelectedForPrint(assessment)}
            onEditAssessment={handleEditSavedAssessment}
            onDeleteAssessment={handleDeleteSavedAssessment}
            onAddNewAssessment={() => setActiveTab('new-assessment')}
            activeGPName={activeGP?.name}
            activeGPTaluka={activeGP?.taluka}
            activeGPDistrict={activeGP?.district}
          />
        )}

        {activeTab === 'demand-register' && (
          <DemandRegister
            assessments={gpScopedAssessments}
            roadsList={settings.roadsList ?? []}
            onUpdateAssessment={handleUpdateSavedAssessmentWithDemand}
            onAddNewAssessment={() => setActiveTab('new-assessment')}
            assessmentYear={assessmentYear}
            activeGPName={activeGP?.name}
            activeGPTaluka={activeGP?.taluka}
            activeGPDistrict={activeGP?.district}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetSettings={handleResetSettings}
          />
        )}

      </main>

      {/* Shared Printed Paper Popup */}
      {selectedForPrint && (
        <ReceiptPrint
          assessment={selectedForPrint}
          onClose={() => setSelectedForPrint(null)}
        />
      )}

      {/* Printed Only Wrapper - will be hidden on screen via tailwind and shown via global media query */}
      {selectedForPrint && (
        <div className="hidden print-only print-card">
          <ReceiptPrint
            assessment={selectedForPrint}
            onClose={() => setSelectedForPrint(null)}
          />
        </div>
      )}

      {/* Tiny descriptive footer */}
      <footer className="bg-slate-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-t border-slate-200 mt-12 no-print gap-3">
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center sm:text-left">
          * महाराष्ट्र नगरपरिषद व नगरपंचायत कर आकारणी नियमावली नुसार स्वयंचलित गणना • २०२६ आवृत्ती
        </div>
        <div className="flex gap-4">
          <span className="text-[9px] font-black text-indigo-900 uppercase underline tracking-widest cursor-pointer">Help Center</span>
          <span className="text-[9px] font-black text-indigo-900 uppercase underline tracking-widest cursor-pointer">Support: 1800-44-22</span>
        </div>
      </footer>

    </div>
  );
}
