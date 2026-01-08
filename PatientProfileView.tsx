
import React from 'react';
import { User, ANCVisit, UserRole } from './types';
import { calculatePregnancyProgress, getRiskCategory } from './utils';
import { 
  X, Baby, Calendar, MapPin, Activity, Stethoscope, 
  Heart, Droplets, AlertCircle, ClipboardCheck, ArrowLeft, Phone, Info,
  ShieldCheck, CheckCircle, BookOpen, ShieldAlert, Edit3, Trash2, PartyPopper, History, UserPlus
} from 'lucide-react';

interface PatientProfileViewProps {
  patient: User;
  visits: ANCVisit[];
  onClose: () => void;
  onEditVisit?: (visit: ANCVisit) => void;
  onDeleteVisit?: (visitId: string) => void;
  onConfirmDelivery?: (user: User) => void;
  onNewPregnancy?: (user: User) => void;
  isStaff?: boolean;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({ 
  patient, visits, onClose, onEditVisit, onDeleteVisit, onConfirmDelivery, onNewPregnancy, isStaff = false 
}) => {
  const progress = calculatePregnancyProgress(patient.hpht);
  const patientVisits = visits
    .filter(v => v.patientId === patient.id)
    .sort((a, b) => b.visitDate.localeCompare(a.visitDate));
  
  const latestVisit = patientVisits[0];
  const risk = getRiskCategory(patient.totalRiskScore, latestVisit);

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-10 duration-700 bg-white rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl">
      {/* Close Button */}
      <div className="absolute top-6 right-6 z-50">
        <button onClick={onClose} className="p-3 bg-white/50 backdrop-blur text-gray-400 hover:text-red-500 rounded-full transition-all border border-gray-100 flex items-center justify-center group shadow-sm">
          <X size={20} className="group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      <div className="p-6 md:p-10 lg:p-12 space-y-10">
        {/* Header Section - Refined for visibility */}
        <div className="bg-gray-50/50 p-8 md:p-12 rounded-[3rem] border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 w-full md:w-auto">
            {/* Avatar with Gradient */}
            <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-4xl md:text-5xl font-black shadow-xl shrink-0 bg-gradient-to-br ${patient.isPostpartum ? 'from-emerald-400 to-emerald-600 text-white' : 'from-emerald-400 to-teal-600 text-white'}`}>
              {patient.isPostpartum ? <PartyPopper size={40}/> : patient.name.charAt(0)}
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

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center md:justify-end gap-3 relative z-10 w-full md:w-auto">
            {!patient.isPostpartum && isStaff && (
              <button onClick={() => onConfirmDelivery?.(patient)} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-2">
                <PartyPopper size={16} /> Konfirmasi Lahir
              </button>
            )}
            {patient.isPostpartum && isStaff && (
              <button onClick={() => onNewPregnancy?.(patient)} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2">
                <UserPlus size={16} /> Hamil Lagi
              </button>
            )}
            <a href={`tel:${patient.phone}`} className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all shadow-sm">
              <Phone size={20} />
            </a>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Left Column: Stats & Location */}
          <div className="lg:col-span-1 space-y-8">
            {patient.isPostpartum ? (
              <div className="bg-emerald-600 p-8 md:p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                <h3 className="text-[9px] font-black uppercase opacity-60 mb-6 flex items-center gap-2">
                  <Baby size={14} /> Data Kelahiran
                </h3>
                <div className="space-y-4 relative z-10">
                   {[
                     { l: 'Tanggal Lahir', v: patient.deliveryData?.deliveryDate },
                     { l: 'Metode', v: patient.deliveryData?.deliveryType },
                     { l: 'Kondisi Ibu', v: patient.deliveryData?.maternalCondition },
                     { l: 'BB Bayi', v: `${patient.deliveryData?.babyWeight} KG` },
                     { l: 'Jenis Kelamin', v: patient.deliveryData?.babyGender === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN' }
                   ].map((item, i) => (
                     <div key={i} className="flex justify-between items-end border-b border-white/10 pb-3">
                       <p className="text-[8px] font-black uppercase opacity-60">{item.l}</p>
                       <p className="text-lg font-black">{item.v}</p>
                     </div>
                   ))}
                </div>
                <PartyPopper size={140} className="absolute -right-6 -bottom-6 opacity-10" />
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
                <Baby size={140} className="absolute -right-8 -bottom-8 opacity-10 rotate-6" />
              </div>
            )}

            {/* Previous History Archive */}
            {patient.pregnancyHistory && patient.pregnancyHistory.length > 0 && (
              <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                  <History size={16} className="text-indigo-600" /> Riwayat Kehamilan Lalu
                </h3>
                <div className="space-y-3">
                  {patient.pregnancyHistory.map((history, hIdx) => (
                    <div key={hIdx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center hover:bg-indigo-50/30 transition-colors">
                       <div>
                         <p className="text-[10px] font-black text-gray-900 uppercase">Anak Ke-{hIdx + 1}</p>
                         <p className="text-[8px] font-bold text-gray-400 mt-0.5">{history.deliveryDate} | {history.deliveryType}</p>
                       </div>
                       <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase">Sukses</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Info */}
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

          {/* Right Column: ANC Visit History */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
                <ClipboardCheck size={28} className="text-indigo-600" /> Riwayat Pemeriksaan
              </h3>
              <div className="px-5 py-2 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg">
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
                          <div key={i} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:bg-gray-50 transition-colors">
                             <div className={`${item.c} mb-2 opacity-60 group-hover:opacity-100 transition-opacity`}>{item.i}</div>
                             <p className="text-[7px] font-black text-gray-400 uppercase mb-1 tracking-tighter">{item.l}</p>
                             <p className="text-sm md:text-base font-black text-gray-900">{item.v}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
