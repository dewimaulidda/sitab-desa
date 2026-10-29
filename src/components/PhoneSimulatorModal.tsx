import React, { useState } from 'react';
import { Citizen, WhatsAppMessage, VillageConfig } from '../types';
import { formatRupiah, playWhatsAppChime } from '../utils/whatsapp';
import { 
  X, 
  Smartphone, 
  Send, 
  CheckCheck, 
  Phone, 
  Video, 
  MoreVertical, 
  Smile, 
  Paperclip, 
  Volume2, 
  VolumeX, 
  RefreshCw,
  Building2,
  ChevronLeft
} from 'lucide-react';

interface PhoneSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  citizens: Citizen[];
  messages: WhatsAppMessage[];
  config: VillageConfig;
  initialCitizenPhone?: string;
  onSendMessage?: (phone: string, text: string) => void;
}

export const PhoneSimulatorModal: React.FC<PhoneSimulatorModalProps> = ({
  isOpen,
  onClose,
  citizens,
  messages,
  config,
  initialCitizenPhone,
  onSendMessage
}) => {
  const [selectedPhone, setSelectedPhone] = useState<string>(
    initialCitizenPhone || (citizens.length > 0 ? citizens[0].phone : '')
  );
  const [inputText, setInputText] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  if (!isOpen) return null;

  // Active citizen based on selectedPhone
  const activeCitizen = citizens.find(c => c.phone === selectedPhone) || citizens[0];

  // Filter messages for this citizen's phone
  const citizenMessages = messages.filter(
    m => m.recipientPhone.replace(/[^0-9]/g, '') === activeCitizen?.phone.replace(/[^0-9]/g, '') ||
         m.recipientName.toLowerCase() === activeCitizen?.name.toLowerCase()
  );

  const handleSendReply = (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || !activeCitizen) return;

    if (soundEnabled) {
      playWhatsAppChime();
    }

    if (onSendMessage) {
      onSendMessage(activeCitizen.phone, textToSend);
    }
    setInputText('');
  };

  const handleQuickInquiry = (queryType: 'SALDO' | 'KURBAN' | 'IURAN' | 'KONFIRMASI') => {
    if (!activeCitizen) return;
    let userMsg = '';
    let autoReply = '';

    const totalBalance = Object.values(activeCitizen.accounts).reduce((a, b) => a + b, 0);

    if (queryType === 'SALDO') {
      userMsg = 'Halo Admin, tolong info rincian saldo tabungan saya saat ini ya?';
      autoReply = `🏛️ *INFORMASI SALDO SITAB-DESA*
Yth. Bpk/Ibu *${activeCitizen.name}* (RT ${activeCitizen.rt}/RW ${activeCitizen.rw})

Rincian saldo Anda per hari ini:
• 🐂 Tabungan Kurban: *${formatRupiah(activeCitizen.accounts.KURBAN)}*
• 🎓 Tabungan Pendidikan: *${formatRupiah(activeCitizen.accounts.PENDIDIKAN)}*
• ✨ Tabungan Hari Raya: *${formatRupiah(activeCitizen.accounts.HARI_RAYA)}*
• 🪙 Tabungan Sukarela: *${formatRupiah(activeCitizen.accounts.SUKARELA)}*
━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL KESELURUHAN:* *${formatRupiah(totalBalance)}*

Status Iuran Kas RT Bulan Ini: *${activeCitizen.monthlyFeePaidMonths.includes('2026-10') ? 'LUNAS ✅' : 'BELUM BAYAR ⚠️'}*

Terima kasih atas kepercayaannya!`;
    } else if (queryType === 'KURBAN') {
      userMsg = 'Berapa target dan jadwal tabungan kurban tahun depan?';
      autoReply = `🐂 *INFORMASI TABUNGAN KURBAN DESA SUKAMAJU*
• Target 1/7 Sapi: Rp 3.500.000
• Target 1 Kambing: Rp 2.800.000
• Saldo Kurban Anda saat ini: *${formatRupiah(activeCitizen.accounts.KURBAN)}*
• Sisa kekurangan: *${formatRupiah(Math.max(0, 3500000 - activeCitizen.accounts.KURBAN))}*

Penyetoran dapat dilakukan kapan saja melalui Bendahara RT atau Kantor Desa.`;
    } else if (queryType === 'IURAN') {
      userMsg = 'Mau tanya apakah iuran kas RT saya bulan ini sudah masuk?';
      const isPaid = activeCitizen.monthlyFeePaidMonths.includes('2026-10');
      autoReply = isPaid 
        ? `✅ Alhamdulillah, Bpk/Ibu *${activeCitizen.name}*, iuran RT periode Oktober 2026 sebesar *${formatRupiah(config.monthlyFeeAmount)}* sudah tercatat LUNAS. Terima kasih!`
        : `⚠️ Bpk/Ibu *${activeCitizen.name}*, catatan kasir menunjukkan iuran RT periode Oktober 2026 sebesar *${formatRupiah(config.monthlyFeeAmount)}* masih BELUM LUNAS. Bpk/Ibu bisa setor saat jadwal keliling atau transfer ke bendahara.`;
    } else {
      userMsg = 'Terima kasih atas pelayanannya bu bendahara.';
      autoReply = `Sama-sama Bpk/Ibu ${activeCitizen.name}, senang melayani warga ${config.desaName}! 🙏`;
    }

    if (onSendMessage) {
      onSendMessage(activeCitizen.phone, `[Warga] ${userMsg}`);
      setTimeout(() => {
        onSendMessage(activeCitizen.phone, autoReply);
        if (soundEnabled) playWhatsAppChime();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-3xl p-3 shadow-2xl max-w-sm w-full border-4 border-slate-700 flex flex-col max-h-[95vh] relative">
        
        {/* Smartphone Speaker / Notch */}
        <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
          <div className="w-10 h-1 bg-slate-600 rounded-full"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ml-2"></div>
        </div>

        {/* Top Control Header (Outside Phone Screen) */}
        <div className="flex items-center justify-between px-2 mb-2 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 font-medium">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Simulasi HP Warga</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 rounded text-slate-400 hover:text-white"
              title={soundEnabled ? 'Matikan Suara Ding' : 'Nyalakan Suara Ding'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Citizen Selector (Switch between residents) */}
        <div className="mb-2 px-1">
          <select
            value={activeCitizen?.phone || ''}
            onChange={(e) => setSelectedPhone(e.target.value)}
            aria-label="Pilih HP Warga untuk Disimulasikan"
            className="w-full text-xs bg-slate-800 text-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:border-emerald-500"
          >
            {citizens.map(c => (
              <option key={c.id} value={c.phone}>
                👤 {c.name} ({c.phone} - RT {c.rt})
              </option>
            ))}
          </select>
        </div>

        {/* THE PHONE SCREEN: WhatsApp UI */}
        <div className="flex-1 bg-[#efeae2] rounded-2xl overflow-hidden flex flex-col border border-slate-800 shadow-inner min-h-[500px]">
          
          {/* WA Top Bar */}
          <div className="bg-[#075e54] text-white px-3 py-2.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4 opacity-75" />
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shadow-2xs">
                🏛️
              </div>
              <div className="leading-tight">
                <div className="font-semibold text-xs flex items-center gap-1">
                  <span>SITAB-Desa Resmi</span>
                  <span className="text-[10px] bg-emerald-700 px-1 rounded text-emerald-100 font-normal">Official</span>
                </div>
                <div className="text-[10px] text-emerald-100/90 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                  online • Gateway Aktif
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-white/90">
              <Video className="w-4 h-4 cursor-pointer hover:opacity-80" />
              <Phone className="w-4 h-4 cursor-pointer hover:opacity-80" />
              <MoreVertical className="w-4 h-4 cursor-pointer hover:opacity-80" />
            </div>
          </div>

          {/* WA Chat History Stream with authentic chat background pattern */}
          <div 
            className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs"
            style={{
              backgroundImage: 'radial-gradient(#dfd7cc 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }}
          >
            {/* Encryption notice pill */}
            <div className="text-center my-1">
              <span className="inline-block bg-[#ffeecd] text-[#54656f] text-[10px] px-2.5 py-1 rounded-md shadow-2xs max-w-[260px] leading-tight">
                🔒 Pesan bukti transaksi dan iuran SITAB-Desa terenkripsi resmi dari Kantor Desa Sukamaju.
              </span>
            </div>

            {citizenMessages.length === 0 ? (
              <div className="text-center text-slate-500 py-8 text-xs">
                Belum ada pesan untuk warga ini.<br />
                <span className="text-[11px] text-slate-400">
                  Lakukan transaksi di menu Kasir atau kirim Pengingat Iuran untuk menguji gateway.
                </span>
              </div>
            ) : (
              citizenMessages.map((msg) => {
                const isIncomingFromCitizen = msg.content.startsWith('[Warga]');
                const cleanContent = isIncomingFromCitizen 
                  ? msg.content.replace('[Warga] ', '') 
                  : msg.content;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isIncomingFromCitizen ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-2.5 shadow-2xs relative text-slate-900 leading-relaxed ${
                        isIncomingFromCitizen 
                          ? 'bg-[#d9fdd3] rounded-tr-none' 
                          : 'bg-white rounded-tl-none border-l-4 border-l-emerald-600'
                      }`}
                    >
                      {/* Formatted Text Content */}
                      <div className="whitespace-pre-wrap text-[11px] font-sans">
                        {cleanContent}
                      </div>

                      {/* Timestamp & Status Checkmarks */}
                      <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-500">
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {isIncomingFromCitizen ? (
                          <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
                        ) : (
                          <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Reply Chips (Simulating Citizen Response Action) */}
          <div className="px-2 py-1.5 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <span className="text-slate-400 font-medium whitespace-nowrap">Aksi Warga:</span>
            <button
              type="button"
              onClick={() => handleQuickInquiry('SALDO')}
              className="px-2 py-1 bg-white border border-slate-300 rounded-full hover:bg-emerald-50 text-emerald-800 whitespace-nowrap shadow-2xs"
            >
              💰 Cek Saldo
            </button>
            <button
              type="button"
              onClick={() => handleQuickInquiry('IURAN')}
              className="px-2 py-1 bg-white border border-slate-300 rounded-full hover:bg-emerald-50 text-emerald-800 whitespace-nowrap shadow-2xs"
            >
              📋 Cek Iuran
            </button>
            <button
              type="button"
              onClick={() => handleQuickInquiry('KURBAN')}
              className="px-2 py-1 bg-white border border-slate-300 rounded-full hover:bg-emerald-50 text-emerald-800 whitespace-nowrap shadow-2xs"
            >
              🐂 Info Kurban
            </button>
            <button
              type="button"
              onClick={() => handleQuickInquiry('KONFIRMASI')}
              className="px-2 py-1 bg-white border border-slate-300 rounded-full hover:bg-emerald-50 text-emerald-800 whitespace-nowrap shadow-2xs"
            >
              👍 Terima Kasih
            </button>
          </div>

          {/* Input Chat Box */}
          <div className="bg-[#f0f2f5] p-2 flex items-center gap-1.5 border-t border-slate-200">
            <Smile className="w-5 h-5 text-slate-500 cursor-pointer" />
            <Paperclip className="w-5 h-5 text-slate-500 cursor-pointer" />
            
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendReply();
              }}
              placeholder="Ketik balasan warga..."
              className="flex-1 bg-white rounded-full px-3 py-1.5 text-xs text-slate-800 focus:outline-none border border-slate-200"
            />

            <button
              type="button"
              onClick={() => handleSendReply()}
              disabled={!inputText.trim()}
              className="w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:bg-[#008f6f] disabled:opacity-50 transition-colors shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
