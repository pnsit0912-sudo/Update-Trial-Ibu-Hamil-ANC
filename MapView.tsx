
import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import { Map as MapIcon, Info, Users, ShieldAlert, Heart, Calendar, Baby, TrendingUp } from 'lucide-react';
import { User, UserRole, ANCVisit } from './types';
import { PUSKESMAS_INFO } from './constants';
import { getRiskCategory } from './utils';

interface MapViewProps {
  users: User[];
  visits: ANCVisit[];
}

export const MapView: React.FC<MapViewProps> = ({ users, visits }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markerLayerGroup = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      const map = L.map(mapRef.current).setView([PUSKESMAS_INFO.lat, PUSKESMAS_INFO.lng], 14);
      leafletMap.current = map;
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // Inisialisasi LayerGroup untuk marker
      markerLayerGroup.current = L.layerGroup().addTo(map);

      // Icon Puskesmas (Pusat Operasional)
      const clinicIcon = L.divIcon({
        html: `<div class="bg-indigo-600 p-2.5 rounded-2xl border-4 border-white shadow-2xl text-white flex items-center justify-center rotate-3"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg></div>`,
        iconSize: [42, 42],
        className: 'custom-div-icon'
      });

      L.marker([PUSKESMAS_INFO.lat, PUSKESMAS_INFO.lng], { icon: clinicIcon })
        .addTo(map)
        .bindPopup(`
          <div class="p-4 min-w-[200px]">
            <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Pusat Layanan</p>
            <h4 class="font-black text-gray-900 text-lg uppercase tracking-tighter">${PUSKESMAS_INFO.name}</h4>
            <p class="text-[10px] font-bold text-gray-400 mt-2 uppercase">${PUSKESMAS_INFO.address}</p>
          </div>
        `);
    }

    // UPDATE MARKERS SETIAP KALI DATA PASIEN BERUBAH
    if (leafletMap.current && markerLayerGroup.current) {
      markerLayerGroup.current.clearLayers(); // Bersihkan marker lama sebelum update

      users.filter(u => u.role === UserRole.USER && u.lat).forEach(p => {
        // FILTER: Sembunyikan bayi jika monitoring sudah tidak aktif
        if (p.isPostpartum && p.isBabyMonitoringActive === false) {
          return; // Lewati iterasi ini
        }

        const patientVisits = visits.filter(v => v.patientId === p.id);
        const latestVisit = patientVisits.sort((a, b) => b.visitDate.localeCompare(a.visitDate))[0];
        const risk = getRiskCategory(p.totalRiskScore, latestVisit);
        
        let markerHtml = '';
        let popupContent = '';

        if (p.isPostpartum) {
          // MARKER UNTUK BAYI / IBU NIFAS (AKTIF)
          const latestBabyLog = p.babyLogs && p.babyLogs.length > 0 
            ? [...p.babyLogs].sort((a, b) => b.ageInMonths - a.ageInMonths)[0] 
            : null;

          markerHtml = `
            <div class="bg-emerald-500 p-2 rounded-xl border-2 border-white shadow-xl text-white flex items-center justify-center transition-all duration-500 hover:scale-125">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 5 6.3"/><path d="M12 2.1a5 5 0 0 1 2 1.1"/><path d="M12 2.1a5 5 0 0 0-2 1.1"/></svg>
            </div>
          `;

          popupContent = `
            <div class="p-6 min-w-[260px] font-sans">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <p class="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Data Ibu Nifas & Bayi</p>
                  <h4 class="font-black text-gray-900 text-xl tracking-tighter uppercase leading-none">${p.name}</h4>
                </div>
                <div class="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-[9px] font-black uppercase border border-emerald-100">
                  PANTUAN AKTIF
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-3 mb-6">
                <div class="bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <p class="text-[8px] font-black text-gray-400 uppercase">Usia Bayi</p>
                  <p class="text-xs font-black text-gray-900">${latestBabyLog?.ageInMonths || 0} Bulan</p>
                </div>
                <div class="bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <p class="text-[8px] font-black text-gray-400 uppercase">Berat (Terakhir)</p>
                  <p class="text-xs font-black text-indigo-600">${latestBabyLog?.weight || p.deliveryData?.babyWeight || '-'} Kg</p>
                </div>
              </div>

              <div class="space-y-2">
                <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Status Terakhir</p>
                <div class="text-[10px] font-bold text-gray-600 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
                   Kondisi: ${latestBabyLog?.condition || 'Normal'} | Imun: ${latestBabyLog?.immunization || 'N/A'}
                </div>
              </div>

              <div class="mt-6 flex gap-2">
                 <a href="tel:${p.phone}" class="flex-1 py-3 bg-emerald-600 text-white text-[9px] font-black rounded-xl uppercase text-center shadow-lg shadow-emerald-100 no-underline">Hubungi Orang Tua</a>
              </div>
            </div>
          `;
        } else {
          // MARKER UNTUK IBU HAMIL
          let markerBg = 'bg-emerald-500';
          let animateClass = '';
          
          if (risk.label === 'HITAM') {
            markerBg = 'bg-slate-950';
            animateClass = 'animate-pulse ring-4 ring-red-500/50';
          } else if (risk.label === 'MERAH') {
            markerBg = 'bg-red-600';
            animateClass = 'animate-pulse ring-4 ring-red-400/30';
          } else if (risk.label === 'KUNING') {
            markerBg = 'bg-yellow-400';
          }

          markerHtml = `
            <div class="${markerBg} ${animateClass} p-2 rounded-full border-2 border-white shadow-xl text-white flex items-center justify-center transition-all duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </div>
          `;

          popupContent = `
            <div class="p-6 min-w-[240px] font-sans">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Identitas Ibu Hamil</p>
                  <h4 class="font-black text-gray-900 text-xl tracking-tighter uppercase leading-none">${p.name}</h4>
                </div>
                <div class="px-3 py-1.5 ${risk.color} rounded-xl text-[9px] font-black uppercase">
                  ${risk.label}
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-3 mb-6">
                <div class="bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <p class="text-[8px] font-black text-gray-400 uppercase">Usia Hamil</p>
                  <p class="text-xs font-black text-gray-900">${p.pregnancyMonth} Bulan</p>
                </div>
                <div class="bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <p class="text-[8px] font-black text-gray-400 uppercase">Skor Total</p>
                  <p class="text-xs font-black text-indigo-600">${p.totalRiskScore + 2}</p>
                </div>
              </div>

              <div class="space-y-2">
                <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Status Klinis Terakhir</p>
                <div class="text-[10px] font-bold text-gray-600 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                   TD: ${latestVisit?.bloodPressure || 'N/A'} | Hb: ${latestVisit?.hb || 'N/A'} g/dL
                </div>
              </div>

              <div class="mt-6 flex gap-2">
                 <a href="tel:${p.phone}" class="flex-1 py-3 bg-indigo-600 text-white text-[9px] font-black rounded-xl uppercase text-center shadow-lg shadow-indigo-100 no-underline">Hubungi</a>
              </div>
            </div>
          `;
        }

        const customIcon = L.divIcon({
          html: markerHtml,
          iconSize: p.isPostpartum ? [34, 34] : [28, 28],
          className: 'custom-div-icon'
        });

        L.marker([p.lat!, p.lng!], { icon: customIcon })
          .addTo(markerLayerGroup.current!)
          .bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-leaflet-popup'
          });
      });
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [users, visits]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Info */}
      <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-4">
            <MapIcon className="text-indigo-600" size={32} /> Geospasial Terpadu
          </h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            Pemetaan Sebaran Ibu Hamil & Pantauan Tumbuh Kembang Bayi Aktif (0-12 Bln)
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-2xl text-[9px] font-black uppercase shadow-lg shadow-emerald-100">
            <Baby size={14} /> Bayi Aktif (Emerald)
          </div>
          <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 text-white rounded-2xl text-[9px] font-black uppercase">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Kritis (Hitam)
          </div>
          <div className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white ring-2 ring-red-400/30 animate-pulse rounded-2xl text-[9px] font-black uppercase shadow-lg">
            Tinggi (Merah)
          </div>
        </div>
      </div>

      {/* Container Peta */}
      <div className="bg-white p-8 rounded-[4rem] shadow-sm border border-gray-100 relative overflow-hidden h-[700px]">
        <div ref={mapRef} className="h-full w-full rounded-[3rem] overflow-hidden z-10 shadow-inner border border-gray-100"></div>
        
        {/* Floating Stats Layer */}
        <div className="absolute bottom-16 right-16 z-[20] bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] border border-white shadow-2xl max-w-xs animate-in slide-in-from-right-10">
           <h5 className="text-xs font-black uppercase tracking-tighter mb-4 flex items-center gap-2">
             <ShieldAlert size={16} className="text-indigo-600" /> Analisis Populasi
           </h5>
           <div className="space-y-4">
             <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-bold text-gray-500 uppercase">Ibu Hamil Terpetakan</span>
                   <span className="text-sm font-black text-indigo-600">{users.filter(u => u.role === UserRole.USER && u.lat && !u.isPostpartum).length}</span>
                </div>
                <div className="h-1 bg-gray-100 rounded-full">
                   <div className="h-full bg-indigo-600 rounded-full" style={{ width: '100%' }}></div>
                </div>
             </div>
             <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-bold text-gray-500 uppercase">Bayi Dalam Pantauan</span>
                   <span className="text-sm font-black text-emerald-600">{users.filter(u => u.role === UserRole.USER && u.lat && u.isPostpartum && u.isBabyMonitoringActive !== false).length}</span>
                </div>
                <div className="h-1 bg-gray-100 rounded-full">
                   <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
             </div>
             <p className="text-[9px] font-bold text-gray-400 uppercase italic border-t border-gray-100 pt-3">Sinkronisasi Geospasial v2.6</p>
           </div>
        </div>
      </div>
    </div>
  );
};
