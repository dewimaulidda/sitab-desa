import React, { useState } from 'react';
import { Citizen, VillageConfig, WhatsAppMessage } from '../types';
import { 
  formatRupiah, 
  generateReminderText, 
  createWhatsAppWebUrl, 
  playWhatsAppChime 
} from '../utils/whatsapp';
import { 
  BellRing, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  CheckCheck, 
  Share2, 
  ExternalLink, 
  Smartphone,
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';

interface PengingatIuranProps {
  citizens: Citizen[];
  config: VillageConfig;
  onUpdateCitizen: (citizen: Citizen) => void;
  onBroadcastReminders: (messages: WhatsAppMessage[]) => void;
  onOpenPhoneSimulator?: (phone: string) => void;
}

export const PengingatIuran: React.FC<PengingatIuranProps> = ({
  citizens,
  config,
  onUpdateCitizen,
  onBroadcastReminders,
  onOpenPhoneSimulator
}) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState(0);
  const [broadcastLogs, setBroadcastLogs] = useState<string[]>([]);
  const [selectedCitizens, setSelectedCitizens] = useState<string[]>([]);
  const [isScheduleSettingsOpen, setIsScheduleSettingsOpen] = useState(false);
  const [autoScheduleActive, setAutoScheduleActive] = useState(true);

  // Month labels
  const monthOptions = [
    { key: '2026-10', label: 'Oktober 2026 (Bulan Ini)' },
    { key: '2026-09', label: 'September 2026' },
    { key: '2026-08', label: 'Agustus 2026' }
  ];

  // Separate paid vs unpaid citizens for the selected month
  const unpaidCitizens = citizens.filter(
    c => !c.monthlyFeePaidMonths.includes(selectedMonth)
  );
  const paidCitizens = citizens.filter(
    c => c.monthlyFeePaidMonths.includes(selectedMonth)
  );

  const totalCollected = paidCitizens.length * config.monthlyFeeAmount;
  const totalOutstanding = unpaidCitizens.length * config.monthlyFeeAmount;
  const percentagePaid = citizens.length > 0 ? Math.round((paidCitizens.length / citizens.length) * 100) : 0;

  // Toggle selection
  const handleToggleSelectAll = () => {
    if (selectedCitizens.length === unpaidCitizens.length) {
      setSelectedCitizens([]);
    } else {
      setSelectedCitizens(unpaidCitizens.map(c => c.id));
    }
  };

  const handleToggleCitizen = (id: string) => {
    setSelectedCitizens(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Quick mark paid
  const handleMarkAsPaid = (citizen: Citizen) => {
    if (citizen.monthlyFeePaidMonths.includes(selectedMonth)) return;
    const updated: Citizen = {
      ...citizen,
      monthlyFeePaidMonths: [...citizen.monthlyFeePaidMonths, selectedMonth]
    };
    onUpdateCitizen(updated);
  };

  // Send single reminder
  const handleSendSingleReminder = (citizen: Citizen) => {
    const text = generateReminderText(config, citizen, selectedMonth);
    playWhatsAppChime();

    const newMsg: WhatsAppMessage = {
      id: 'wa-rem-' + Date.now(),
      timestamp: new Date().toISOString(),
      recipientPhone: citizen.phone,
      recipientName: citizen.name,
      messageType: 'REMINDER',
      content: text,
      status: 'DELIVERED',
      deliveryChannel: 'DIRECT_WAME'
    };
    onBroadcastReminders([newMsg]);

    const url = createWhatsAppWebUrl(citizen.phone, text);
    window.open(url, '_blank');
  };

  // Automated Batch Broadcast Simulation
  const handleStartBroadcast = async () => {
    const targets = unpaidCitizens.filter(
      c => selectedCitizens.length === 0 || selectedCitizens.includes(c.id)
    );

    if (targets.length === 0) return;

    setIsBroadcasting(true);
    setBroadcastProgress(0);
    setBroadcastLogs([]);

    const createdMessages: WhatsAppMessage[] = [];

    for (let i = 0; i < targets.length; i++) {
      const citizen = targets[i];
      const text = generateReminderText(config, citizen, selectedMonth);
      
      // Delay 700ms between messages to simulate reliable server queue dispatch
      await new Promise(resolve => setTimeout(resolve, 600));

      const msg: WhatsAppMessage = {
        id: 'wa-broadcast-' + Date.now() + '-' + i,
        timestamp: new Date().toISOString(),
        recipientPhone: citizen.phone,
        recipientName: citizen.name,
        messageType: 'BROADCAST',
        content: text,
        status: 'DELIVERED',
        deliveryChannel: 'GATEWAY_API'
      };

      createdMessages.push(msg);
      playWhatsAppChime();

      setBroadcastProgress(Math.round(((i + 1) / targets.length) * 100));
      setBroadcastLogs(prev => [
        `[${new Date().toLocaleTimeString('id-ID')}] WhatsApp terkirim ke ${citizen.name} (${citizen.phone}) - Berhasil ✓`,
        ...prev
      ]);
    }

    onBroadcastReminders(createdMessages);
    setTimeout(() => {
      setIsBroadcasting(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Module Title Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-800 text-xs font-bold uppercase tracking-wider mb-1">
            <BellRing className="w-4 h-4" />
            <span>Fitur Notifikasi Pengingat Iuran Bulanan</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Broadcast & Pengingat Otomatis Iuran Kas Warga
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kirimkan pesan pengingat tagihan iuran kas RT / kebersihan bulanan secara otomatis via WhatsApp Gateway ke warga yang belum lunas.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setSelectedCitizens([]);
              }}
              className="bg-transparent font-bold text-slate-800 focus:outline-none"
            >
              {monthOptions.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsScheduleSettingsOpen(!isScheduleSettingsOpen)}
            className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Pengaturan Jadwal Otomatis"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Automated Scheduler Settings Box (Collapsible) */}
      {isScheduleSettingsOpen && (
        <div className="bg-gradient-to-r from-indigo-50 to-emerald-50 border border-indigo-200 rounded-2xl p-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 font-bold text-xs text-indigo-950 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Konfigurasi Jadwal Pengingat Iuran Otomatis</span>
            </div>
            <button
              onClick={() => setIsScheduleSettingsOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-3 rounded-xl border border-indigo-100">
              <span className="text-slate-500 block mb-1">Status Pengingat Otomatis:</span>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoScheduleToggle"
                  checked={autoScheduleActive}
                  onChange={(e) => setAutoScheduleActive(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded-sm"
                />
                <label htmlFor="autoScheduleToggle" className="font-bold text-slate-800 cursor-pointer">
                  {autoScheduleActive ? 'Aktif (Berjalan di Sistem)' : 'Nonaktif'}
                </label>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Pesan dikirim tanpa perlu tindakan manual dari bendahara desa.
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-indigo-100">
              <span className="text-slate-500 block mb-1">Frekuensi Jadwal Pengiriman:</span>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold text-slate-700">
                <option>Tiap Tanggal 10 & Tanggal 25 Pukul 09:00 WIB</option>
                <option>Tiap Tanggal 5 Awal Bulan</option>
                <option>H-3 Sebelum Akhir Bulan</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Jadwal disinkronkan dengan jam aktif warga desa.
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-indigo-100">
              <span className="text-slate-500 block mb-1">Nominal Iuran Rutin Bulanan:</span>
              <div className="font-bold text-indigo-700 text-sm">
                {formatRupiah(config.monthlyFeeAmount)} / KK
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Dapat disesuaikan di menu Pengaturan Desa.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Kepatuhan Warga</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{percentagePaid}%</div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${percentagePaid}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {paidCitizens.length} dari {citizens.length} warga telah lunas
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Warga Belum Bayar</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700">{unpaidCitizens.length}</div>
          <div className="text-[11px] text-slate-500 mt-2">
            Perlu dikirimkan notifikasi pengingat WA
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Iuran Terkumpul</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">{formatRupiah(totalCollected)}</div>
          <div className="text-[11px] text-slate-400 mt-2">
            Dari {paidCitizens.length} Kepala Keluarga lunas
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Piutang Iuran Tertunda</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-700">{formatRupiah(totalOutstanding)}</div>
          <div className="text-[11px] text-slate-400 mt-2">
            Potensi dana kas RT belum masuk
          </div>
        </div>

      </div>

      {/* Main Broadcast Control & Target Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        
        {/* Table Top Action Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-xs">
              Daftar Warga Belum Bayar Periode Ini ({unpaidCitizens.length})
            </span>
            {selectedCitizens.length > 0 && (
              <span className="text-[11px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                {selectedCitizens.length} dipilih
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 font-medium"
            >
              {selectedCitizens.length === unpaidCitizens.length ? 'Batalkan Semua' : 'Pilih Semua'}
            </button>

            <button
              type="button"
              onClick={handleStartBroadcast}
              disabled={unpaidCitizens.length === 0 || isBroadcasting}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors"
            >
              {isBroadcasting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengirim ({broadcastProgress}%)...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    Kirim Pengingat Masal ({selectedCitizens.length > 0 ? selectedCitizens.length : unpaidCitizens.length} Warga)
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real-time Broadcast Progress Animation Bar */}
        {isBroadcasting && (
          <div className="p-4 bg-indigo-50 border-b border-indigo-100 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-indigo-900">
              <span>Mengirimkan Broadcast Otomatis WhatsApp Gateway...</span>
              <span>{broadcastProgress}%</span>
            </div>
            <div className="w-full bg-indigo-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${broadcastProgress}%` }}
              />
            </div>
            <div className="max-h-24 overflow-y-auto font-mono text-[11px] text-indigo-800 space-y-1">
              {broadcastLogs.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))}
            </div>
          </div>
        )}

        {/* Unpaid Citizens Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={unpaidCitizens.length > 0 && selectedCitizens.length === unpaidCitizens.length}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 text-indigo-600 rounded-sm"
                  />
                </th>
                <th className="py-3 px-4">Nama Warga / KK</th>
                <th className="py-3 px-4">Alamat Wilayah</th>
                <th className="py-3 px-4">No. WhatsApp</th>
                <th className="py-3 px-4">Nominal Tagihan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unpaidCitizens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div className="font-bold text-sm text-slate-800">
                      Luar Biasa! Semua Warga Telah Lunas Iuran
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Kepatuhan warga untuk periode {selectedMonth} mencapai 100%.
                    </p>
                  </td>
                </tr>
              ) : (
                unpaidCitizens.map((c) => {
                  const isChecked = selectedCitizens.includes(c.id);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleCitizen(c.id)}
                          className="w-4 h-4 text-indigo-600 rounded-sm"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">NIK: {c.nik}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        RT {c.rt} / RW {c.rw} • {c.dusun}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-700">
                        {c.phone}
                      </td>

                      <td className="py-3 px-4 font-bold text-rose-600">
                        {formatRupiah(config.monthlyFeeAmount)}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          Belum Bayar
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Send WhatsApp Reminder Button */}
                          <button
                            type="button"
                            onClick={() => handleSendSingleReminder(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
                            title="Kirim Pengingat Langsung ke WA Warga"
                          >
                            <Share2 className="w-3 h-3 text-emerald-700" />
                            <span>Kirim WA</span>
                          </button>

                          {/* Quick Mark Paid */}
                          <button
                            type="button"
                            onClick={() => handleMarkAsPaid(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Tandai Sudah Bayar"
                          >
                            <CheckCheck className="w-3 h-3 text-slate-500" />
                            <span>Tandai Lunas</span>
                          </button>

                          {onOpenPhoneSimulator && (
                            <button
                              type="button"
                              onClick={() => onOpenPhoneSimulator(c.phone)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                              title="Buka HP Warga"
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* Already Paid Citizens Section (Collapsible Accordion) */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-800">
              Warga yang Sudah Lunas Iuran ({paidCitizens.length})
            </h3>
          </div>
          <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {formatRupiah(totalCollected)} Terkumpul
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {paidCitizens.map(c => (
            <div key={c.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-800">{c.name}</div>
                <div className="text-[11px] text-slate-500">RT {c.rt}/RW {c.rw} • {c.phone}</div>
              </div>
              <span className="text-emerald-700 font-bold text-xs">✓ Lunas</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
