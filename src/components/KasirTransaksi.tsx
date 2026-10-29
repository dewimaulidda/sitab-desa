import React, { useState } from 'react';
import { Citizen, Transaction, VillageConfig, SavingType, TransactionType } from '../types';
import { 
  SAVING_LABELS, 
  formatRupiah, 
  generateReceiptText, 
  playWhatsAppChime 
} from '../utils/whatsapp';
import confetti from 'canvas-confetti';
import { 
  PlusCircle, 
  MinusCircle, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Send, 
  UserCheck, 
  Wallet, 
  Building2, 
  ArrowRight,
  ShieldCheck,
  Receipt
} from 'lucide-react';

interface KasirTransaksiProps {
  citizens: Citizen[];
  config: VillageConfig;
  onSaveTransaction: (
    tx: Transaction, 
    updatedCitizen: Citizen, 
    waMessageText?: string
  ) => void;
  onOpenReceipt: (tx: Transaction, citizen: Citizen) => void;
}

export const KasirTransaksi: React.FC<KasirTransaksiProps> = ({
  citizens,
  config,
  onSaveTransaction,
  onOpenReceipt
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCitizenId, setSelectedCitizenId] = useState<string>(citizens[0]?.id || '');
  const [transactionType, setTransactionType] = useState<TransactionType>('SETOR');
  const [selectedSaving, setSelectedSaving] = useState<SavingType>('KURBAN');
  const [amount, setAmount] = useState<number>(100000);
  const [customAmountStr, setCustomAmountStr] = useState<string>('100000');
  const [notes, setNotes] = useState<string>('');
  const [sendWhatsApp, setSendWhatsApp] = useState<boolean>(config.autoSendReceipt);
  const [isSuccessAlert, setIsSuccessAlert] = useState(false);

  const activeCitizen = citizens.find(c => c.id === selectedCitizenId) || citizens[0];

  // Filtered citizens for quick search dropdown
  const filteredCitizens = citizens.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.nik.includes(searchQuery) ||
    c.phone.includes(searchQuery) ||
    c.rt.includes(searchQuery)
  );

  const currentProgramBalance = activeCitizen && selectedSaving !== 'IURAN_RT' 
    ? (activeCitizen.accounts[selectedSaving as keyof typeof activeCitizen.accounts] || 0)
    : 0;

  const totalAllBalances = activeCitizen 
    ? Object.values(activeCitizen.accounts).reduce((a, b) => a + b, 0)
    : 0;

  // Projected new balance after transaction
  const projectedBalance = transactionType === 'SETOR'
    ? currentProgramBalance + (amount || 0)
    : transactionType === 'TARIK'
    ? currentProgramBalance - (amount || 0)
    : currentProgramBalance;

  const isWithdrawalValid = transactionType !== 'TARIK' || (amount > 0 && amount <= currentProgramBalance);

  const quickNominals = [20000, 50000, 100000, 200000, 500000, 1000000];

  const handleAmountChange = (val: number) => {
    setAmount(val);
    setCustomAmountStr(val ? val.toString() : '');
  };

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(rawVal, 10) || 0;
    setAmount(num);
    setCustomAmountStr(rawVal);
  };

  const handleTransactionTypeSelect = (type: TransactionType) => {
    setTransactionType(type);
    if (type === 'IURAN') {
      setSelectedSaving('IURAN_RT');
      handleAmountChange(config.monthlyFeeAmount);
      setNotes('Pembayaran Iuran Kas RT Desa Bulan Ini');
    } else if (selectedSaving === 'IURAN_RT') {
      setSelectedSaving('KURBAN');
      handleAmountChange(100000);
      setNotes('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCitizen || amount <= 0 || !isWithdrawalValid) return;

    // Generate unique reference number TR-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const refNumber = `TR-${dateStr}-${randomSuffix}`;

    // Compute updated citizen accounts
    const updatedAccounts = { ...activeCitizen.accounts };
    let newBalanceAfter = currentProgramBalance;

    if (transactionType === 'SETOR' && selectedSaving !== 'IURAN_RT') {
      newBalanceAfter = currentProgramBalance + amount;
      updatedAccounts[selectedSaving as keyof typeof updatedAccounts] = newBalanceAfter;
    } else if (transactionType === 'TARIK' && selectedSaving !== 'IURAN_RT') {
      newBalanceAfter = currentProgramBalance - amount;
      updatedAccounts[selectedSaving as keyof typeof updatedAccounts] = newBalanceAfter;
    }

    // If it's monthly fee, mark current month as paid
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    let updatedPaidMonths = [...activeCitizen.monthlyFeePaidMonths];
    if (transactionType === 'IURAN' || selectedSaving === 'IURAN_RT') {
      if (!updatedPaidMonths.includes(currentMonthKey)) {
        updatedPaidMonths.push(currentMonthKey);
      }
    }

    const updatedCitizen: Citizen = {
      ...activeCitizen,
      accounts: updatedAccounts,
      monthlyFeePaidMonths: updatedPaidMonths
    };

    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      refNumber,
      citizenId: activeCitizen.id,
      citizenName: activeCitizen.name,
      citizenPhone: activeCitizen.phone,
      savingType: selectedSaving,
      type: transactionType,
      amount,
      date: now.toISOString(),
      notes: notes.trim() || (transactionType === 'SETOR' ? 'Setoran tabungan kasir desa' : 'Penarikan tunai diserahkan bendahara'),
      adminName: config.bendaharaName,
      balanceBefore: currentProgramBalance,
      balanceAfter: newBalanceAfter,
      waStatus: sendWhatsApp ? 'DELIVERED' : 'SKIPPED'
    };

    // Generate formatted WhatsApp message text
    const programLabel = SAVING_LABELS[selectedSaving]?.name || selectedSaving;
    const totalAllNew = Object.values(updatedAccounts).reduce((a, b) => a + b, 0);
    const waText = generateReceiptText(
      config,
      updatedCitizen,
      newTx,
      programLabel,
      newBalanceAfter,
      totalAllNew
    );

    // Trigger visual confetti effect for deposit
    if (transactionType === 'SETOR' || transactionType === 'IURAN') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }

    // Play pleasant WhatsApp notification ding
    if (sendWhatsApp) {
      playWhatsAppChime();
    }

    onSaveTransaction(newTx, updatedCitizen, sendWhatsApp ? waText : undefined);

    setIsSuccessAlert(true);
    setTimeout(() => setIsSuccessAlert(false), 4000);

    // Open receipt modal automatically
    onOpenReceipt(newTx, updatedCitizen);

    // Reset notes but keep citizen or reset amount
    setNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* Module Title Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Wallet className="w-4 h-4" />
            <span>Modul Transaksi Kasir Desa</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Pencatatan Setoran & Penarikan Tabungan Cepat
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Setiap transaksi yang disimpan akan secara instan terhubung ke WhatsApp Gateway untuk mengirim bukti resmi ke warga.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Integrasi WA Otomatis Aktif</span>
        </div>
      </div>

      {isSuccessAlert && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-200 shrink-0" />
            <div className="text-sm">
              <span className="font-bold">Transaksi Berhasil Disimpan!</span> Saldo telah diperbarui dan bukti transaksi digital telah dikirim via WhatsApp.
            </div>
          </div>
        </div>
      )}

      {/* Main Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Cashier Input Form (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Pilih Warga / Nasabah */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Pilih Nasabah / Warga Desa
              </label>
              
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berdasarkan nama warga, NIK, No. HP, atau RT..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Citizen Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
                {filteredCitizens.slice(0, 8).map((c) => {
                  const isSelected = c.id === activeCitizen?.id;
                  const totalBal = Object.values(c.accounts).reduce((a, b) => a + b, 0);

                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setSelectedCitizenId(c.id)}
                      className={`text-left p-2.5 rounded-xl transition-all border flex items-center justify-between ${
                        isSelected 
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-400' 
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="overflow-hidden pr-2">
                        <div className="font-bold text-xs truncate">{c.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          RT {c.rt}/RW {c.rw} • {c.phone}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-bold text-emerald-700 block">
                          {formatRupiah(totalBal)}
                        </span>
                        <span className="text-[9px] text-slate-400">Total Saldo</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Tipe Transaksi (Setor / Tarik / Iuran) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Jenis Tindakan Transaksi
              </label>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleTransactionTypeSelect('SETOR')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                    transactionType === 'SETOR'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>SETORAN (+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTransactionTypeSelect('TARIK')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                    transactionType === 'TARIK'
                      ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <MinusCircle className="w-5 h-5" />
                  <span>PENARIKAN (-)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTransactionTypeSelect('IURAN')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                    transactionType === 'IURAN'
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span>IURAN KAS RT</span>
                </button>
              </div>
            </div>

            {/* Step 3: Program Tabungan (jika bukan iuran) */}
            {transactionType !== 'IURAN' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  3. Pilih Program Tabungan
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['KURBAN', 'PENDIDIKAN', 'HARI_RAYA', 'SUKARELA'] as SavingType[]).map((st) => {
                    const info = SAVING_LABELS[st];
                    const isSelected = selectedSaving === st;
                    const bal = activeCitizen?.accounts[st as keyof typeof activeCitizen.accounts] || 0;

                    return (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setSelectedSaving(st)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-1 ring-emerald-400'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xl mb-1">{info.icon}</div>
                        <div className="font-bold text-xs text-slate-800 leading-tight">
                          {info.name.replace('Tabungan ', '')}
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-700 mt-1">
                          {formatRupiah(bal)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Nominal Transaksi */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {transactionType === 'IURAN' ? '3.' : '4.'} Nominal Transaksi (Rp)
                </label>
                <span className="text-xs text-slate-500">
                  Terbilang: <span className="font-bold text-emerald-800">{formatRupiah(amount)}</span>
                </span>
              </div>

              {/* Quick Nominal Chips */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                {quickNominals.map((nom) => (
                  <button
                    type="button"
                    key={nom}
                    onClick={() => handleAmountChange(nom)}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
                      amount === nom
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {nom >= 1000000 ? `${nom / 1000000} Jt` : `${nom / 1000} Rb`}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-sm">Rp</span>
                <input
                  type="text"
                  value={customAmountStr}
                  onChange={handleCustomInput}
                  placeholder="Masukkan nominal custom..."
                  className="w-full pl-11 pr-4 py-2.5 text-base font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Warning if withdrawal exceeds balance */}
              {!isWithdrawalValid && (
                <div className="mt-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Nominal penarikan <b>({formatRupiah(amount)})</b> melebihi saldo tabungan saat ini <b>({formatRupiah(currentProgramBalance)})</b>!
                  </span>
                </div>
              )}
            </div>

            {/* Step 5: Catatan / Keterangan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Catatan / Keterangan (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Setoran minggu ke-3 kurban, titipan Pak RT, bayar seragam..."
                className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* WA Gateway Checkbox */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
              <input
                type="checkbox"
                id="sendWaToggle"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-emerald-600 rounded-sm focus:ring-emerald-500 border-emerald-300"
              />
              <label htmlFor="sendWaToggle" className="text-xs text-emerald-950 cursor-pointer">
                <span className="font-bold block">
                  Kirim Bukti Struk Digital via WhatsApp Gateway Otomatis
                </span>
                <span className="text-slate-600">
                  Notifikasi WA langsung dikirimkan ke <b>{activeCitizen?.phone}</b> segera setelah transaksi disimpan.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={amount <= 0 || !isWithdrawalValid}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Receipt className="w-4 h-4" />
              <span>Simpan Transaksi & Cetak Bukti</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>
        </div>

        {/* Right Side: Citizen Summary & Projected Balance Card (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Active Citizen Information Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
                  👤
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{activeCitizen?.name}</h4>
                  <p className="text-[11px] text-slate-400">NIK: {activeCitizen?.nik}</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Warga Aktif
              </span>
            </div>

            <div className="py-3 space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Alamat Wilayah:</span>
                <span className="font-medium text-white">RT {activeCitizen?.rt} / RW {activeCitizen?.rw}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dusun:</span>
                <span className="font-medium text-white">{activeCitizen?.dusun}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">WhatsApp:</span>
                <span className="font-mono text-emerald-400">{activeCitizen?.phone}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-700/60">
                <span className="text-slate-400">Status Iuran Bln Ini:</span>
                <span className={`font-bold ${activeCitizen?.monthlyFeePaidMonths.includes('2026-10') ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {activeCitizen?.monthlyFeePaidMonths.includes('2026-10') ? 'Lunas ✅' : 'Belum Bayar ⚠️'}
                </span>
              </div>
            </div>

            {/* Balances Breakdown */}
            <div className="mt-2 pt-3 border-t border-slate-700 space-y-2">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                Rincian Saldo Program Warga:
              </span>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">🐂 Kurban:</span>
                  <span className="font-bold text-emerald-400">{formatRupiah(activeCitizen?.accounts.KURBAN || 0)}</span>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">🎓 Pendidikan:</span>
                  <span className="font-bold text-blue-400">{formatRupiah(activeCitizen?.accounts.PENDIDIKAN || 0)}</span>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">✨ Hari Raya:</span>
                  <span className="font-bold text-amber-400">{formatRupiah(activeCitizen?.accounts.HARI_RAYA || 0)}</span>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">🪙 Sukarela:</span>
                  <span className="font-bold text-purple-400">{formatRupiah(activeCitizen?.accounts.SUKARELA || 0)}</span>
                </div>
              </div>

              <div className="mt-3 p-2.5 bg-emerald-950/60 rounded-xl border border-emerald-500/30 flex justify-between items-center text-xs">
                <span className="text-emerald-200">Total Semua Tabungan:</span>
                <span className="font-bold text-emerald-300 text-sm">{formatRupiah(totalAllBalances)}</span>
              </div>
            </div>
          </div>

          {/* Real-time Calculation Simulation Card */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
              Simulasi Perubahan Saldo
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Saldo Awal Program:</span>
                <span className="font-semibold text-slate-800">{formatRupiah(currentProgramBalance)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">
                  {transactionType === 'SETOR' ? 'Setoran Masuk (+):' : transactionType === 'TARIK' ? 'Penarikan Kas (-):' : 'Pembayaran Iuran:'}
                </span>
                <span className={`font-bold ${transactionType === 'SETOR' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {transactionType === 'SETOR' ? '+' : transactionType === 'TARIK' ? '-' : ''}{formatRupiah(amount)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-t-2 border-slate-200 text-sm">
                <span className="font-bold text-slate-800">Saldo Akhir Baru:</span>
                <span className={`font-extrabold ${projectedBalance < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {formatRupiah(Math.max(0, projectedBalance))}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
              <div className="font-semibold text-slate-700">Petugas Kasir:</div>
              <div>{config.bendaharaName}</div>
              <div className="text-[10px] text-slate-400">Kantor {config.desaName}</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
