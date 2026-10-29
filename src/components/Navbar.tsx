import React from 'react';
import { VillageConfig } from '../types';
import { 
  Building2, 
  Wallet, 
  Users, 
  BellRing, 
  Share2, 
  FileSpreadsheet, 
  Smartphone, 
  Wifi, 
  LayoutDashboard,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export type NavTab = 'DASHBOARD' | 'KASIR' | 'WARGA' | 'PENGINGAT' | 'GATEWAY' | 'LAPORAN';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  config: VillageConfig;
  unpaidCount: number;
  onOpenPhoneSimulator: () => void;
  onResetDemoData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  config,
  unpaidCount,
  onOpenPhoneSimulator,
  onResetDemoData
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'DASHBOARD', label: 'Beranda', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'KASIR', label: 'Kasir Cepat', icon: <Wallet className="w-4 h-4" /> },
    { id: 'WARGA', label: 'Warga / Nasabah', icon: <Users className="w-4 h-4" /> },
    { 
      id: 'PENGINGAT', 
      label: 'Pengingat Iuran', 
      icon: <BellRing className="w-4 h-4" />,
      badge: unpaidCount > 0 ? unpaidCount : undefined
    },
    { id: 'GATEWAY', label: 'WhatsApp Gateway', icon: <Share2 className="w-4 h-4" /> },
    { id: 'LAPORAN', label: 'Laporan Rekapitulasi', icon: <FileSpreadsheet className="w-4 h-4" /> }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      
      {/* Top Village Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between border-b border-slate-100">
        
        {/* Left: Village Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-black text-xl shadow-xs border border-emerald-500/30">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base tracking-tight text-slate-900">SITAB-Desa</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Resmi Desa
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {config.desaName} • {config.kecamatan}, {config.kabupaten}
            </div>
          </div>
        </div>

        {/* Right: Gateway Status Badge & Phone Simulator Quick Button */}
        <div className="flex items-center gap-2.5">
          
          {/* WA Gateway Online Pill */}
          <div 
            onClick={() => onSelectTab('GATEWAY')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl cursor-pointer hover:bg-emerald-100 transition-colors"
            title="Klik untuk konfigurasi WhatsApp Gateway"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-emerald-950 block">WA Gateway Terhubung</span>
              <span className="text-[10px] text-emerald-700 font-mono">{config.waGatewayNumber}</span>
            </div>
          </div>

          {/* Citizen Phone View Trigger Button */}
          <button
            type="button"
            onClick={onOpenPhoneSimulator}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
            title="Buka tampilan WhatsApp di layar smartphone warga"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Simulasi HP Warga</span>
            <span className="md:hidden">HP Warga</span>
          </button>

          {/* Reset Demo Button */}
          <button
            type="button"
            onClick={onResetDemoData}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Muat Ulang Data Awal Desa"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white text-emerald-800' : 'bg-rose-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

    </header>
  );
};
