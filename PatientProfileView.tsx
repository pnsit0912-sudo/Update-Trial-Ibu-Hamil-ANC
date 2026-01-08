
import React, { useState } from 'react';
import { User, ANCVisit, UserRole, BabyLog } from './types';
import { calculatePregnancyProgress, getRiskCategory } from './utils';
import { 
  X, Baby, Calendar, MapPin, Activity, Stethoscope, 
  Heart, Droplets, AlertCircle, ClipboardCheck, ArrowLeft, Phone, Info,
  ShieldCheck, CheckCircle, BookOpen, ShieldAlert, Edit3, Trash2, PartyPopper, History, UserPlus, TrendingUp, Scale, Ruler, BrainCircuit, ListFilter, Download, Archive
} from 'lucide-react';

interface PatientProfileViewProps {
  patient: User;
  visits: ANCVisit[];
  onClose: () => void;
  onEditVisit?: (visit: ANCVisit) => void;
  onDeleteVisit?: (visitId: string) => void;
  onConfirmDelivery?: (user: User) => void;
  onNewPregnancy?: (user: User) => void;
  onAddBabyLog?: (user: User) => void;
  onEditBabyLog?: (patient: User, log: BabyLog) => void;
  onDeleteBabyLog?: (patientId: string, logId: string) => void;
  onFinishMonitoring?: (patientId: string, reason: 'LULUS_USIA' | 'MENINGGAL') => void;
  isStaff?: boolean;
}

