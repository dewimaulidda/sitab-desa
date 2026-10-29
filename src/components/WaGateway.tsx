import React, { useState } from 'react';
import { WhatsAppMessage, VillageConfig } from '../types';
import { cleanPhoneForWA, playWhatsAppChime, createWhatsAppWebUrl } from '../utils/whatsapp';
import { 
  Wifi, 
  CheckCircle2, 
  Smartphone, 
  QrCode, 
  Send, 
  RefreshCw, 
  Sliders, 
  Key, 
  FileText, 
  CheckCheck, 
  Clock, 
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Server,
  Zap,
  BatteryCharging
} from 'lucide-react';

interface WaGatewayProps {
  messages: WhatsAppMessage[];
  config: VillageConfig;
  onUpdateConfig: (newConfig: VillageConfig) => void;
  onSendTestMessage: (phone: string, text: string) => void;
  onOpenPhoneSimulator?: (phone: string) => void;
}

export const WaGateway: React.FC<WaGatewayProps> = ({
  messages,
  config,
  onUpdateConfig,
  onSendTestMessage,
  onOpenPhoneSimulator
}) => {
  const [activeTab, setActiveTab] = useState<'LOGS' | 'SETTINGS' | 'TEMPLATES' | 'TEST'>('LOGS');
  const [filterType, setFilterType] = useState<string>('ALL');
  
  // Test message form
  const [testPhone, setTestPhone] = useState('081283921044');
  const [testText, setTestText] = useState('Pesan tes koneksi WhatsApp Gateway SITAB-Desa berhasil! Server terhubung normal.');
  const [testSuccessNotice, setTestSuccessNotice] = useState(false);

  // Settings form
  const [provider, setProvider] = useState(config.waGatewayProvider);
  const [gatewayPhone, setGatewayPhone] = useState(config.waGatewayNumber);
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [endpointUrl, setEndpointUrl] = useState(config.endpointUrl || '');
  const [autoReceipt, setAutoReceipt] = useState(config.autoSendReceipt);
  const [autoReminder, setAutoReminder] = useState(config.autoSendMonthlyReminder);

  // Template editor
  const [receiptTpl, setReceiptTpl] = useState(config.receiptTemplate);
  const [reminderTpl, setReminderTpl] = useState(config.reminderTemplate);
  const [saveTplSuccess, setSaveTplSuccess] = useState(false);

  // Filter messages
  const filteredMessages = messages.filter((m) => {
    if (filterType === 'ALL') return true;
    return m.messageType === filterType;
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      ...config,
      waGatewayProvider: provider,
      waGatewayNumber: gatewayPhone,
      apiKey,
      endpointUrl,
      autoSendReceipt: autoReceipt,
      autoSendMonthlyReminder: autoReminder
    });
    alert('Pengaturan WhatsApp Gateway berhasil disimpan!');
  };

  const handleSaveTemplates = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      ...config,
      receiptTemplate: receiptTpl,
      reminderTemplate: reminderTpl
    });
    setSaveTplSuccess(true);
    setTimeout(() => setSaveTplSuccess(false), 3000);
  };

  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim() || !testText.trim()) return;

    playWhatsAppChime();
    onSendTestMessage(testPhone, testText);
    setTestSuccessNotice(true);
    setTimeout(() => setTestSuccessNotice(false), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Live Gateway Status */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4" />
              <span>Modul Integrasi WhatsApp Gateway SITAB-Desa</span>
            </div>
            <h2 className="text-xl font-bold">Pusat Integrasi & Notifikasi Otomatis</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Menghubungkan kasir desa dengan nomor WhatsApp resmi untuk otomatisasi pengiriman struk digital dan pengingat tagihan iuran warga.
            </p>
          </div>

          {/* Real-time Server Badge */}
          <div className="bg-slate-800/80 backdrop-blur-xs border border-emerald-500/30 p-3.5 rounded-xl flex items-center gap-3">
            <div className="relative">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping absolute"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 relative"></div>
            </div>
            <div className="text-xs leading-tight">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <span>GATEWAY ONLINE (TERHUBUNG)</span>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Nomor Gateway: <span className="font-mono text-white">{config.waGatewayNumber}</span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                <span>Ping: 24ms</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <BatteryCharging className="w-3 h-3 text-emerald-400" /> 94%
                </span>
                <span>•</span>
                <span>Provider: {config.waGatewayProvider}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs font-semibold overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('LOGS')}
          className={`flex-1 py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'LOGS'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Log Pengiriman Pesan ({messages.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TEST')}
          className={`flex-1 py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'TEST'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Uji Coba Pengiriman WA</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TEMPLATES')}
          className={`flex-1 py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'TEMPLATES'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Format Template Pesan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SETTINGS')}
          className={`flex-1 py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'SETTINGS'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Konfigurasi Provider & Token</span>
        </button>
      </div>

      {/* TAB 1: LOG PENGIRIMAN PESAN */}
      {activeTab === 'LOGS' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Filter Tipe Pesan:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
              >
                <option value="ALL">Semua Pesan</option>
                <option value="RECEIPT">Struk Transaksi Kasir</option>
                <option value="REMINDER">Pengingat Iuran Bulanan</option>
                <option value="BROADCAST">Broadcast Masal</option>
                <option value="TEST">Uji Coba / Tes</option>
              </select>
            </div>

            <span className="text-slate-500">
              Total {filteredMessages.length} pesan tercatat
            </span>
          </div>

          {/* Messages Table */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Penerima</th>
                    <th className="py-3 px-4">Tipe Pesan</th>
                    <th className="py-3 px-4">Isi Pesan WhatsApp</th>
                    <th className="py-3 px-4">Status Gateway</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMessages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Belum ada log pesan terkirim untuk filter ini.
                      </td>
                    </tr>
                  ) : (
                    filteredMessages.map((m) => {
                      const dateStr = new Date(m.timestamp).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'short'
                      });

                      return (
                        <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                            {dateStr}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{m.recipientName}</div>
                            <div className="text-[11px] font-mono text-slate-500">{m.recipientPhone}</div>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              m.messageType === 'RECEIPT' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : m.messageType === 'REMINDER'
                                ? 'bg-amber-100 text-amber-800'
                                : m.messageType === 'BROADCAST'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}>
                              {m.messageType === 'RECEIPT' ? 'Struk Kasir' : m.messageType === 'REMINDER' ? 'Pengingat Iuran' : m.messageType}
                            </span>
                          </td>

                          <td className="py-3 px-4 max-w-xs">
                            <div className="line-clamp-2 text-slate-700 font-mono text-[11px] bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                              {m.content}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                              Terkirim
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {onOpenPhoneSimulator && (
                                <button
                                  type="button"
                                  onClick={() => onOpenPhoneSimulator(m.recipientPhone)}
                                  className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                                  title="Lihat di Simulator HP Warga"
                                >
                                  <Smartphone className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  const url = createWhatsAppWebUrl(m.recipientPhone, m.content);
                                  window.open(url, '_blank');
                                }}
                                className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                                title="Buka di WhatsApp Web"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* TAB 2: UJI COBA PENGIRIMAN WA */}
      {activeTab === 'TEST' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              Uji Coba Pengiriman Pesan Langsung
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Kirimkan pesan uji coba ke nomor Anda sendiri atau warga untuk memverifikasi fungsionalitas gateway.
            </p>

            {testSuccessNotice && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pesan uji coba berhasil dikirimkan ke gateway & tercatat di sistem!</span>
              </div>
            )}

            <form onSubmit={handleSendTest} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nomor Tujuan WhatsApp (dengan kode negara / 08...)
                </label>
                <input
                  type="text"
                  required
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Teks Pesan Uji Coba
                </label>
                <textarea
                  rows={4}
                  required
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Pesan Uji Coba</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const url = createWhatsAppWebUrl(testPhone, testText);
                    window.open(url, '_blank');
                  }}
                  className="px-4 py-2.5 font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-xl flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Direct Web WhatsApp</span>
                </button>
              </div>
            </form>
          </div>

          <div className="md:col-span-5 bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-3 text-emerald-600">
              <QrCode className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">Status Perangkat Kasir Desa</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Perangkat WhatsApp HP Desa (+62 812-8899-7700) telah dipasangkan via multi-device WhatsApp Web.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
              <span>Sesi WhatsApp Siap Mengirim 24/7</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEMPLATES */}
      {activeTab === 'TEMPLATES' && (
        <form onSubmit={handleSaveTemplates} className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Kustomisasi Format Pesan WhatsApp
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gunakan variabel dinamis seperti <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700">{'{nama_warga}'}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700">{'{nominal}'}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700">{'{saldo_program}'}</code>, dll.
              </p>
            </div>

            {saveTplSuccess && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                ✓ Template Tersimpan!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                1. Template Bukti Struk Transaksi Kasir
              </label>
              <textarea
                rows={12}
                value={receiptTpl}
                onChange={(e) => setReceiptTpl(e.target.value)}
                className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                2. Template Pengingat Iuran Bulanan Warga
              </label>
              <textarea
                rows={12}
                value={reminderTpl}
                onChange={(e) => setReminderTpl(e.target.value)}
                className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors text-xs"
            >
              Simpan Perubahan Template
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: SETTINGS & PROVIDER CONFIG */}
      {activeTab === 'SETTINGS' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Konfigurasi Provider WhatsApp Gateway
            </h3>
            <p className="text-slate-500 mt-0.5">
              Pilih penyedia gateway WhatsApp yang digunakan oleh kantor desa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { id: 'SIMULATOR', label: 'Simulasi Terintegrasi', desc: 'Gratis & langsung jalan di sistem SITAB-Desa' },
              { id: 'FONNTE', label: 'Fonnte Gateway API', desc: 'Layanan API WA Gateway resmi Indonesia' },
              { id: 'WABLAS', label: 'Wablas API Gateway', desc: 'Integrasi WhatsApp Business Gateway' },
              { id: 'CUSTOM_API', label: 'Custom Webhook / Baileys', desc: 'Server WA mandiri internal desa' }
            ].map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => setProvider(p.id as any)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  provider === p.id 
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-slate-900">{p.label}</div>
                <div className="text-[11px] text-slate-500 mt-1">{p.desc}</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nomor Gateway WhatsApp Desa
              </label>
              <input
                type="text"
                value={gatewayPhone}
                onChange={(e) => setGatewayPhone(e.target.value)}
                placeholder="+62 812-8899-7700"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                API Token / Secret Key (Jika Menggunakan Fonnte/Wablas)
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Contoh: ak_live_xxxxxx"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 block">Opsi Otomatisasi:</span>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoReceiptToggle"
                checked={autoReceipt}
                onChange={(e) => setAutoReceipt(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm"
              />
              <label htmlFor="autoReceiptToggle" className="cursor-pointer text-slate-700">
                Otomatis kirim struk transaksi setiap kali bendahara menekan Simpan di Kasir.
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoReminderToggle"
                checked={autoReminder}
                onChange={(e) => setAutoReminder(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm"
              />
              <label htmlFor="autoReminderToggle" className="cursor-pointer text-slate-700">
                Aktifkan penjadwalan otomatis pengingat iuran bulanan untuk warga yang menunggak.
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              Simpan Pengaturan Gateway
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
