import React, { useState } from 'react';
import { Transaction, Citizen, VillageConfig } from '../types';
import { formatRupiah, createWhatsAppWebUrl, SAVING_LABELS } from '../utils/whatsapp';
import { 
  X, 
  Printer, 
  Share2, 
  Smartphone, 
  CheckCircle2, 
  Copy, 
  FileText,
  ExternalLink
} from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  citizen: Citizen;
  config: VillageConfig;
  onOpenPhoneSimulator?: (citizenPhone: string) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  citizen,
  config,
  onOpenPhoneSimulator
}) => {
  const [viewMode, setViewMode] = useState<'DIGITAL' | 'THERMAL'>('DIGITAL');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const savingInfo = SAVING_LABELS[transaction.savingType];
  const programBalance = transaction.savingType !== 'IURAN_RT' 
    ? citizen.accounts[transaction.savingType as keyof typeof citizen.accounts] 
    : 0;
  
  const totalBalance = Object.values(citizen.accounts).reduce((a, b) => a + b, 0);

  const formattedDate = new Date(transaction.date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) + ' WIB';

  const waText = `🏛️ *PEMERINTAH DESA ${config.desaName.toUpperCase()}*
*SITAB-Desa (Sistem Informasi Tabungan Warga)*
━━━━━━━━━━━━━━━━━━━━
*BUKTI TRANSAKSI ${transaction.type === 'SETOR' ? 'SETORAN' : transaction.type === 'TARIK' ? 'PENARIKAN' : 'IURAN BULANAN'}*
No. Ref: ${transaction.refNumber}
Waktu: ${formattedDate}

Yth. Bpk/Ibu *${citizen.name}*
(NIK: ${citizen.nik} | RT ${citizen.rt}/RW ${citizen.rw})

Alhamdulillah, transaksi Anda telah berhasil dibukukan:
• Program: *${savingInfo?.name || transaction.savingType}*
• Tipe: *${transaction.type === 'SETOR' ? 'Setoran Tunai' : transaction.type === 'TARIK' ? 'Penarikan Kas' : 'Pembayaran Iuran'}*
• Nominal: *${formatRupiah(transaction.amount)}*
• Petugas: ${transaction.adminName}
• Keterangan: ${transaction.notes || '-'}

📊 *RINCIAN SALDO:*
• Saldo Program: *${formatRupiah(transaction.balanceAfter)}*
• Total Tabungan Desa: *${formatRupiah(totalBalance)}*

Terima kasih atas keikutsertaan Anda di Desa ${config.desaName}.
━━━━━━━━━━━━━━━━━━━━
_Sistem Otomatis SITAB-Desa WhatsApp Gateway_`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(waText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDirectWhatsApp = () => {
    const url = createWhatsAppWebUrl(citizen.phone, waText);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Top Bar */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              ✓
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Bukti Transaksi Berhasil</h3>
              <p className="text-xs text-slate-500">Ref: {transaction.refNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setViewMode('DIGITAL')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'DIGITAL' 
                    ? 'bg-white text-emerald-800 shadow-xs font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                E-Struk Digital
              </button>
              <button
                type="button"
                onClick={() => setViewMode('THERMAL')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'THERMAL' 
                    ? 'bg-white text-emerald-800 shadow-xs font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Struk Thermal
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex-1 bg-slate-100/50">
          
          {/* WA Gateway Auto-Sent Banner */}
          <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-3">
            <div className="p-1.5 bg-emerald-500 text-white rounded-lg mt-0.5">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-900">WhatsApp Gateway Terkirim Otomatis</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Berhasil
                </span>
              </div>
              <p className="text-emerald-700 mt-0.5">
                Struk digital telah dikirimkan ke nomor WA warga: <b>{citizen.phone}</b> ({citizen.name})
              </p>
            </div>
          </div>

          {/* VIEW: DIGITAL RECEIPT */}
          {viewMode === 'DIGITAL' && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
              {/* Header Card */}
              <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 text-white p-5 text-center relative">
                <div className="text-[11px] uppercase tracking-wider text-emerald-200 font-medium">
                  {config.desaName} • {config.kecamatan}
                </div>
                <h4 className="text-lg font-bold mt-1">SITAB-Desa</h4>
                <div className="text-xs text-emerald-100 font-mono mt-0.5">
                  BUKTI TRANSAKSI ELEKTRONIK
                </div>
                
                <div className="mt-4 bg-white/10 backdrop-blur-xs rounded-lg py-2 px-3 inline-block">
                  <span className="text-xs text-emerald-200 block">Nominal {transaction.type === 'SETOR' ? 'Setoran' : 'Penarikan'}</span>
                  <span className="text-2xl font-extrabold text-white">
                    {formatRupiah(transaction.amount)}
                  </span>
                </div>
              </div>

              {/* Body Details */}
              <div className="p-5 space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Nomor Referensi</span>
                  <span className="font-mono font-bold text-slate-800">{transaction.refNumber}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Nama Nasabah / Warga</span>
                  <span className="font-semibold text-slate-800 text-right">{citizen.name}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">NIK / Wilayah</span>
                  <span className="text-slate-700">{citizen.nik} (RT {citizen.rt}/RW {citizen.rw})</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Program Tabungan</span>
                  <span className="font-medium text-emerald-700 flex items-center gap-1">
                    <span>{savingInfo?.icon}</span>
                    <span>{savingInfo?.name || transaction.savingType}</span>
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Waktu Transaksi</span>
                  <span className="text-slate-700">{formattedDate}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Petugas / Bendahara</span>
                  <span className="text-slate-700">{transaction.adminName}</span>
                </div>

                {transaction.notes && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Catatan</span>
                    <span className="text-slate-700 italic">{transaction.notes}</span>
                  </div>
                )}

                {/* Balance breakdown card */}
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center text-slate-600 mb-1">
                    <span>Saldo Program ({savingInfo?.name || transaction.savingType}):</span>
                    <span className="font-bold text-slate-800">{formatRupiah(transaction.balanceAfter)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700 pt-1 border-t border-slate-200">
                    <span className="font-medium">Total Seluruh Tabungan Warga:</span>
                    <span className="font-bold text-emerald-700">{formatRupiah(totalBalance)}</span>
                  </div>
                </div>

                <div className="text-center pt-2 text-[11px] text-slate-400">
                  Dokumen ini merupakan bukti transaksi sah yang diterbitkan oleh Sistem SITAB-Desa {config.desaName}.
                </div>
              </div>
            </div>
          )}

          {/* VIEW: THERMAL RECEIPT (Print ready 58/80mm style) */}
          {viewMode === 'THERMAL' && (
            <div className="bg-white p-5 rounded-lg border border-slate-300 font-mono text-[11px] leading-tight text-slate-900 max-w-xs mx-auto shadow-sm">
              <div className="text-center pb-2 border-b border-dashed border-slate-400">
                <div className="font-bold text-sm">PEMERINTAH {config.desaName.toUpperCase()}</div>
                <div className="text-[10px]">{config.villageOfficeAddress}</div>
                <div className="text-[10px]">{config.kecamatan}, {config.kabupaten}</div>
                <div className="font-bold mt-1">SITAB-DESA</div>
              </div>

              <div className="py-2 border-b border-dashed border-slate-400 space-y-1">
                <div>REF: {transaction.refNumber}</div>
                <div>TGL: {new Date(transaction.date).toLocaleDateString('id-ID')} {new Date(transaction.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                <div>KASIR: {transaction.adminName}</div>
                <div>WARGA: {citizen.name.slice(0, 18)}</div>
                <div>RT/RW: {citizen.rt}/{citizen.rw} - {citizen.dusun}</div>
                <div>NO.WA: {citizen.phone}</div>
              </div>

              <div className="py-2 border-b border-dashed border-slate-400">
                <div className="font-bold uppercase">
                  {transaction.type === 'SETOR' ? 'SETORAN TABUNGAN' : transaction.type === 'TARIK' ? 'PENARIKAN TABUNGAN' : 'IURAN BULANAN'}
                </div>
                <div className="flex justify-between mt-1">
                  <span>{savingInfo?.name.slice(0, 16)}</span>
                  <span className="font-bold">{formatRupiah(transaction.amount)}</span>
                </div>
                {transaction.notes && (
                  <div className="text-[10px] text-slate-600 mt-0.5">Ket: {transaction.notes}</div>
                )}
              </div>

              <div className="py-2 border-b border-dashed border-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Saldo Awal:</span>
                  <span>{formatRupiah(transaction.balanceBefore)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Saldo Akhir:</span>
                  <span>{formatRupiah(transaction.balanceAfter)}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[10px]">
                  <span>Total Tabungan:</span>
                  <span>{formatRupiah(totalBalance)}</span>
                </div>
              </div>

              <div className="text-center pt-3 space-y-1 text-[10px]">
                <div>*** TERIMA KASIH ***</div>
                <div>SIMPAN STRUK INI SEBAGAI</div>
                <div>BUKTI TRANSAKSI YANG SAH</div>
                <div>WA CS: {config.waGatewayNumber}</div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              Cetak Struk
            </button>

            <button
              type="button"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              {copied ? 'Tersalin!' : 'Salin Pesan WA'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPhoneSimulator && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPhoneSimulator(citizen.phone);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
                title="Lihat tampilan WA di HP warga"
              >
                <Smartphone className="w-3.5 h-3.5" />
                Lihat di HP Warga
              </button>
            )}

            <button
              type="button"
              onClick={handleDirectWhatsApp}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              Kirim ke WA Warga
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