const getConditionStyle = (condition: string) => {
  switch (condition) {
    case 'SEHAT': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'GIZI_KURANG': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'GIZI_BURUK': return 'bg-red-100 text-red-700 border-red-200';
    case 'STUNTING': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'SAKIT': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const formatCondition = (condition: string) => {
  return condition.replace('_', ' ').toUpperCase();
};

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({ 
  patient, visits, onClose, onEditVisit, onDeleteVisit, onConfirmDelivery, onNewPregnancy, onAddBabyLog, onEditBabyLog, onDeleteBabyLog, onFinishMonitoring, isStaff = false 
}) => {
  const [activeTab, setActiveTab] = useState<'ANC' | 'BABY'>(patient.isPostpartum ? 'BABY' : 'ANC');
  const [showFinishOptions, setShowFinishOptions] = useState(false);
  const progress = calculatePregnancyProgress(patient.hpht);
  const patientVisits = visits
    .filter(v => v.patientId === patient.id)
    .sort((a, b) => b.visitDate.localeCompare(a.visitDate));
  
  const latestVisit = patientVisits[0];
  const risk = getRiskCategory(patient.totalRiskScore, latestVisit);

  const sortedBabyLogs = [...(patient.babyLogs || [])].sort((a, b) => b.ageInMonths - a.ageInMonths);
  const latestBabyLog = sortedBabyLogs[0];

  const handleDownloadPDF = () => {
    const originalTitle = document.title;
    const documentName = patient.isPostpartum ? `KIA_BAYI_${patient.name}` : `KIA_IBU_${patient.name}`;
    document.title = documentName.replace(/\s+/g, '_').toUpperCase();
    
    setTimeout(() => {
      window.print();
      document.title = originalTitle;
    }, 100);
  };

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-10 duration-700 bg-white rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl max-w-7xl w-full mx-auto border border-gray-100 print:shadow-none print:border-none print:rounded-none">
      
      <div className="absolute top-6 right-6 z-50 no-print">
        <button onClick={onClose} className="p-3 bg-white/80 backdrop-blur text-gray-400 hover:text-red-500 rounded-full transition-all border border-gray-100 flex items-center justify-center group shadow-sm">
          <X size={20} className="group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      <div className="p-6 md:p-10 lg:p-14 space-y-10 print:p-0 print:space-y-6">
        {/* Banner Monitoring Selesai */}
        {patient.isPostpartum && patient.isBabyMonitoringActive === false && (
          <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex items-center justify-between animate-in slide-in-from-top-4 no-print">
             <div className="flex items-center gap-6">
                <div className="bg-white/10 p-4 rounded-2xl"><Archive size={24} className="text-indigo-400" /></div>
                <div>
                   <h4 className="text-lg font-black uppercase tracking-tighter">Monitoring Bayi Telah Selesai</h4>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status: {patient.babyMonitoringEndReason === 'LULUS_USIA' ? 'LULUS (>1 TAHUN)' : 'MENINGGAL DUNIA'}</p>
                </div>
             </div>
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] hidden md:block">Lokasi disembunyikan dari peta utama</p>
          </div>
        )}

        <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-gray-50 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.02)] print:border-none print:shadow-none print:rounded-none print:pb-10">
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 w-full md:w-auto">
            <div className={`w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center text-4xl md:text-5xl font-black shadow-2xl shrink-0 bg-gradient-to-br from-emerald-400 to-teal-600 text-white print:shadow-none print:border-2 print:border-teal-500`}>
              {patient.isPostpartum ? <Baby size={48}/> : patient.name.charAt(0)}
            </div>
            
            <div className="text-center md:text-left space-y-2 md:space-y-3 min-w-0">
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 uppercase tracking-tighter leading-none truncate">
                {patient.name}
              </h2>
              <p className="text-[10px] md:text-[11px] font-black text-indigo-500/70 uppercase tracking-[0.4em] md:tracking-[0.6em] ml-1">
                Identitas Rekam Medis Pasien
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4 mt-4">
                {patient.isPostpartum ? (
                  <span className="px-6 py-2 bg-emerald-400/20 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 print:bg-emerald-50">
                    Fase Nifas / Postpartum
                  </span>
                ) : (
                  <>
                    <span className="px-5 py-2 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                      G{patient.pregnancyNumber} P{patient.parityP} A{patient.parityA}
                    </span>
                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md ${risk.color} print:shadow-none`}>
                      Triase {risk.label}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end gap-3 relative z-10 w-full md:w-auto no-print">
            {patient.isPostpartum && isStaff && patient.isBabyMonitoringActive !== false && (
              <div className="relative">
                <button 
                  onClick={() => setShowFinishOptions(!showFinishOptions)}
                  className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
                >
                  <Archive size={16} /> Selesaikan Monitoring
                </button>
                {showFinishOptions && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-[100] space-y-2">
                     <button 
                       onClick={() => { if(window.confirm('Monitoring selesai karena bayi sudah 1 tahun?')) { onFinishMonitoring?.(patient.id, 'LULUS_USIA'); setShowFinishOptions(false); } }}
                       className="w-full text-left px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all"
                     >
                       Bayi Lulus (> 1 Thn)
                     </button>
                     <button 
                       onClick={() => { if(window.confirm('Monitoring berhenti karena kematian bayi? Data akan tetap disimpan sebagai riwayat.')) { onFinishMonitoring?.(patient.id, 'MENINGGAL'); setShowFinishOptions(false); } }}
                       className="w-full text-left px-4 py-3 bg-red-50 text-red-700 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                     >
                       Bayi Meninggal Dunia
                     </button>
                  </div>
                )}
              </div>
            )}

            {patient.isPostpartum && isStaff && patient.isBabyMonitoringActive !== false && (
              <>
                <button onClick={() => onAddBabyLog?.(patient)} className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-600 transition-all flex items-center gap-2">
                  <TrendingUp size={16} /> Update Tumbuh Kembang
                </button>
                <button onClick={() => onNewPregnancy?.(patient)} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
                  <UserPlus size={16} /> Hamil Lagi
                </button>
              </>
            )}
            {!patient.isPostpartum && isStaff && (
              <button onClick={() => onConfirmDelivery?.(patient)} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-2">
                <PartyPopper size={16} /> Konfirmasi Lahir
              </button>
            )}
            <a href={`tel:${patient.phone}`} className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all border border-indigo-100">
              <Phone size={22} />
            </a>
          </div>
        </div>

        <div className="flex gap-4 px-4 no-print">
           <button 
             onClick={() => setActiveTab('ANC')} 
             className={`px-8 py-4 font-black uppercase text-[10px] tracking-widest transition-all rounded-full flex items-center gap-2 ${activeTab === 'ANC' ? 'bg-indigo-600 text-white shadow-xl' : 'text-gray-400 hover:bg-gray-100'}`}
           >
             <Activity size={14} /> Riwayat Kehamilan
           </button>
           {patient.isPostpartum && (
             <button 
               onClick={() => setActiveTab('BABY')} 
               className={`px-8 py-4 font-black uppercase text-[10px] tracking-widest transition-all rounded-full flex items-center gap-2 ${activeTab === 'BABY' ? 'bg-emerald-500 text-white shadow-xl' : 'text-gray-400 hover:bg-gray-100'}`}
             >
               <Baby size={14} /> Monitoring Bayi (0-12 Bln)
             </button>
           )}
        </div>

        <div className="hidden print:block text-center border-b-4 border-emerald-600 pb-4 mb-8">
           <h3 className="text-2xl font-black uppercase tracking-tighter">
             {activeTab === 'BABY' ? 'REKAM MEDIS PERTUMBUHAN BAYI' : 'REKAM MEDIS KEHAMILAN (ANC)'}
           </h3>
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Sistem Informasi Smart ANC - Puskesmas Pasar Minggu</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 print:grid-cols-12">
          <div className="lg:col-span-4 space-y-8 print:col-span-4">
            {patient.isPostpartum ? (
              <div className="bg-[#0b8e62] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden h-full print:p-6 print:rounded-2xl print:shadow-none">
                <h3 className="text-[10px] font-black uppercase opacity-60 mb-10 flex items-center gap-3 print:mb-6">
                  <ClipboardCheck size={18} /> Profil Persalinan
                </h3>
                <div className="space-y-8 relative z-10 print:space-y-4">
                   {[
                     { l: 'TANGGAL LAHIR', v: patient.deliveryData?.deliveryDate },
                     { l: 'METODE', v: patient.deliveryData?.deliveryType },
                     { l: 'KONDISI IBU', v: patient.deliveryData?.maternalCondition },
                     { l: 'BB LAHIR BAYI', v: `${patient.deliveryData?.babyWeight} KG` },
                     { l: 'JENIS KELAMIN', v: patient.deliveryData?.babyGender === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN' }
                   ].map((item, i) => (
                     <div key={i} className="flex justify-between items-end border-b border-white/10 pb-4 print:pb-2">
                       <p className="text-[9px] font-black uppercase opacity-60 tracking-widest">{item.l}</p>
                       <p className="text-xl font-black print:text-base">{item.v}</p>
                     </div>
                   ))}
                </div>
                <Baby size={180} className="absolute -right-10 -bottom-10 opacity-5 rotate-12 no-print" />
              </div>
            ) : (
              <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden h-full print:p-6 print:rounded-2xl print:shadow-none">
                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-10 flex items-center gap-3">
                  <Activity size={18} /> Kondisi Kehamilan
                </h3>
                <div className="space-y-8 relative z-10 print:space-y-4">
                  <div className="flex justify-between items-end border-b border-white/10 pb-6 print:pb-2">
                    <p className="text-[11px] font-black uppercase opacity-60 tracking-widest">Usia Hamil</p>
                    <p className="text-4xl md:text-5xl font-black tracking-tighter print:text-2xl">{progress?.weeks || '0'} Minggu</p>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/10 pb-6 print:pb-2">
                    <p className="text-[11px] font-black uppercase opacity-60 tracking-widest">HPL (Hari Lahir)</p>
                    <p className="text-xl font-black print:text-base">{progress?.hpl || 'N/A'}</p>
                  </div>
                  <div className="pt-6 print:hidden">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Progress</p>
                      <p className="text-lg font-black">{progress?.percentage || 0}%</p>
                    </div>
                    <div className="h-4 bg-black/20 rounded-full overflow-hidden p-1">
                      <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${progress?.percentage || 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-6 print:p-6 print:rounded-2xl print:shadow-none">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                <MapPin size={20} className="text-indigo-600" /> Lokasi Domisili
              </h3>
              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 print:bg-white print:p-2 print:border-none">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Alamat Lengkap</p>
                <p className="text-xs font-bold text-gray-800 leading-relaxed">{patient.address}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8 print:col-span-8">
            {activeTab === 'ANC' ? (
              <div className="space-y-10 print:space-y-6">
                <div className="flex items-center justify-between px-2 print:hidden">
                  <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-4">
                    <ClipboardCheck size={32} className="text-indigo-600" /> Riwayat Pemeriksaan ANC
                  </h3>
                  <div className="px-6 py-2.5 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase">
                    {patientVisits.length} Records
                  </div>
                </div>

                <div className="space-y-8 print:space-y-4">
                  {patientVisits.length === 0 ? (
                    <div className="bg-white p-24 rounded-[4rem] border-4 border-dashed border-gray-100 text-center flex flex-col items-center">
                      <Activity size={64} className="text-gray-100 mb-6" />
                      <h4 className="text-xl font-black text-gray-300 uppercase tracking-widest">Belum Ada Catatan Klinis</h4>
                    </div>
                  ) : (
                    patientVisits.map((visit, idx) => (
                      <div key={visit.id} className="bg-white rounded-[3.5rem] shadow-sm border border-gray-100 overflow-hidden transition-all print:shadow-none print:border print:rounded-2xl print:break-inside-avoid">
                        <div className="bg-gray-50/50 px-10 py-8 border-b border-gray-100 flex justify-between items-center print:px-6 print:py-4">
                          <div className="flex items-center gap-5">
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-indigo-600 print:p-2 print:rounded-lg">
                              <Calendar size={20} />
                            </div>
                            <div>
                              <p className="text-xl font-black text-gray-900 uppercase print:text-base">
                                {new Date(visit.visitDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Oleh Nakes ID: {visit.nakesId}</p>
                            </div>
                          </div>
                          {isStaff && (
                            <div className="flex items-center gap-3 no-print">
                              <button 
                                onClick={() => onEditVisit?.(visit)} 
                                className="p-4 bg-white text-gray-400 hover:text-indigo-600 rounded-2xl transition-all border border-gray-100 shadow-sm hover:shadow-md"
                                title="Edit Riwayat"
                              >
                                <Edit3 size={18} />
                              </button>
                              <button 
                                onClick={() => { if(window.confirm('Hapus riwayat pemeriksaan ini secara permanen?')) onDeleteVisit?.(visit.id) }} 
                                className="p-4 bg-white text-gray-400 hover:text-red-500 rounded-2xl transition-all border border-gray-100 shadow-sm hover:shadow-md"
                                title="Hapus Riwayat"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="p-10 space-y-10 print:p-6 print:space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 print:grid-cols-5">
                            {[
                              { l: 'TD (mmHg)', v: visit.bloodPressure, i: <Activity size={14}/>, c: 'text-indigo-600' },
                              { l: 'BB (Kg)', v: visit.weight, i: <ClipboardCheck size={14}/>, c: 'text-indigo-600' },
                              { l: 'TFU (cm)', v: visit.tfu, i: <Stethoscope size={14}/>, c: 'text-indigo-600' },
                              { l: 'DJJ (x/m)', v: visit.djj, i: <Heart size={14}/>, c: 'text-red-600' },
                              { l: 'Hb (g/dL)', v: visit.hb, i: <Droplets size={14}/>, c: 'text-blue-600' },
                            ].map((item, i) => (
                              <div key={i} className="bg-gray-50/50 p-6 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center print:p-2 print:rounded-xl">
                                 <p className="text-[8px] font-black text-gray-400 uppercase mb-2 print:mb-1">{item.l}</p>
                                 <p className="text-lg font-black text-gray-900 print:text-sm">{item.v}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-10 print:space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-2 gap-4 print:hidden">
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-4">
                      <TrendingUp size={32} className="text-emerald-500" /> Rekam Medis Bayi
                    </h3>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Siklus Pertumbuhan 0-12 Bulan</p>
                  </div>
                  <div className="px-6 py-3 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase shadow-xl shadow-emerald-100 flex items-center gap-3">
                    <ListFilter size={16} /> {sortedBabyLogs.length} Kunjungan
                  </div>
                </div>

                <div className="bg-white rounded-[3.5rem] shadow-sm border border-gray-100 overflow-hidden print:rounded-2xl print:border print:shadow-none">
                   {sortedBabyLogs.length === 0 ? (
                     <div className="p-24 text-center flex flex-col items-center">
                       <Baby size={80} className="text-emerald-100 mb-8" />
                       <h4 className="text-2xl font-black text-gray-300 uppercase tracking-widest">Belum Ada Data Bayi</h4>
                     </div>
                   ) : (
                     <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left">
                          <thead className="bg-[#f8fcfb] print:bg-emerald-50">
                            <tr className="text-[10px] font-black uppercase text-gray-400 border-b border-gray-100 print:text-emerald-800">
                              <th className="px-10 py-8 print:px-4 print:py-4">Usia & Tanggal</th>
                              <th className="px-8 py-8 print:px-4 print:py-4">Status & Gizi</th>
                              <th className="px-8 py-8 print:px-4 print:py-4">Metrik (BB/PB/LK)</th>
                              <th className="px-8 py-8 print:px-4 print:py-4">Imunisasi</th>
                              <th className="px-8 py-8 print:px-4 print:py-4">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {sortedBabyLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-emerald-50/10 transition-colors group print:break-inside-avoid">
                                <td className="px-10 py-8 print:px-4 print:py-4">
                                   <p className="text-base font-black text-gray-900 uppercase print:text-sm">{log.ageInMonths} Bulan</p>
                                   <p className="text-[9px] font-bold text-gray-400 mt-1">{log.date}</p>
                                </td>
                                <td className="px-8 py-8 print:px-4 print:py-4">
                                   <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border ${getConditionStyle(log.condition)}`}>
                                     {formatCondition(log.condition || 'SEHAT')}
                                   </span>
                                </td>
                                <td className="px-8 py-8 print:px-4 print:py-4">
                                   <div className="flex gap-3">
                                      <div className="flex flex-col"><span className="text-[8px] font-black text-gray-400 uppercase">BB</span><span className="text-xs font-black text-indigo-600">{log.weight}kg</span></div>
                                      <div className="flex flex-col"><span className="text-[8px] font-black text-gray-400 uppercase">PB</span><span className="text-xs font-black text-indigo-600">{log.height}cm</span></div>
                                      <div className="flex flex-col"><span className="text-[8px] font-black text-gray-400 uppercase">LK</span><span className="text-xs font-black text-indigo-600">{log.headCircumference}cm</span></div>
                                   </div>
                                </td>
                                <td className="px-8 py-8 print:px-4 print:py-4">
                                   <div className="flex flex-wrap gap-1">
                                      {log.immunization ? (
                                        <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-black uppercase print:text-[8px] print:px-2">{log.immunization}</span>
                                      ) : (
                                        <span className="text-[10px] font-bold text-gray-300 italic">Kosong</span>
                                      )}
                                   </div>
                                </td>
                                <td className="px-8 py-8 print:px-4 print:py-4">
                                   {isStaff && patient.isBabyMonitoringActive !== false ? (
                                     <div className="flex items-center gap-2 no-print">
                                        <button 
                                          onClick={() => onEditBabyLog?.(patient, log)}
                                          className="p-2.5 bg-gray-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-50"
                                        >
                                          <Edit3 size={14} />
                                        </button>
                                        <button 
                                          onClick={() => onDeleteBabyLog?.(patient.id, log.id)}
                                          className="p-2.5 bg-gray-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-50"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                     </div>
                                   ) : (
                                     <p className="text-xs font-bold text-gray-500 italic max-w-[150px] truncate group-hover:whitespace-normal transition-all print:text-[9px]">
                                       {log.notes || '-'}
                                     </p>
                                   )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                     </div>
                   )}
                </div>
                
                {sortedBabyLogs.length > 0 && (
                  <div className="bg-emerald-50/50 p-10 rounded-[3.5rem] border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-8 print:p-6 print:rounded-2xl">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center text-emerald-600 shadow-xl border border-emerald-100 print:w-10 print:h-10 print:rounded-lg">
                           <ShieldCheck size={28} className="print:w-5 print:h-5" />
                        </div>
                        <div>
                           <h4 className="text-lg font-black text-emerald-900 uppercase print:text-base">
                             Status Pertumbuhan: {latestBabyLog?.condition ? formatCondition(latestBabyLog.condition) : 'NORMAL'}
                           </h4>
                           <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Berdasarkan penilaian tenaga kesehatan terakhir</p>
                        </div>
                     </div>
                     <button 
                       onClick={handleDownloadPDF}
                       className="px-10 py-5 bg-white border-2 border-emerald-400 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-3 no-print"
                     >
                       <Download size={18} /> Download PDF Buku KIA
                     </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden print:block text-center pt-10 border-t border-gray-100 mt-10">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Dokumen Resmi - Smart ANC Puskesmas Pasar Minggu</p>
        <p className="text-[9px] font-bold text-gray-300 mt-1 uppercase">Dicetak pada {new Date().toLocaleString('id-ID')}</p>
        <div className="mt-4 opacity-10 flex justify-center">
           <PartyPopper size={40} />
        </div>
      </div>
    </div>
  );
};
