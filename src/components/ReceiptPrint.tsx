import { PropertyAssessment } from '../types';
import { CONSTRUCTION_TYPE_LABELS, PROPERTY_TYPE_LABELS } from '../defaults';
import { Printer, X, ShieldCheck } from 'lucide-react';

interface ReceiptPrintProps {
  assessment: PropertyAssessment;
  onClose: () => void;
}

export default function ReceiptPrint({ assessment, onClose }: ReceiptPrintProps) {
  const handlePrint = () => {
    window.print();
  };

  const totalConstructionTax = assessment.blocks.reduce((sum, b) => sum + b.constructionTax, 0);

  return (
    <div id="receipt-modal-backdrop" className="fixed inset-0 bg-slate-900/75 flex items-center justify-center p-4 z-50 overflow-y-auto no-print">
      <div id="receipt-modal-content" className="bg-white border-4 border-slate-950 rounded-none w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-950 bg-slate-100 rounded-none flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 bg-indigo-950 text-white font-black text-[10px] uppercase rounded-none tracking-wider">नमुना ८</div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
              मालमत्ता कर आकारणी मागणी पत्रक (Tax Receipt Card)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest rounded-none transition-colors cursor-pointer min-h-[38px]"
            >
              <Printer className="w-4 h-4" />
              प्रिंट काढा (Print)
            </button>
            <button
              onClick={onClose}
              className="p-1 border border-slate-300 hover:border-slate-800 text-slate-700 rounded-none cursor-pointer flex items-center justify-center hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Scrollable Paper Area */}
        <div id="print-area-wrapper" className="p-4 sm:p-8 flex-1 overflow-y-auto">
          {/* Official styled letterhead */}
          <div className="border-[3px] border-double border-slate-950 p-5 sm:p-7 space-y-6 bg-white relative print-card rounded-none">
            
            {/* Panchayat Emblem Mock / Frame */}
            <div className="text-center space-y-1.5 pb-4 border-b border-dashed border-slate-350">
              <div className="font-bold text-base sm:text-xl text-slate-950 tracking-wider uppercase">
                ।। ग्रामपंचायत कार्यालय / स्थानिक स्वराज्य संस्था ।।
              </div>
              <div className="text-[10px] sm:text-xs font-black text-slate-800 uppercase tracking-widest">
                मालमत्ता कर आकारणी व मागणी पत्रक (महाराष्ट्र ग्रामपंचायत अधिनियम नियम ८ अन्वये)
              </div>
              <div className="text-[9px] text-slate-550 font-black font-mono uppercase tracking-widest">
                आर्थिक वर्ष: ०१ एप्रिल {assessment.assessmentYear} ते ३१ मार्च {assessment.assessmentYear + 1} | दिनांक: {assessment.assessmentDate}
              </div>
            </div>

            {/* Property details metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] font-bold text-slate-900 bg-slate-50 p-4 rounded-none border border-slate-300 animate-fade-in">
              <div className="space-y-2">
                <div className="flex">
                  <span className="text-slate-500 uppercase tracking-widest w-40">१. मिळकत नंबर (Prop No):</span>
                  <span className="font-black text-slate-900 font-mono text-xs">{assessment.propertyNumber || '—'}</span>
                </div>
                <div className="flex">
                  <span className="text-slate-500 uppercase tracking-widest w-40">२. रस्त्याचे नाव/गल्ली (Street):</span>
                  <span className="font-extrabold text-slate-900">{assessment.roadName || '—'}</span>
                </div>
                <div className="flex">
                  <span className="text-slate-500 uppercase tracking-widest w-40">३. गट क्र./भूमापन क्र. (Gat):</span>
                  <span className="font-extrabold text-slate-900">{assessment.gatNumber || '—'}</span>
                </div>
                <div className="flex">
                  <span className="text-slate-500 uppercase tracking-widest w-40">४. मिळकत धारक नाव (Owner):</span>
                  <span className="font-black text-slate-900">{assessment.ownerName || '—'}</span>
                </div>
              </div>
              <div className="space-y-2 sm:border-l sm:border-slate-300 sm:pl-4">
                <div className="flex">
                  <span className="text-slate-500 uppercase tracking-widest w-40">५. भोगवटा धारक नाव (Occupant):</span>
                  <span className="font-black text-slate-900">{assessment.occupantName || '—'}</span>
                </div>
                <div className="flex">
                  <span className="text-slate-500 uppercase tracking-widest w-40">६. मालमत्तेचे वर्णन (Desc):</span>
                  <span className="font-black text-slate-900 text-slate-700 whitespace-pre-wrap">{assessment.propertyDescription || '—'}</span>
                </div>
                <div className="flex">
                  <span className="text-slate-500 uppercase tracking-widest w-40">७. अहवाल दिनांक:</span>
                  <span className="font-mono text-slate-800">{assessment.assessmentDate}</span>
                </div>
                <div className="flex">
                  <span className="text-slate-500 uppercase tracking-widest w-40">८. मिळकत श्रेणी (Category):</span>
                  <span className={`font-black uppercase text-[9px] px-1.5 py-0.5 rounded-none ${assessment.propertyType && assessment.propertyType !== 'regular' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'text-indigo-950 bg-indigo-50 border border-indigo-250'}`}>
                    {assessment.propertyType ? PROPERTY_TYPE_LABELS[assessment.propertyType] : 'सामान्य (Regular / Taxable)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Building Blocks Details Table */}
            <div className="space-y-2">
              <div className="font-black text-[10px] text-indigo-950 uppercase tracking-widest flex items-center gap-1.5 pb-1">
                <span className="w-1.5 h-3 bg-indigo-600 rounded-none inline-block"></span>
                इमारत बांधकाम मोजमाप व भांडवली मूल्य विवरण (Calculations List):
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[10px] font-bold uppercase">
                  <thead>
                    <tr className="bg-indigo-950 text-white border-b-2 border-slate-900">
                      <th className="p-2 border border-slate-300 text-center">क्र.</th>
                      <th className="p-2 border border-slate-300">बांधकाम प्रकार & वापर</th>
                      <th className="p-2 border border-slate-300 text-center">मोजमाप (L X W)</th>
                      <th className="p-2 border border-slate-300 text-right">क्षेत्रफळ (चौ. मी)</th>
                      <th className="p-2 border border-slate-300 text-center">वय/घसार</th>
                      <th className="p-2 border border-slate-300 text-right">भांडवली मूल्य (₹)</th>
                      <th className="p-2 border border-slate-300 text-center">दर हजारी</th>
                      <th className="p-2 border border-slate-300 text-right">कर (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {assessment.blocks.map((block, i) => (
                      <tr key={block.id} className="hover:bg-slate-100">
                        <td className="p-2 border border-slate-300 text-center font-black">{i + 1}</td>
                        <td className="p-2 border border-slate-300 font-black">
                          <div>{CONSTRUCTION_TYPE_LABELS[block.constructionType]}</div>
                          <div className="text-[9px] text-slate-500 font-bold">वापर: {block.usageType === 'residential' ? 'निवासी' : block.usageType === 'commercial' ? 'वाणिज्य' : 'औद्योगिक'}</div>
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-bold">
                          {block.length} × {block.width} फूट
                          <div className="text-[9px] text-slate-550">({block.areaSqFt} चौ. फूट)</div>
                        </td>
                        <td className="p-2 border border-slate-300 text-right font-mono font-bold">
                          {block.areaSqM} SQ.M.
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-mono">
                          {block.buildingAge}Y / {block.depreciationRate}%
                        </td>
                        <td className="p-2 border border-slate-300 text-right font-mono font-black text-slate-900 bg-slate-50">
                          ₹{block.capitalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-mono">
                          ₹{block.taxRate}
                        </td>
                        <td className="p-2 border border-slate-300 text-right font-mono font-black text-indigo-950 bg-slate-100">
                          ₹{block.constructionTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tax Total Detailed Breakdown Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Formula & Reference instructions */}
              <div className="border-2 border-slate-200 p-4 rounded-none space-y-2 bg-slate-50 text-[9px] font-bold text-slate-700 uppercase">
                <div className="font-black text-slate-950 border-b border-slate-300 pb-1 text-[10px] tracking-wider">कर आकारणी सूत्र स्पष्टीकरण:</div>
                <div className="space-y-1.5 leading-relaxed">
                  <p>
                    <strong>भांडवली मूल्य:</strong> [ (क्षेत्रफळ चौ.मी. × जमीन रेकनर दर) + (क्षेत्रफळ चौ.मी. × घसारा वजा जाता इमारत दर) ] × वापर भारांक (निवासी: १.००, वाणिज्य: १.२०, औद्योगिक: १.२५)
                  </p>
                  <p>
                    <strong>बांधकाम कर आकारणी:</strong> (एकूण भांडवली मूल्य / १०००) × प्रकारानुसार ठरवून दिलेले दर हजारी
                  </p>
                </div>
              </div>

              {/* Total final sums */}
              <div className="border-4 border-indigo-950 p-4 rounded-none space-y-3 bg-white">
                <div className="font-black text-[10px] text-indigo-900 uppercase tracking-widest border-b-2 border-indigo-50 pb-2">
                  १६. अंतिम वार्षिक कराची रक्कम (Tax Sheet Summary):
                </div>

                {assessment.propertyType && assessment.propertyType !== 'regular' && (
                  <div className="bg-rose-50 border-2 border-dashed border-rose-400 p-3 text-center my-1 animate-pulse">
                    <div className="text-rose-700 font-extrabold text-xs tracking-wider uppercase">कर माफी लागू (TAX EXEMPT)</div>
                    <p className="text-[9px] text-rose-900 normal-case font-bold mt-1 leading-relaxed">
                      सदर मिळकत {PROPERTY_TYPE_LABELS[assessment.propertyType]} अंतर्गत मोडत असल्याने मालमत्ता कर प्रणालीनुसार १००% करमुक्त घोषित आहे.
                    </p>
                  </div>
                )}

                <div className="space-y-1.5 text-[11px] font-bold text-slate-800 uppercase">
                  <div className="flex justify-between items-center">
                    <span>१) एकूण बांधकाम कर (Blocks Tax sum):</span>
                    <span className="font-black font-mono text-slate-950">₹{totalConstructionTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>२) दिवाबत्ती कर (Street Light):</span>
                    <span className="font-mono text-slate-950">₹{(assessment.streetLightTax || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>३) आरोग्य कर (Sanitation):</span>
                    <span className="font-mono text-slate-950">₹{(assessment.healthTax || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>४) पाणीपट्टी (Water Tax):</span>
                    <span className="font-mono text-slate-950">₹{(assessment.waterTax || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>

                  <div className="border-t-2 border-slate-900 border-dashed pt-2.5 flex justify-between items-baseline text-slate-950">
                    <span className="font-black text-[11.5px] uppercase tracking-wider">५) एकूण वार्षिक कर (Grand Total):</span>
                    <span className="text-lg font-black text-indigo-950 px-2.5 py-1 rounded-none border border-indigo-955 bg-indigo-50 font-mono">
                      ₹{assessment.grandTotalTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Area */}
            <div className="flex justify-between items-end pt-12 text-[9px] font-bold uppercase text-slate-600">
              <div className="text-left text-slate-400 flex flex-col justify-end">
                <div className="flex items-center gap-1.5 text-indigo-900 font-black mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  डिजिटल मागणी पत्रक प्रणाली
                </div>
                <span>* ही संगणक प्रणालीद्वारे तयार केलेली स्वयंचलित कर पावती आहे.</span>
              </div>
              <div className="text-center w-56 border-t-2 border-slate-950 pt-2 font-black text-slate-900">
                ग्रामसेवक / कर निर्धारण अधिकारी
                <div className="text-[8px] text-slate-450 font-bold uppercase mt-0.5">ग्रामपंचायत / स्वराज्य संस्था स्वाक्षरी</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
