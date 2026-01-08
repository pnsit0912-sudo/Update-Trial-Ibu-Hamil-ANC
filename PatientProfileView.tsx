
import React, { useState } from 'react';
import { User, ANCVisit, UserRole, BabyLog } from './types';
import { calculatePregnancyProgress, getRiskCategory } from './utils';
import { 
  X, Baby, Calendar, MapPin, Activity, Stethoscope, 
  Heart, Droplets, AlertCircle, ClipboardCheck, ArrowLeft, Phone, Info,
  ShieldCheck, CheckCircle, BookOpen, ShieldAlert, Edit3, Trash2, PartyPopper, History, UserPlus, TrendingUp, Scale, Ruler, BrainCircuit, ListFilter
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
  isStaff?: boolean;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({ 
  patient, visits, onClose, onEditVisit, onDeleteVisit, onConfirmDelivery, onNewPregnancy, onAddBabyLog, isStaff = false 
}) => {
  const [activeTab, setActiveTab] = useState<'ANC' | 'BABY'>(patient.isPostpartum ? 'BABY' : 'ANC');
  const progress = calculatePregnancyProgress(patient.hpht);
  const patientVisits = visits
    .filter(v => v.patientId === patient.id)
    .sort((a, b) => b.visitDate.localeCompare(a.visitDate));
  
  const latestVisit = patientVisits[0];
  const risk = getRiskCategory(patient.totalRiskScore, latestVisit);

  const sortedBabyLogs = [...(patient.babyLogs || [])].sort((a, b) => b.ageInMonths - a.ageInMonths);

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-10 duration-700 bg-white rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl">
      {/* Close Button */}
      <div className="absolute top-6 right-6 z-50">
        <button onClick={onClose} className="p-3 bg-white/50 backdrop-blur text-gray-400 hover:text-red-500 rounded-full transition-all border border-gray-100 flex items-center justify-center group shadow-sm">
          <X size={20} className="group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      <div className="p-6 md:p-10 lg:p-12 space-y-10">
        {/* Header Section */}
        <div className={`p-8 md:p-12 rounded-[3rem] border flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden shadow-sm ${patient.isPostpartum ? 'bg-emerald-50/50 border-emerald-100' : 'bg-gray-50/50 border-gray-100'}`}>
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 w-full md:w-auto">
            <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-4xl md:text-5xl font-black shadow-xl shrink-0 bg-gradient-to-br ${patient.isPostpartum ? 'from-emerald-400 to-emerald-600 text-white' : 'from-emerald-400 to-teal-600 text-white'}`}>
              {patient.isPostpartum ? <Baby size={48}/> : patient.name.charAt(0)}
            </div>
            
            <div className="text-center md:text-left space-y-2 md:space-y-3 min-w-0">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter leading-none truncate">
                {patient.name}
              </h2>
              <p className="text-[9px] md:text-[10px] font-black text-indigo-500/70 uppercase tracking-[0.3em] md:tracking-[0.5em] ml-1">
                Identitas Rekam Medis Pasien
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4 mt-4">
                {patient.isPostpartum ? (
                  <span className="px-5 py-2 bg-emerald-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100">
                    Fase Nifas / Postpartum
                  </span>
                ) : (
                  <>
                    <span className="px-5 py-2 bg-gray-200/50 text-gray-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                      G{patient.pregnancyNumber} P{patient.parityP} A{patient.parityA}
                    </span>
                    <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md ${risk.color}`}>
                      Triase {risk.label}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end gap-3 relative z-10 w-full md:w-auto">
            {!patient.isPostpartum && isStaff && (
              <button onClick={() => onConfirmDelivery?.(patient)} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-2">
                <PartyPopper size={16} /> Konfirmasi Lahir
              </button>
            )}
            {patient.isPostpartum && isStaff && (
              <>
                <button onClick={() => onAddBabyLog?.(patient)} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-2">
                  <Baby size={16} /> Update Tumbuh Kembang
                </button>
                <button onClick={() => onNewPregnancy?.(patient)} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2">
                  <UserPlus size={16} /> Hamil Lagi
                </button>
              </>
            )}
            <a href={`tel:${patient.phone}`} className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all shadow-sm">
              <Phone size={20} />
            </a>
          </div>
        </div>

        {/* Tab Navigation - Refined for visibility */}
        <div className="flex gap-2 p-2 bg-gray-100/50 rounded-[2rem] w-fit">
           <button 
             onClick={() => setActiveTab('ANC')} 
             className={`px-8 py-4 font-black uppercase text-[10px] tracking-widest transition-all rounded-[1.5rem] flex items-center gap-2 ${activeTab === 'ANC' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
           >
             <Activity size={14} /> Riwayat Kehamilan
           </button>
           {patient.isPostpartum && (
             <button 
               onClick={() => setActiveTab('BABY')} 
               className={`px-8 py-4 font-black uppercase text-[10px] tracking-widest transition-all rounded-[1.5rem] flex items-center gap-2 ${activeTab === 'BABY' ? 'bg-white text-emerald-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
             >
               <Baby size={14} /> Monitoring Bayi (0-12 Bln)
             </button>
           )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-8">
            {patient.isPostpartum ? (
              <div className="bg-emerald-600 p-8 md:p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                <h3 className="text-[9px] font-black uppercase opacity-60 mb-6 flex items-center gap-2">
                  <ClipboardCheck size={14} /> Profil Persalinan
                </h3>
                <div className="space-y-4 relative z-10">
                   {[
                     { l: 'Tanggal Lahir', v: patient.deliveryData?.deliveryDate },
                     { l: 'Metode', v: patient.deliveryData?.deliveryType },
                     { l: 'Kondisi Ibu', v: patient.deliveryData?.maternalCondition },
                     { l: 'BB Lahir Bayi', v: `${patient.deliveryData?.babyWeight} KG` },
                     { l: 'Jenis Kelamin', v: patient.deliveryData?.babyGender === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN' }
                   ].map((item, i) => (
                     <div key={i} className="flex justify-between items-end border-b border-white/10 pb-3">
                       <p className="text-[8px] font-black uppercase opacity-60">{item.l}</p>
                       <p className="text-lg font-black">{item.v}</p>
                     </div>
                   ))}
                </div>
              </div>
            ) : (
              <div className="bg-indigo-600 p-8 md:p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                <h3 className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-8 flex items-center gap-2">
                  <Activity size={14} /> Kondisi Kehamilan
                </h3>
                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Usia Hamil</p>
                    <p className="text-3xl md:text-4xl font-black tracking-tighter">{progress?.weeks || '0'} Minggu</p>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">HPL (Hari Lahir)</p>
                    <p className="text-lg font-black">{progress?.hpl || 'N/A'}</p>
                  </div>
                  <div className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[8px] font-black uppercase opacity-60 tracking-widest">Progress</p>
                      <p className="text-sm font-black">{progress?.percentage || 0}%</p>
                    </div>
                    <div className="h-3 bg-black/20 rounded-full overflow-hidden p-0.5">
                      <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${progress?.percentage || 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                <MapPin size={16} className="text-indigo-600" /> Lokasi Domisili
              </h3>
              <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Alamat Lengkap</p>
                <p className="text-xs font-bold text-gray-800 leading-relaxed">{patient.address}</p>
              </div>
            </div>
          </div>

          {/* Main Content: ANC History OR Baby Monitoring Table */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'ANC' ? (
              <>
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
                    <ClipboardCheck size={28} className="text-indigo-600" /> Riwayat Pemeriksaan ANC
                  </h3>
                  <div className="px-5 py-2 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase">
                    {patientVisits.length} Records
                  </div>
                </div>

                <div className="space-y-6">
                  {patientVisits.length === 0 ? (
                    <div className="bg-white p-20 rounded-[3rem] border-4 border-dashed border-gray-100 text-center flex flex-col items-center">
                      <Activity size={48} className="text-gray-100 mb-4" />
                      <h4 className="text-lg font-black text-gray-300 uppercase tracking-widest">Belum Ada Catatan</h4>
                    </div>
                  ) : (
                    patientVisits.map((visit, idx) => (
                      <div key={visit.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-right-10 transition-all hover:shadow-xl hover:border-indigo-100" style={{ animationDelay: `${idx * 100}ms` }}>
                        <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-indigo-600">
                              <Calendar size={18} />
                            </div>
                            <div>
                              <p className="text-lg font-black text-gray-900 uppercase">
                                {new Date(visit.visitDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Oleh Nakes ID: {visit.nakesId}</p>
                            </div>
                          </div>
                          {isStaff && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => onEditVisit?.(visit)} className="p-3 bg-white text-gray-400 hover:text-indigo-600 rounded-xl transition-all border border-gray-100"><Edit3 size={16} /></button>
                              <button onClick={() => onDeleteVisit?.(visit.id)} className="p-3 bg-white text-gray-400 hover:text-red-500 rounded-xl transition-all border border-gray-100"><Trash2 size={16} /></button>
                            </div>
                          )}
                        </div>
                        <div className="p-8 space-y-6">
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {[
                              { l: 'TD (mmHg)', v: visit.bloodPressure, i: <Activity size={12}/>, c: 'text-indigo-600' },
                              { l: 'BB (Kg)', v: visit.weight, i: <ClipboardCheck size={12}/>, c: 'text-indigo-600' },
                              { l: 'TFU (cm)', v: visit.tfu, i: <Stethoscope size={12}/>, c: 'text-indigo-600' },
                              { l: 'DJJ (x/m)', v: visit.djj, i: <Heart size={12}/>, c: 'text-red-600' },
                              { l: 'Hb (g/dL)', v: visit.hb, i: <Droplets size={12}/>, c: 'text-blue-600' },
                            ].map((item, i) => (
                              <div key={i} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                                 <div className={`${item.c} mb-2 opacity-60`}>{item.i}</div>
                                 <p className="text-[7px] font-black text-gray-400 uppercase mb-1">{item.l}</p>
                                 <p className="text-sm font-black text-gray-900">{item.v}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-2 gap-4">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
                      <TrendingUp size={28} className="text-emerald-600" /> Rekam Medis Bayi
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Siklus Pertumbuhan 0-12 Bulan</p>
                  </div>
                  <div className="px-5 py-2 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-emerald-100 flex items-center gap-2">
                    <ListFilter size={14} /> {sortedBabyLogs.length} Kunjungan
                  </div>
                </div>

                <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                   {sortedBabyLogs.length === 0 ? (
                     <div className="p-20 text-center flex flex-col items-center">
                       <Baby size={64} className="text-emerald-100 mb-6" />
                       <h4 className="text-xl font-black text-gray-300 uppercase tracking-widest">Belum Ada Data Bayi</h4>
                       <p className="text-xs text-gray-400 mt-2 font-bold max-w-xs">Data akan muncul di sini setelah Nakes melakukan input monitoring bulanan.</p>
                       {isStaff && (
                         <button onClick={() => onAddBabyLog?.(patient)} className="mt-8 px-8 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest">Input Data Perdana</button>
                       )}
                     </div>
                   ) : (
                     <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50/50">
                            <tr className="text-[9px] font-black uppercase text-gray-400 border-b border-gray-100">
                              <th className="px-10 py-6">Usia & Tanggal</th>
                              <th className="px-10 py-6"><div className="flex items-center gap-2"><Scale size={12}/> BB (Kg)</div></th>
                              <th className="px-10 py-6"><div className="flex items-center gap-2"><Ruler size={12}/> PB (Cm)</div></th>
                              <th className="px-10 py-6"><div className="flex items-center gap-2"><BrainCircuit size={12}/> LK (Cm)</div></th>
                              <th className="px-10 py-6">Imunisasi / Vitamin</th>
                              <th className="px-10 py-6">Keterangan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {sortedBabyLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-emerald-50/10 transition-colors group">
                                <td className="px-10 py-7">
                                   <p className="text-sm font-black text-gray-900 uppercase">{log.ageInMonths} Bulan</p>
                                   <p className="text-[8px] font-bold text-gray-400 mt-1">{log.date}</p>
                                </td>
                                <td className="px-10 py-7">
                                   <span className="text-sm font-black text-indigo-600">{log.weight}</span>
                                </td>
                                <td className="px-10 py-7">
                                   <span className="text-sm font-black text-indigo-600">{log.height}</span>
                                </td>
                                <td className="px-10 py-7">
                                   <span className="text-sm font-black text-indigo-600">{log.headCircumference}</span>
                                </td>
                                <td className="px-10 py-7">
                                   <div className="flex flex-wrap gap-1">
                                      {log.immunization ? (
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-black uppercase">{log.immunization}</span>
                                      ) : (
                                        <span className="text-[9px] font-bold text-gray-300 italic">Tidak ada data</span>
                                      )}
                                   </div>
                                </td>
                                <td className="px-10 py-7">
                                   <p className="text-[10px] font-bold text-gray-500 italic max-w-[150px] truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                                     {log.notes || '-'}
                                   </p>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                     </div>
                   )}
                </div>
                
                {sortedBabyLogs.length > 0 && (
                  <div className="bg-emerald-50/50 p-8 rounded-[3rem] border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100"><ShieldCheck size={20}/></div>
                        <div>
                           <h4 className="text-sm font-black text-emerald-900 uppercase">Status Pertumbuhan: Normal</h4>
                           <p className="text-[9px] font-bold text-emerald-600 uppercase">Berdasarkan data input kunjungan terakhir</p>
                        </div>
                     </div>
                     <button className="px-6 py-3 bg-white border border-emerald-200 text-emerald-600 rounded-xl text-[9px] font-black uppercase shadow-sm hover:bg-emerald-600 hover:text-white transition-all">Download PDF Buku KIA</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
