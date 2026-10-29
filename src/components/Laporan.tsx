import React, { useState } from 'react';
import { Citizen, Transaction, VillageConfig, SavingType } from '../types';
import { SAVING_LABELS, formatRupiah } from '../utils/whatsapp';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Calendar, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Building, 
  PieChart, 
  Layers,
  CheckCircle2,
  Receipt
} from 'lucide-react';

interface LaporanProps {
  citizens: Citizen[];
  transactions: Transaction[];
  config: VillageConfig;
  onOpenReceipt?: (tx: Transaction, citizen: Citizen) => void;
}

export const Laporan: React.FC<LaporanProps> = ({
  citizens,
  transactions,
  config,
  onOpenReceipt
}) => {
  const [reportTab, setReportTab] = useState<'MUTASI' | 'REKAP_RT' | 'REKAP_PROGRAM'>('MUTASI');
  const [filterSaving, setFilterSaving] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterRt, setFilterRt] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Calculations
  const totalAllSavings = citizens.reduce((acc, c) => {
    return acc + Object.values(c.accounts).reduce((a, b) => a + b, 0);
  }, 0);

  const totalDeposits = transactions
    .filter(t => t.type === 'SETOR' || t.type === 'IURAN')
    .reduce((a, b) => a + b.amount, 0);

  const totalWithdrawals = transactions
    .filter(t => t.type === 'TARIK')
    .reduce((a, b) => a + b.amount, 0);

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSaving = filterSaving === 'ALL' || tx.savingType === filterSaving;
    const matchesType = filterType === 'ALL' || tx.type === filterType;
    const matchesSearch = 
      tx.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.refNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.notes && tx.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSaving && matchesType && matchesSearch;
  });

  // Rekapitulasi per RT
  const uniqueRts = Array.from(new Set(citizens.map(c => c.rt))).sort();
  const rekapRtData = uniqueRts.map(rt => {
    const rtCitizens = citizens.filter(c => c.rt === rt);
    const kurban = rtCitizens.reduce((sum, c) => sum + c.accounts.KURBAN, 0);
    const pendidikan = rtCitizens.reduce((sum, c) => sum + c.accounts.PENDIDIKAN, 0);
    const hariRaya = rtCitizens.reduce((sum, c) => sum + c.accounts.HARI_RAYA, 0);
    const sukarela = rtCitizens.reduce((sum, c) => sum + c.accounts.SUKARELA, 0);
    const total = kurban + pendidikan + hariRaya + sukarela;

    return {
      rt,
      totalWarga: rtCitizens.length,
      kurban,
      pendidikan,
      hariRaya,
      sukarela,
      total
    };
  });

  // Rekapitulasi per Program Tabungan
  const programSummary = (['KURBAN', 'PENDIDIKAN', 'HARI_RAYA', 'SUKARELA'] as SavingType[]).map(st => {
    const totalProgram = citizens.reduce((sum, c) => sum + c.accounts[st as keyof typeof c.accounts], 0);
    const countActive = citizens.filter(c => c.accounts[st as keyof typeof c.accounts] > 0).length;
    return {
      type: st,
      info: SAVING_LABELS[st],
      total: totalProgram,
      activeMembers: countActive
    };
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Ref Transaksi', 'Tanggal', 'Nama Warga', 'Program Tabungan', 'Tipe', 'Nominal (Rp)', 'Saldo Akhir (Rp)', 'Petugas', 'Keterangan'];
    const rows = filteredTransactions.map(t => [
      t.refNumber,
      new Date(t.date).toLocaleDateString('id-ID') + ' ' + new Date(t.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      `"${t.citizenName}"`,
      `"${SAVING_LABELS[t.savingType]?.name || t.savingType}"`,
      t.type,
      t.amount,
      t.balanceAfter,
      `"${t.adminName}"`,
      `"${t.notes || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan-SITAB-Desa-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Module Title Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Modul Laporan & Rekapitulasi Kas Desa</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Laporan Rekapitulasi Tabungan & Arus Keuangan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekapitulasi lengkap harian, bulanan, dan per RT untuk pertanggungjawaban bendahara desa dan Kepala Desa.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Dokumen Resmi A4</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Total Tabungan Warga</span>
            <Building className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-800">{formatRupiah(totalAllSavings)}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Dari {citizens.length} nasabah terdaftar di {config.desaName}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Total Setoran Masuk</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">{formatRupiah(totalDeposits)}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Total akumulasi setoran tabungan & iuran
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Total Penarikan Keluar</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-700">{formatRupiah(totalWithdrawals)}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Dana dicairkan kepada warga yang membutuhkan
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Saldo Bersih Kas Masuk</span>
            <PieChart className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-700">
            {formatRupiah(totalDeposits - totalWithdrawals)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Surplus arus kas tabungan desa
          </div>
        </div>

      </div>

      {/* Tabs Navigation */}
      <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs font-semibold overflow-x-auto">
        <button
          type="button"
          onClick={() => setReportTab('MUTASI')}
          className={`flex-1 py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            reportTab === 'MUTASI'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Buku Kas & Mutasi Transaksi</span>
        </button>

        <button
          type="button"
          onClick={() => setReportTab('REKAP_RT')}
          className={`flex-1 py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            reportTab === 'REKAP_RT'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Rekapitulasi per RT/RW</span>
        </button>

        <button
          type="button"
          onClick={() => setReportTab('REKAP_PROGRAM')}
          className={`flex-1 py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            reportTab === 'REKAP_PROGRAM'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Rekapitulasi Program Tabungan</span>
        </button>
      </div>

      {/* TAB 1: BUKU KAS & MUTASI TRANSAKSI */}
      {reportTab === 'MUTASI' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari transaksi, warga, ref..."
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <select
                value={filterSaving}
                onChange={(e) => setFilterSaving(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700"
              >
                <option value="ALL">Semua Program</option>
                <option value="KURBAN">Tabungan Kurban</option>
                <option value="PENDIDIKAN">Tabungan Pendidikan</option>
                <option value="HARI_RAYA">Tabungan Hari Raya</option>
                <option value="SUKARELA">Tabungan Sukarela</option>
                <option value="IURAN_RT">Iuran Kas RT</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700"
              >
                <option value="ALL">Semua Jenis Transaksi</option>
                <option value="SETOR">Hanya Setoran (+)</option>
                <option value="TARIK">Hanya Penarikan (-)</option>
              </select>
            </div>

            <span className="text-slate-500 font-medium">
              Menampilkan {filteredTransactions.length} dari {transactions.length} mutasi
            </span>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">No. Ref</th>
                    <th className="py-3 px-4">Tanggal & Jam</th>
                    <th className="py-3 px-4">Nama Warga</th>
                    <th className="py-3 px-4">Program Tabungan</th>
                    <th className="py-3 px-4">Jenis</th>
                    <th className="py-3 px-4 text-right">Nominal</th>
                    <th className="py-3 px-4 text-right">Saldo Akhir</th>
                    <th className="py-3 px-4">Status WA</th>
                    <th className="py-3 px-4 text-center">Struk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        Tidak ada catatan mutasi transaksi untuk filter yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const citizen = citizens.find(c => c.id === tx.citizenId);

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
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

                          <td className="py-3 px-4 text-right font-bold text-slate-800">
                            {formatRupiah(tx.balanceAfter)}
                          </td>

                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Terkirim
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            {onOpenReceipt && citizen && (
                              <button
                                type="button"
                                onClick={() => onOpenReceipt(tx, citizen)}
                                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Lihat Struk Transaksi"
                              >
                                <Receipt className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REKAPITULASI PER RT/RW */}
      {reportTab === 'REKAP_RT' && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm">
              Rekapitulasi Total Saldo Tabungan Warga per RT
            </h3>
            <p className="text-xs text-slate-500">
              Perbandingan akumulasi tabungan tiap wilayah rukun tetangga di {config.desaName}.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Wilayah</th>
                  <th className="py-3 px-4">Nasabah</th>
                  <th className="py-3 px-4 text-right">🐂 Kurban</th>
                  <th className="py-3 px-4 text-right">🎓 Pendidikan</th>
                  <th className="py-3 px-4 text-right">✨ Hari Raya</th>
                  <th className="py-3 px-4 text-right">🪙 Sukarela</th>
                  <th className="py-3 px-4 text-right font-bold text-emerald-800">Total Kas Terkumpul</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rekapRtData.map((row) => (
                  <tr key={row.rt} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      RT {row.rt}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {row.totalWarga} warga
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700">
                      {formatRupiah(row.kurban)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700">
                      {formatRupiah(row.pendidikan)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700">
                      {formatRupiah(row.hariRaya)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700">
                      {formatRupiah(row.sukarela)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      {formatRupiah(row.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
                <tr>
                  <td className="py-3 px-4 text-slate-800" colSpan={2}>
                    TOTAL SELURUH RT:
                  </td>
                  <td className="py-3 px-4 text-right text-slate-800">
                    {formatRupiah(rekapRtData.reduce((a, b) => a + b.kurban, 0))}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-800">
                    {formatRupiah(rekapRtData.reduce((a, b) => a + b.pendidikan, 0))}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-800">
                    {formatRupiah(rekapRtData.reduce((a, b) => a + b.hariRaya, 0))}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-800">
                    {formatRupiah(rekapRtData.reduce((a, b) => a + b.sukarela, 0))}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-800 text-sm">
                    {formatRupiah(totalAllSavings)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REKAPITULASI PER PROGRAM TABUNGAN */}
      {reportTab === 'REKAP_PROGRAM' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {programSummary.map((prog) => {
            const percentage = totalAllSavings > 0 ? Math.round((prog.total / totalAllSavings) * 100) : 0;

            return (
              <div key={prog.type} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{prog.info.icon}</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {percentage}% dari total kas desa
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-slate-900">{prog.info.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{prog.info.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Total Dana Terhimpun:</span>
                    <span className="text-xl font-extrabold text-slate-900">{formatRupiah(prog.total)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Partisipasi:</span>
                    <span className="text-xs font-bold text-emerald-700">{prog.activeMembers} Warga Aktif</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PRINT-ONLY OFFICIAL DOCUMENT A4 TEMPLATE */}
      <div className="hidden print:block fixed inset-0 bg-white p-8 text-black font-serif text-sm">
        {/* Kop Surat Resmi Desa */}
        <div className="text-center pb-4 border-b-4 border-double border-black">
          <div className="text-base font-bold uppercase tracking-wider">PEMERINTAH KABUPATEN {config.kabupaten.toUpperCase()}</div>
          <div className="text-lg font-bold uppercase tracking-wider">{config.kecamatan.toUpperCase()}</div>
          <div className="text-xl font-extrabold uppercase tracking-wider">KANTOR KEPALA DESA {config.desaName.toUpperCase()}</div>
          <div className="text-xs italic mt-0.5">{config.villageOfficeAddress}</div>
        </div>

        <div className="text-center my-6">
          <div className="text-base font-bold underline uppercase">
            LAPORAN REKAPITULASI TABUNGAN WARGA DESA (SITAB-DESA)
          </div>
          <div className="text-xs mt-1">
            Periode: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="mb-4">
          <table className="w-full border-collapse border border-black text-xs">
            <tbody>
              <tr>
                <td className="border border-black p-2 font-bold bg-gray-100">Total Nasabah Terdaftar</td>
                <td className="border border-black p-2">{citizens.length} Warga</td>
                <td className="border border-black p-2 font-bold bg-gray-100">Total Seluruh Tabungan Warga</td>
                <td className="border border-black p-2 font-bold">{formatRupiah(totalAllSavings)}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold bg-gray-100">Total Setoran Kas Masuk</td>
                <td className="border border-black p-2">{formatRupiah(totalDeposits)}</td>
                <td className="border border-black p-2 font-bold bg-gray-100">Total Penarikan Keluar</td>
                <td className="border border-black p-2">{formatRupiah(totalWithdrawals)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Per RT Table */}
        <div className="mb-6">
          <table className="w-full border-collapse border border-black text-xs text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-1.5">Wilayah RT</th>
                <th className="border border-black p-1.5">Warga</th>
                <th className="border border-black p-1.5 text-right">Kurban</th>
                <th className="border border-black p-1.5 text-right">Pendidikan</th>
                <th className="border border-black p-1.5 text-right">Hari Raya</th>
                <th className="border border-black p-1.5 text-right">Sukarela</th>
                <th className="border border-black p-1.5 text-right">Total Saldo</th>
              </tr>
            </thead>
            <tbody>
              {rekapRtData.map(r => (
                <tr key={r.rt}>
                  <td className="border border-black p-1.5">RT {r.rt}</td>
                  <td className="border border-black p-1.5">{r.totalWarga}</td>
                  <td className="border border-black p-1.5 text-right">{formatRupiah(r.kurban)}</td>
                  <td className="border border-black p-1.5 text-right">{formatRupiah(r.pendidikan)}</td>
                  <td className="border border-black p-1.5 text-right">{formatRupiah(r.hariRaya)}</td>
                  <td className="border border-black p-1.5 text-right">{formatRupiah(r.sukarela)}</td>
                  <td className="border border-black p-1.5 text-right font-bold">{formatRupiah(r.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 text-center text-xs pt-8">
          <div>
            <div>Mengetahui,</div>
            <div className="font-bold">Kepala Desa {config.desaName}</div>
            <div className="h-20"></div>
            <div className="font-bold underline">{config.kepalaDesa}</div>
            <div>NIP. 19750812 200212 1 003</div>
          </div>

          <div>
            <div>Dibuat oleh,</div>
            <div className="font-bold">Bendahara Kasir SITAB-Desa</div>
            <div className="h-20"></div>
            <div className="font-bold underline">{config.bendaharaName}</div>
            <div>Petugas Pengelola Keuangan Desa</div>
          </div>
        </div>

      </div>

    </div>
  );
};
