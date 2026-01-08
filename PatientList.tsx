
import React, { useState, useMemo } from 'react';
import { 
  Users, Edit3, Activity, Download, Eye, ChevronDown, 
  UserX, AlertCircle, Search, Filter, X, MapPin, ShieldAlert, PartyPopper
} from 'lucide-react';
import { User, ANCVisit, UserRole } from './types';
import { getRiskCategory } from './utils';
import { WILAYAH_DATA } from './constants';

interface PatientListProps {
  users: User[];
  visits: ANCVisit[];
  onEdit: (u: User) => void;
  onAddVisit: (u: User) => void;
  onViewProfile: (userId: string) => void;
  onDeletePatient: (userId: string) => void;
  onDeleteVisit: (visitId: string) => void;
  onToggleVisitStatus: (visitId: string) => void;
  currentUserRole: UserRole;
  searchFilter: string;
  onConfirmDelivery?: (u: User) => void;
}

export const PatientList: React.FC<PatientListProps> = ({ 
  users, visits, onEdit, onAddVisit, onViewProfile, searchFilter, currentUserRole, onConfirmDelivery 
}) => {
  const [displayLimit, setDisplayLimit] = useState(10);
  const [localSearch, setLocalSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [kelurahanFilter, setKelurahanFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const today = new Date().toISOString().split('T')[0];

  const visitsByPatient = useMemo(() => {
    const grouped: Record<string, ANCVisit[]> = {};
    visits.forEach(v => {
      if (!grouped[v.patientId]) grouped[v.patientId] = [];
      grouped[v.patientId].push(v);
    });
    Object.keys(grouped).forEach(pid => {
      grouped[pid].sort((a, b) => b.visitDate.localeCompare(a.visitDate));
    });
    return grouped;
  }, [visits]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (u.role !== UserRole.USER) return false;
      
      const pVisits = visitsByPatient[u.id] || [];
      const latest = pVisits[0];
      const risk = getRiskCategory(u.totalRiskScore, latest);
      const isMissed = !u.isPostpartum && latest && latest.nextVisitDate < today;

      const combinedSearch = (searchFilter + ' ' + localSearch).toLowerCase().trim();
      const matchesSearch = u.name.toLowerCase().includes(combinedSearch) || u.id.toLowerCase().includes(combinedSearch);
      const matchesRisk = riskFilter === 'ALL' || (u.isPostpartum ? riskFilter === 'NIFAS' : risk.label === riskFilter);
      const matchesKelurahan = kelurahanFilter === 'ALL' || u.kelurahan === kelurahanFilter;
      const matchesStatus = statusFilter === 'ALL' || 
                           (statusFilter === 'MANGKIR' && isMissed) || 
                           (statusFilter === 'ON_TIME' && !isMissed && !u.isPostpartum) ||
                           (statusFilter === 'NIFAS' && u.isPostpartum);

      return matchesSearch && matchesRisk && matchesKelurahan && matchesStatus;
    });
  }, [users, searchFilter, localSearch, riskFilter, kelurahanFilter, statusFilter, visitsByPatient, today]);

  const visibleUsers = useMemo(() => filteredUsers.slice(0, displayLimit), [filteredUsers, displayLimit]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-8">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg"><Users size={24} /></div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Database Terpadu</h2>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Ditemukan {filteredUsers.length} Pasien</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
             <button onClick={() => setStatusFilter('NIFAS')} className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">
                <PartyPopper size={14} className="inline mr-2" /> Lihat Ibu Nifas
             </button>
             {(localSearch || riskFilter !== 'ALL' || kelurahanFilter !== 'ALL' || statusFilter !== 'ALL') && (
               <button onClick={() => {setLocalSearch(''); setRiskFilter('ALL'); setKelurahanFilter('ALL'); setStatusFilter('ALL');}} className="px-6 py-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                  <X size={14} className="inline mr-2" /> Reset Filter
               </button>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input type="text" placeholder="Cari Nama / ID Pasien..." value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none text-xs" />
          </div>
          <div className="relative">
            <ShieldAlert className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="w-full pl-14 pr-10 py-4 bg-gray-50 border-none rounded-2xl font-black text-[10px] uppercase appearance-none outline-none">
              <option value="ALL">Semua Risiko</option>
              <option value="HITAM">Kritis (Hitam)</option>
              <option value="MERAH">Tinggi (Merah)</option>
              <option value="KUNING">Sedang (Kuning)</option>
              <option value="HIJAU">Rendah (Hijau)</option>
              <option value="NIFAS">Sudah Melahirkan</option>
            </select>
          </div>
          <div className="relative">
            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <select value={kelurahanFilter} onChange={(e) => setKelurahanFilter(e.target.value)} className="w-full pl-14 pr-10 py-4 bg-gray-50 border-none rounded-2xl font-black text-[10px] uppercase appearance-none outline-none">
              <option value="ALL">Seluruh Wilayah</option>
              {WILAYAH_DATA["Pasar Minggu"].map(kel => <option key={kel} value={kel}>{kel}</option>)}
            </select>
          </div>
          <div className="relative">
            <UserX className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full pl-14 pr-10 py-4 bg-gray-50 border-none rounded-2xl font-black text-[10px] uppercase appearance-none outline-none">
              <option value="ALL">Semua Status</option>
              <option value="MANGKIR">Mangkir Kontrol</option>
              <option value="ON_TIME">Tepat Waktu</option>
              <option value="NIFAS">Fase Nifas</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[4rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-gray-50/50">
              <tr className="text-[9px] font-black uppercase text-gray-400 border-b border-gray-100">
                <th className="px-12 py-8">Identitas & Wilayah</th>
                <th className="px-12 py-8">Status Medis</th>
                <th className="px-12 py-8">Data Terakhir</th>
                <th className="px-12 py-8">Kontrol Berikutnya</th>
                <th className="px-12 py-8 text-center">Aksi Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visibleUsers.map(u => {
                const pVisits = visitsByPatient[u.id] || [];
                const latest = pVisits[0];
                const risk = getRiskCategory(u.totalRiskScore, latest);
                const isMissed = !u.isPostpartum && latest && latest.nextVisitDate < today;

                return (
                  <tr key={u.id} className={`hover:bg-indigo-50/5 transition-all group ${isMissed ? 'bg-red-50/20' : ''} ${u.isPostpartum ? 'bg-emerald-50/10' : ''}`}>
                    <td className="px-12 py-9">
                      <div className="flex items-center gap-5">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black shrink-0 ${u.isPostpartum ? 'bg-emerald-600 text-white' : risk.label === 'HITAM' ? 'bg-slate-950 text-white' : 'bg-indigo-50 text-indigo-600'}`}>{u.isPostpartum ? <PartyPopper size={20}/> : u.name.charAt(0)}</div>
                         <div>
                            <div className="flex items-center gap-2">
                              <p className="font-black text-gray-900 text-base leading-none uppercase">{u.name}</p>
                              {u.isPostpartum && <span className="px-2 py-0.5 bg-emerald-600 text-white text-[7px] font-black uppercase rounded-full">LULUS ANC</span>}
                              {isMissed && <span className="px-2 py-0.5 bg-red-600 text-white text-[7px] font-black uppercase rounded-full animate-pulse shadow-lg flex items-center gap-1"><AlertCircle size={8}/> MANGKIR</span>}
                            </div>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1.5">{u.kelurahan} | ID: {u.id}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-12 py-9">
                      {u.isPostpartum ? (
                        <div className="inline-flex flex-col gap-0.5 px-6 py-3 rounded-2xl border border-emerald-500 bg-emerald-50 text-emerald-700">
                          <span className="text-[10px] font-black uppercase tracking-widest">POSTPARTUM</span>
                        </div>
                      ) : (
                        <div className={`inline-flex flex-col gap-0.5 px-6 py-3 rounded-2xl border ${risk.color}`}>
                          <span className="text-[10px] font-black uppercase tracking-widest">{risk.label}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-12 py-9">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-indigo-900 uppercase">
                          {u.isPostpartum ? `BAYI ${u.deliveryData?.babyWeight} KG` : `G${u.pregnancyNumber}P${u.parityP}A${u.parityA}`}
                        </p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase">{u.isPostpartum ? 'MASA NIFAS' : `${u.pregnancyMonth} Bulan Hamil`}</p>
                      </div>
                    </td>
                    <td className="px-12 py-9">
                       <div className={`text-[10px] font-black px-3 py-1 rounded-lg w-fit ${isMissed ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-700'}`}>
                          {u.isPostpartum ? 'KONTROL NIFAS' : latest?.nextVisitDate || 'N/A'}
                        </div>
                    </td>
                    <td className="px-12 py-9 text-center">
                      <div className="flex items-center justify-center gap-2">
                         <button onClick={() => onViewProfile(u.id)} className="p-4 bg-gray-100 text-gray-400 rounded-2xl hover:text-indigo-600 transition-all shadow-sm" title="Lihat Profil"><Eye size={16}/></button>
                         {!u.isPostpartum && (
                           <>
                             <button onClick={() => onAddVisit(u)} className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl hover:scale-105 transition-all" title="Input ANC"><Activity size={16}/></button>
                             <button onClick={() => onConfirmDelivery?.(u)} className="p-4 bg-emerald-600 text-white rounded-2xl shadow-xl hover:scale-105 transition-all" title="Graduasi Persalinan"><PartyPopper size={16}/></button>
                           </>
                         )}
                         <button onClick={() => onEdit(u)} className="p-4 bg-white border border-gray-100 text-gray-400 rounded-2xl hover:bg-gray-50 transition-all" title="Edit Data"><Edit3 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
