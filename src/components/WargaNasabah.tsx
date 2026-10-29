import React, { useState } from 'react';
import { Citizen, Transaction, VillageConfig, SavingType } from '../types';
import { 
  SAVING_LABELS, 
  formatRupiah, 
  createWhatsAppWebUrl, 
  playWhatsAppChime 
} from '../utils/whatsapp';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  BookOpen, 
  Edit3, 
  Trash2, 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  MapPin, 
  X, 
  Save, 
  ExternalLink,
  Smartphone
} from 'lucide-react';

interface WargaNasabahProps {
  citizens: Citizen[];
  transactions: Transaction[];
  config: VillageConfig;
  onAddCitizen: (citizen: Citizen) => void;
  onUpdateCitizen: (citizen: Citizen) => void;
  onDeleteCitizen: (citizenId: string) => void;
  onOpenPhoneSimulator?: (phone: string) => void;
  onSendMessageLog?: (phone: string, text: string, name: string) => void;
}

export const WargaNasabah: React.FC<WargaNasabahProps> = ({
  citizens,
  transactions,
  config,
  onAddCitizen,
  onUpdateCitizen,
  onDeleteCitizen,
  onOpenPhoneSimulator,
  onSendMessageLog
}) => {
  const [search, setSearch] = useState('');
  const [selectedRt, setSelectedRt] = useState<string>('ALL');
  const [selectedRw, setSelectedRw] = useState<string>('ALL');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCitizen, setEditingCitizen] = useState<Citizen | null>(null);
  const [inspectCitizen, setInspectCitizen] = useState<Citizen | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    kk: '',
    phone: '',
    rt: '01',
    rw: '01',
    dusun: 'Dusun Sukarame',
    notes: '',
    initialKurban: 0,
    initialPendidikan: 0,
    initialHariRaya: 0,
    initialSukarela: 0
  });

  // Filter citizens list
  const filteredCitizens = citizens.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nik.includes(search) ||
      c.kk.includes(search) ||
      c.phone.includes(search);
    
    const matchesRt = selectedRt === 'ALL' || c.rt === selectedRt;
    const matchesRw = selectedRw === 'ALL' || c.rw === selectedRw;

    return matchesSearch && matchesRt && matchesRw;
  });

  const uniqueRts = Array.from(new Set(citizens.map(c => c.rt))).sort();
  const uniqueRws = Array.from(new Set(citizens.map(c => c.rw))).sort();

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      nik: '',
      kk: '',
      phone: '08',
      rt: '01',
      rw: '01',
      dusun: 'Dusun Sukarame',
      notes: '',
      initialKurban: 0,
      initialPendidikan: 0,
      initialHariRaya: 0,
      initialSukarela: 0
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (c: Citizen) => {
    setEditingCitizen(c);
    setFormData({
      name: c.name,
      nik: c.nik,
      kk: c.kk,
      phone: c.phone,
      rt: c.rt,
      rw: c.rw,
      dusun: c.dusun,
      notes: c.notes || '',
      initialKurban: c.accounts.KURBAN,
      initialPendidikan: c.accounts.PENDIDIKAN,
      initialHariRaya: c.accounts.HARI_RAYA,
      initialSukarela: c.accounts.SUKARELA
    });
  };

  const handleSaveCitizen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    if (editingCitizen) {
      // Update existing
      const updated: Citizen = {
        ...editingCitizen,
        name: formData.name.trim(),
        nik: formData.nik.trim() || editingCitizen.nik,
        kk: formData.kk.trim() || editingCitizen.kk,
        phone: formData.phone.trim(),
        rt: formData.rt,
        rw: formData.rw,
        dusun: formData.dusun,
        notes: formData.notes
      };
      onUpdateCitizen(updated);
      setEditingCitizen(null);
    } else {
      // Create new
      const newCitizen: Citizen = {
        id: 'warga-' + Date.now(),
        nik: formData.nik.trim() || '32030' + Math.floor(10000000000 + Math.random() * 90000000000),
        kk: formData.kk.trim() || '32030' + Math.floor(10000000000 + Math.random() * 90000000000),
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        rt: formData.rt,
        rw: formData.rw,
        dusun: formData.dusun,
        joinDate: new Date().toISOString().slice(0, 10),
        accounts: {
          KURBAN: Number(formData.initialKurban) || 0,
          PENDIDIKAN: Number(formData.initialPendidikan) || 0,
          HARI_RAYA: Number(formData.initialHariRaya) || 0,
          SUKARELA: Number(formData.initialSukarela) || 0
        },
        monthlyFeePaidMonths: [],
        notes: formData.notes,
        status: 'AKTIF'
      };
      onAddCitizen(newCitizen);
      setIsAddModalOpen(false);
    }
  };

  const handleSendBalanceStatement = (citizen: Citizen) => {
    const totalBal = Object.values(citizen.accounts).reduce((a, b) => a + b, 0);
    const dateFormatted = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const text = `🏛️ *PEMERINTAH DESA ${config.desaName.toUpperCase()}*
*SITAB-Desa: Rangkuman Rekening Tabungan Warga*
━━━━━━━━━━━━━━━━━━━━
Kepada Yth. Bpk/Ibu *${citizen.name}*
NIK: ${citizen.nik}
Alamat: RT ${citizen.rt}/RW ${citizen.rw} - ${citizen.dusun}
Tanggal Update: ${dateFormatted}

📊 *RINCIAN SALDO TABUNGAN DESA:*
• 🐂 Tabungan Kurban: *${formatRupiah(citizen.accounts.KURBAN)}*
• 🎓 Tabungan Pendidikan: *${formatRupiah(citizen.accounts.PENDIDIKAN)}*
• ✨ Tabungan Hari Raya (THR): *${formatRupiah(citizen.accounts.HARI_RAYA)}*
• 🪙 Tabungan Sukarela/Umum: *${formatRupiah(citizen.accounts.SUKARELA)}*
━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL KESELURUHAN:* *${formatRupiah(totalBal)}*

Status Iuran Kas RT Bulan Ini: *${citizen.monthlyFeePaidMonths.includes('2026-10') ? 'LUNAS ✅' : 'BELUM BAYAR ⚠️'}*

Terima kasih atas keikutsertaan Anda dalam memajukan perekonomian desa. Simpan pesan ini untuk arsip pribadi.
━━━━━━━━━━━━━━━━━━━━
_Pengurus Bendahara & Kasir Desa ${config.desaName}_`;

    playWhatsAppChime();

    if (onSendMessageLog) {
      onSendMessageLog(citizen.phone, text, citizen.name);
    }

    const url = createWhatsAppWebUrl(citizen.phone, text);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Action Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Modul Nasabah & Kependudukan Desa</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Pendataan Warga & Rekening Tabungan Desa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data Nomor KK, NIK, alamat RT/RW, dan pantau saldo rekening tabungan program tiap warga.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors text-xs self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Warga Baru</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, NIK, KK, atau No HP..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedRt}
            onChange={(e) => setSelectedRt(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua RT</option>
            {uniqueRts.map(rt => <option key={rt} value={rt}>RT {rt}</option>)}
          </select>

          <select
            value={selectedRw}
            onChange={(e) => setSelectedRw(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua RW</option>
            {uniqueRws.map(rw => <option key={rw} value={rw}>RW {rw}</option>)}
          </select>

          <span className="text-xs text-slate-500 ml-auto sm:ml-2">
            Total: <b>{filteredCitizens.length}</b> warga
          </span>
        </div>
      </div>

      {/* Citizens Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Nama & Identitas Warga</th>
                <th className="py-3 px-4">Alamat Wilayah</th>
                <th className="py-3 px-4">No. WhatsApp</th>
                <th className="py-3 px-4">🐂 Kurban</th>
                <th className="py-3 px-4">🎓 Pendidikan</th>
                <th className="py-3 px-4">✨ THR</th>
                <th className="py-3 px-4">🪙 Sukarela</th>
                <th className="py-3 px-4 font-bold text-emerald-800">Total Saldo</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCitizens.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Tidak ditemukan data warga sesuai kata kunci pencarian.
                  </td>
                </tr>
              ) : (
                filteredCitizens.map((c) => {
                  const total = Object.values(c.accounts).reduce((a, b) => a + b, 0);
                  const isCurrentMonthPaid = c.monthlyFeePaidMonths.includes('2026-10');

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & NIK */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{c.name}</span>
                          {isCurrentMonthPaid && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-normal" title="Iuran RT bulan ini lunas">
                              Lunas Iuran
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          NIK: {c.nik}
                        </div>
                      </td>

                      {/* Address */}
                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-medium">RT {c.rt} / RW {c.rw}</div>
                        <div className="text-[11px] text-slate-500">{c.dusun}</div>
                      </td>

                      {/* WhatsApp Phone */}
                      <td className="py-3 px-4 font-mono text-slate-700">
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          {c.phone}
                        </span>
                      </td>

                      {/* Tabungan Accounts */}
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {formatRupiah(c.accounts.KURBAN)}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {formatRupiah(c.accounts.PENDIDIKAN)}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {formatRupiah(c.accounts.HARI_RAYA)}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {formatRupiah(c.accounts.SUKARELA)}
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        {formatRupiah(total)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setInspectCitizen(c)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Buka Buku Tabungan Warga"
                          >
                            <BookOpen className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSendBalanceStatement(c)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Kirim Ringkasan Saldo via WhatsApp"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Data Warga"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus data warga ${c.name}?`)) {
                                onDeleteCitizen(c.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Data Warga"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT CITIZEN PASSBOOK MODAL */}
      {inspectCitizen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Top Bar */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-emerald-200" />
                <div>
                  <h3 className="font-bold text-base">Buku Tabungan Digital Warga</h3>
                  <p className="text-xs text-emerald-200">SITAB-Desa {config.desaName}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectCitizen(null)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              {/* Citizen Card Profile */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-bold text-slate-900">{inspectCitizen.name}</div>
                  <div className="text-xs text-slate-500 space-x-2">
                    <span>NIK: {inspectCitizen.nik}</span>
                    <span>•</span>
                    <span>No. KK: {inspectCitizen.kk}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Alamat: RT {inspectCitizen.rt}/RW {inspectCitizen.rw} - {inspectCitizen.dusun}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendBalanceStatement(inspectCitizen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Kirim Saldo ke WA
                  </button>

                  {onOpenPhoneSimulator && (
                    <button
                      type="button"
                      onClick={() => {
                        setInspectCitizen(null);
                        onOpenPhoneSimulator(inspectCitizen.phone);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      Simulasi HP
                    </button>
                  )}
                </div>
              </div>

              {/* Balances by Saving Program */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Saldo Tiap Program Tabungan
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['KURBAN', 'PENDIDIKAN', 'HARI_RAYA', 'SUKARELA'] as SavingType[]).map((st) => {
                    const info = SAVING_LABELS[st];
                    const bal = inspectCitizen.accounts[st as keyof typeof inspectCitizen.accounts] || 0;
                    return (
                      <div key={st} className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                        <div className="text-xl mb-1">{info.icon}</div>
                        <div className="text-xs text-slate-600 font-medium">{info.name.replace('Tabungan ', '')}</div>
                        <div className="text-sm font-bold text-emerald-700 mt-1">{formatRupiah(bal)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transactions History for this citizen */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Mutasi Transaksi Warga Ini
                </h4>
                
                {transactions.filter(t => t.citizenId === inspectCitizen.id).length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                    Belum ada riwayat mutasi transaksi tercatat untuk warga ini.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="py-2.5 px-3">Tanggal</th>
                          <th className="py-2.5 px-3">Ref</th>
                          <th className="py-2.5 px-3">Program</th>
                          <th className="py-2.5 px-3">Tipe</th>
                          <th className="py-2.5 px-3 text-right">Nominal</th>
                          <th className="py-2.5 px-3 text-right">Saldo Akhir</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {transactions
                          .filter(t => t.citizenId === inspectCitizen.id)
                          .map(tx => (
                            <tr key={tx.id} className="hover:bg-slate-50">
                              <td className="py-2 px-3 text-slate-600">
                                {new Date(tx.date).toLocaleDateString('id-ID')}
                              </td>
                              <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                                {tx.refNumber}
                              </td>
                              <td className="py-2 px-3 text-slate-700 font-medium">
                                {SAVING_LABELS[tx.savingType]?.name.replace('Tabungan ', '') || tx.savingType}
                              </td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  tx.type === 'SETOR' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {tx.type}
                                </span>
                              </td>
                              <td className={`py-2 px-3 text-right font-bold ${
                                tx.type === 'SETOR' ? 'text-emerald-700' : 'text-rose-700'
                              }`}>
                                {tx.type === 'SETOR' ? '+' : '-'}{formatRupiah(tx.amount)}
                              </td>
                              <td className="py-2 px-3 text-right font-medium text-slate-800">
                                {formatRupiah(tx.balanceAfter)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectCitizen(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Tutup Buku Tabungan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT CITIZEN MODAL */}
      {(isAddModalOpen || editingCitizen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">
                {editingCitizen ? 'Edit Data Warga / Nasabah' : 'Tambah Warga / Nasabah Baru'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCitizen(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCitizen} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Warga *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIK (16 Digit)</label>
                  <input
                    type="text"
                    maxLength={16}
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    placeholder="320301..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. Kartu Keluarga (KK)</label>
                  <input
                    type="text"
                    maxLength={16}
                    value={formData.kk}
                    onChange={(e) => setFormData({ ...formData, kk: e.target.value })}
                    placeholder="320301..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">No. WhatsApp (Aktif) *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Contoh: 08123456789"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Nomor ini digunakan gateway pengirim bukti setoran/penarikan otomatis.
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">RT</label>
                  <input
                    type="text"
                    value={formData.rt}
                    onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                    placeholder="01"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">RW</label>
                  <input
                    type="text"
                    value={formData.rw}
                    onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                    placeholder="01"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dusun / Kampung</label>
                  <input
                    type="text"
                    value={formData.dusun}
                    onChange={(e) => setFormData({ ...formData, dusun: e.target.value })}
                    placeholder="Dusun Sukarame"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {!editingCitizen && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-700 block">Setoran Awal (Opsional - Rp):</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500">🐂 Kurban:</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.initialKurban || ''}
                        onChange={(e) => setFormData({ ...formData, initialKurban: Number(e.target.value) })}
                        placeholder="0"
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">🎓 Pendidikan:</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.initialPendidikan || ''}
                        onChange={(e) => setFormData({ ...formData, initialPendidikan: Number(e.target.value) })}
                        placeholder="0"
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">✨ Hari Raya:</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.initialHariRaya || ''}
                        onChange={(e) => setFormData({ ...formData, initialHariRaya: Number(e.target.value) })}
                        placeholder="0"
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">🪙 Sukarela:</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.initialSukarela || ''}
                        onChange={(e) => setFormData({ ...formData, initialSukarela: Number(e.target.value) })}
                        placeholder="0"
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Khusus</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Contoh: Pekerjaan petani, target 1 ekor kambing..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCitizen(null);
                  }}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Data Warga</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
