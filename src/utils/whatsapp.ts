import { Citizen, Transaction, VillageConfig, WhatsAppMessage, SavingType } from '../types';

export const SAVING_LABELS: Record<SavingType, { name: string; icon: string; color: string; desc: string }> = {
  KURBAN: {
    name: 'Tabungan Kurban',
    icon: '🐂',
    color: 'emerald',
    desc: 'Persiapan ibadah kurban Hari Raya Idul Adha warga desa'
  },
  PENDIDIKAN: {
    name: 'Tabungan Pendidikan',
    icon: '🎓',
    color: 'blue',
    desc: 'Bekal biaya sekolah, kuliah, seragam & buku anak desa'
  },
  HARI_RAYA: {
    name: 'Tabungan Hari Raya (THR)',
    icon: '✨',
    color: 'amber',
    desc: 'Simpanan hari raya Idul Fitri untuk belanja & kue lebaran'
  },
  SUKARELA: {
    name: 'Tabungan Sukarela / Umum',
    icon: '🪙',
    color: 'purple',
    desc: 'Simpanan fleksibel warga yang bisa disetor & ditarik sewaktu-waktu'
  },
  IURAN_RT: {
    name: 'Iuran Kas RT & Kebersihan',
    icon: '🏘️',
    color: 'indigo',
    desc: 'Iuran wajib rutin warga bulanan untuk kas lingkungan'
  }
};

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatSimpleNumber(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount);
}

export function cleanPhoneForWA(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62') && cleaned.length > 5) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export function createWhatsAppWebUrl(phone: string, text: string): string {
  const cleanPhone = cleanPhoneForWA(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function generateReceiptText(
  config: VillageConfig,
  citizen: Citizen,
  tx: Transaction,
  programName: string,
  programBalance: number,
  totalBalance: number
): string {
  const template = config.receiptTemplate || '';
  const dateFormatted = new Date(tx.date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) + ' WIB';

  const jenisLabel = tx.type === 'SETOR' ? 'SETORAN TABUNGAN' : tx.type === 'TARIK' ? 'PENARIKAN TABUNGAN' : 'IURAN BULANAN';

  return template
    .replace(/{desa}/g, config.desaName)
    .replace(/{jenis_transaksi}/g, jenisLabel)
    .replace(/{ref_number}/g, tx.refNumber)
    .replace(/{tanggal_waktu}/g, dateFormatted)
    .replace(/{nama_warga}/g, citizen.name)
    .replace(/{nik}/g, citizen.nik)
    .replace(/{rt}/g, citizen.rt)
    .replace(/{rw}/g, citizen.rw)
    .replace(/{program_tabungan}/g, programName)
    .replace(/{nominal}/g, formatRupiah(tx.amount))
    .replace(/{bendahara}/g, tx.adminName || config.bendaharaName)
    .replace(/{keterangan}/g, tx.notes || 'Transaksi kasir desa tercatat valid')
    .replace(/{saldo_program}/g, formatRupiah(programBalance))
    .replace(/{total_saldo}/g, formatRupiah(totalBalance));
}

export function generateReminderText(
  config: VillageConfig,
  citizen: Citizen,
  monthKey: string
): string {
  const template = config.reminderTemplate || '';
  
  // Format monthKey '2026-10' -> 'Oktober 2026'
  const [yearStr, monthStr] = monthKey.split('-');
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const monthIndex = parseInt(monthStr, 10) - 1;
  const monthLabel = `${monthNames[monthIndex] || monthStr} ${yearStr}`;

  return template
    .replace(/{desa}/g, config.desaName)
    .replace(/{nama_warga}/g, citizen.name)
    .replace(/{rt}/g, citizen.rt)
    .replace(/{rw}/g, citizen.rw)
    .replace(/{dusun}/g, citizen.dusun || 'Desa Sukamaju')
    .replace(/{bulan_iuran}/g, monthLabel)
    .replace(/{nominal_iuran}/g, formatRupiah(config.monthlyFeeAmount));
}

// Audio synthesizer for realistic WhatsApp ding chime (no external audio file required)
export function playWhatsAppChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    
    // First high note (bell)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(830, now);
    osc1.frequency.exponentialRampToValueAtTime(1046, now + 0.08);

    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second chime note
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318, now + 0.12);

    gain2.gain.setValueAtTime(0.25, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch (e) {
    console.warn('Audio chime playback muted or not supported in this environment:', e);
  }
}
