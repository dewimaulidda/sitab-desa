import React from 'react';
import { Citizen, Transaction, VillageConfig, WhatsAppMessage, SavingType } from '../types';
import { formatRupiah, SAVING_LABELS } from '../utils/whatsapp';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  BellRing, 
  CheckCircle2, 
  Send, 
  Receipt, 
  Smartphone, 
  Share2, 
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building
} from 'lucide-react';

interface DashboardProps {
  citizens: Citizen[];
  transactions: Transaction[];
  messages: WhatsAppMessage[];
  config: VillageConfig;
  onNavigate: (tab: 'DASHBOARD' | 'KASIR' | 'WARGA' | 'PENGINGAT' | 'GATEWAY' | 'LAPORAN') => void;
  onOpenReceipt: (tx: Transaction, citizen: Citizen) => void;
  onOpenPhoneSimulator: (phone: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  citizens,
  transactions,
  messages,
  config,
  onNavigate,
  onOpenReceipt,
  onOpenPhoneSimulator
}) => {
  // Key calculations
  const totalAllSavings = citizens.reduce((acc, c) => {
    return acc + Object.values(c.accounts).reduce((a, b) => a + b, 0);
  }, 0);

  const totalDeposits = transactions
    .filter(t => t.type === 'SETOR' || t.type === 'IURAN')
    .reduce((a, b) => a + b.amount, 0);

  const totalWithdrawals = transactions
    .filter(t => t.type === 'TARIK')
    .reduce((a, b) => a + b.amount, 0);

  const currentMonth = '2026-10';
  const paidCitizens = citizens.filter(c => c.monthlyFeePaidMonths.includes(currentMonth));
  const unpaidCitizens = citizens.filter(c => !c.monthlyFeePaidMonths.includes(currentMonth));
  const complianceRate = citizens.length > 0 ? Math.round((paidCitizens.length / citizens.length) * 100) : 0;

  // Breakdown by saving type
  const savingBreakdown = (['KURBAN', 'PENDIDIKAN', 'HARI_RAYA', 'SUKARELA'] as SavingType[]).map(st => {
    const total = citizens.reduce((sum, c) => sum + (c.accounts[st as keyof typeof c.accounts] || 0), 0);
    const percent = totalAllSavings > 0 ? Math.round((total / totalAllSavings) * 100) : 0;
    return {
      type: st,
      info: SAVING_LABELS[st],
      total,
      percent
    };
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Integration Flow Architectural Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-emerald-700/50 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Arsitektur Sistem & Alur WhatsApp Gateway</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              SITAB-Desa: Sistem Tabungan & Kas Desa Terintegrasi
            </h1>
            <p className="text-xs text-emerald-100/90 mt-1 max-w-xl">
              Pemerintah Desa {config.desaName} • {config.kecamatan}, {config.kabupaten}.
              Mewujudkan transparansi kas warga desa secara instan melalui notifikasi WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('KASIR')}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-all flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>Buka Kasir Cepat</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenPhoneSimulator(citizens[0]?.phone || '081283921044')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs transition-all flex items-center gap-1.5"
            >
              <Smartphone className="w-4 h-4 text-emerald-300" />
              <span>Simulasi HP Warga</span>
            </button>
          </div>
        </div>

        {/* Visual Step-by-Step Flow Line */}
        <div className="mt-6 pt-5 border-t border-emerald-700/50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5 text-[11px]">
              <span>1. Warga Menyetor / Menarik</span>
            </div>
            <p className="text-[11px] text-emerald-100/80 mt-1">
              Warga datang ke kantor desa atau lewat petugas keliling kas RT.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5 text-[11px]">
              <span>2. Admin Input di Web</span>
            </div>
            <p className="text-[11px] text-emerald-100/80 mt-1">
              Kasir mencatat nominal & program tabungan dengan validasi instan.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5 text-[11px]">
              <span>3. Database Terupdate</span>
            </div>
            <p className="text-[11px] text-emerald-100/80 mt-1">
              Saldo tabungan program dan buku kas otomatis terhitung akurat.
            </p>
          </div>

          <div className="bg-emerald-500/20 backdrop-blur-xs p-3 rounded-xl border border-emerald-400/30">
            <div className="font-bold text-emerald-200 flex items-center gap-1.5 text-[11px]">
              <Share2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>4. WA Gateway Kirim Struk</span>
            </div>
            <p className="text-[11px] text-emerald-100/90 mt-1">
              Struk digital resmi otomatis masuk ke nomor WA warga dalam hitungan detik.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main KPI Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Total Kas Tabungan Desa</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{formatRupiah(totalAllSavings)}</div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span className="font-bold text-emerald-700">{citizens.length} Nasabah Warga</span>
            <span>tersebar di {config.desaName}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Setoran Masuk (Bulan Ini)</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">{formatRupiah(totalDeposits)}</div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span className="text-emerald-700 font-bold">+{transactions.filter(t => t.type === 'SETOR').length} transaksi</span>
            <span>setoran tercatat</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Penarikan Tabungan</span>
            <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700">{formatRupiah(totalWithdrawals)}</div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span className="text-rose-700 font-bold">{transactions.filter(t => t.type === 'TARIK').length} pencairan</span>
            <span>dana kepada nasabah</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Iuran Kas RT ({currentMonth})</span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <BellRing className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-700">{complianceRate}% Lunas</div>
          <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>{paidCitizens.length} Lunas</span>
            <span className="text-amber-700 font-bold">{unpaidCitizens.length} Perlu Diingatkan</span>
          </div>
        </div>

      </div>

      {/* 3. Middle Section: Saving Programs Breakdown & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Programs Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Distribusi Saldo per Program Tabungan
              </h3>
              <p className="text-xs text-slate-500">
                Pilihan program simpanan warga Desa Sukamaju
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('LAPORAN')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Lihat Detail Laporan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {savingBreakdown.map((item) => (
              <div key={item.type} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.info.icon}</span>
                    <span className="font-bold text-slate-800">{item.info.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{formatRupiah(item.total)}</span>
                    <span className="text-slate-400 font-mono text-[11px]">({item.percent}%)</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor: 
                        item.type === 'KURBAN' ? '#10b981' : 
                        item.type === 'PENDIDIKAN' ? '#3b82f6' : 
                        item.type === 'HARI_RAYA' ? '#f59e0b' : '#8b5cf6'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Notice */}
          <div className="mt-5 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <b>Tabungan Kurban 2026/1447H:</b> Terkumpul dana untuk pembelian 4 ekor sapi kurban desa dan 12 kambing kurban warga.
            </div>
          </div>
        </div>

        {/* Right: Quick Action Hub & Gateway Status (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Action Buttons Box */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-3">
              Aksi Cepat Pengurus / Bendahara
            </h3>

            <div className="grid grid-cols-2 gap-2.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => onNavigate('KASIR')}
                className="p-3 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors flex flex-col items-center justify-center gap-1.5 text-center"
              >
                <Wallet className="w-5 h-5 text-emerald-700" />
                <span>Input Setor / Tarik</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('WARGA')}
                className="p-3 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors flex flex-col items-center justify-center gap-1.5 text-center"
              >
                <Users className="w-5 h-5 text-slate-600" />
                <span>Kelola Data Warga</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('PENGINGAT')}
                className="p-3 bg-indigo-50 text-indigo-950 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors flex flex-col items-center justify-center gap-1.5 text-center"
              >
                <BellRing className="w-5 h-5 text-indigo-700" />
                <span>Pengingat Iuran Bulanan</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('GATEWAY')}
                className="p-3 bg-teal-50 text-teal-950 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors flex flex-col items-center justify-center gap-1.5 text-center"
              >
                <Share2 className="w-5 h-5 text-teal-700" />
                <span>Pengaturan WA Gateway</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Gateway Real-time Status Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                Status Integrasi WhatsApp
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Online
              </span>
            </div>

            <div className="text-xs space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>Nomor Gateway HP Desa:</span>
                <span className="font-mono text-white font-semibold">{config.waGatewayNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Struk Transaksi Otomatis:</span>
                <span className="text-emerald-400 font-semibold">Aktif (100% Terkirim)</span>
              </div>
              <div className="flex justify-between">
                <span>Pesan Keluar Hari Ini:</span>
                <span className="font-semibold text-white">{messages.length} pesan</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between items-center text-xs">
              <span className="text-[11px] text-slate-400">Petugas: {config.bendaharaName}</span>
              <button
                type="button"
                onClick={() => onOpenPhoneSimulator(citizens[0]?.phone || '081283921044')}
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 text-[11px]"
              >
                <span>Buka Preview HP</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 4. Recent Transactions Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              Mutasi Transaksi Tabungan Terkini
            </h3>
            <p className="text-xs text-slate-500">
              Setoran & penarikan yang telah terhubung ke WhatsApp Gateway
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('LAPORAN')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            Lihat Semua Mutasi
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">No. Ref</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Nama Warga</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4">Status WhatsApp</th>
                <th className="py-3 px-4 text-center">Bukti Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.slice(0, 5).map((tx) => {
                const citizen = citizens.find(c => c.id === tx.citizenId);

                return (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {tx.refNumber}
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      {new Date(tx.date).toLocaleDateString('id-ID')} {new Date(tx.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{tx.citizenName}</div>
                      <div className="text-[11px] text-slate-500">{tx.citizenPhone}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-medium">
                      <span className="flex items-center gap-1">
                        <span>{SAVING_LABELS[tx.savingType]?.icon}</span>
                        <span>{SAVING_LABELS[tx.savingType]?.name.replace('Tabungan ', '') || tx.savingType}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.type === 'SETOR' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {tx.type === 'SETOR' ? 'Setoran (+)' : 'Penarikan (-)'}
                      </span>
                    </td>

                    <td className={`py-3 px-4 text-right font-bold ${
                      tx.type === 'SETOR' ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {tx.type === 'SETOR' ? '+' : '-'}{formatRupiah(tx.amount)}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Terkirim ke WA Warga
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {citizen && (
                        <button
                          type="button"
                          onClick={() => onOpenReceipt(tx, citizen)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg shadow-2xs transition-colors"
                        >
                          <Receipt className="w-3.5 h-3.5 text-slate-500" />
                          <span>Struk</span>
                        </button>
                      )}
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
