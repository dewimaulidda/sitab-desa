import { Citizen, Transaction, VillageConfig, WhatsAppMessage } from '../types';

export const INITIAL_VILLAGE_CONFIG: VillageConfig = {
  desaName: 'Desa Mandiri Sukamaju',
  kecamatan: 'Kec. Cilaku',
  kabupaten: 'Kab. Cianjur',
  provinsi: 'Jawa Barat',
  kepalaDesa: 'Drs. H. Mulyadi Kusuma, M.Si.',
  bendaharaName: 'Siti Rahmawati, S.E.',
  villageOfficeAddress: 'Jl. Raya Desa Sukamaju No. 12, Kode Pos 43285',
  waGatewayNumber: '+62 812-8899-7700',
  waGatewayProvider: 'SIMULATOR',
  apiKey: '',
  endpointUrl: '',
  autoSendReceipt: true,
  autoSendMonthlyReminder: true,
  monthlyFeeAmount: 25000,
  receiptTemplate: `🏛️ *PEMERINTAH DESA {desa}*
*SITAB-Desa (Sistem Informasi Tabungan Warga)*
━━━━━━━━━━━━━━━━━━━━
*BUKTI TRANSAKSI {jenis_transaksi}*
No. Ref: {ref_number}
Waktu: {tanggal_waktu}

Yth. Bpk/Ibu *{nama_warga}*
(NIK: {nik} | RT {rt}/RW {rw})

Alhamdulillah, transaksi Anda telah berhasil dicatat oleh Kasir/Bendahara Desa:

• Program: *{program_tabungan}*
• Tipe: *{jenis_transaksi}*
• Nominal: *{nominal}*
• Petugas: {bendahara}
• Keterangan: {keterangan}

📊 *RINCIAN SALDO TERBARU:*
• Saldo {program_tabungan}: *{saldo_program}*
• Total Tabungan Anda: *{total_saldo}*

Terima kasih atas keikutsertaan Anda dalam memajukan perekonomian dan ketahanan mandiri warga {desa}. Simpan pesan ini sebagai bukti sah.
━━━━━━━━━━━━━━━━━━━━
_Sistem Otomatis SITAB-Desa terhubung WhatsApp Gateway_`,
  reminderTemplate: `🏛️ *PEMERINTAH DESA {desa}*
*Pengingat Iuran Rutin Warga Desa*
━━━━━━━━━━━━━━━━━━━━
Halo Bpk/Ibu *{nama_warga}*,
Warga RT {rt}/RW {rw} - Dusun {dusun}

Kami menginformasikan bahwa iuran wajib bulanan kas RT & pemeliharaan lingkungan desa untuk periode:
📅 *Bulan: {bulan_iuran}*
💰 *Nominal: {nominal_iuran}*

Saat ini status catatan: *BELUM TERCATAT LUNAS*.

Bpk/Ibu dapat melakukan pembayaran langsung ke Bendahara RT / Kantor Desa Sukamaju, atau dititipkan pada saat petugas tabungan keliling.

Jika sudah melakukan pembayaran, silakan balas pesan ini untuk konfirmasi pencocokan buku kas.

Terima kasih atas partisipasi dan kepedulian Bpk/Ibu untuk kebersihan, keamanan, dan kemajuan Desa kita tercinta. 🙏
━━━━━━━━━━━━━━━━━━━━
_Pengurus Bendahara & Kasir Desa Sukamaju_`
};

export const INITIAL_CITIZENS: Citizen[] = [
  {
    id: 'warga-1',
    nik: '3203011504820001',
    kk: '3203012001100005',
    name: 'Ahmad Fauzi',
    phone: '081283921044',
    rt: '01',
    rw: '02',
    dusun: 'Dusun Sukarame',
    joinDate: '2025-01-10',
    accounts: {
      KURBAN: 2850000,
      PENDIDIKAN: 1500000,
      HARI_RAYA: 950000,
      SUKARELA: 420000
    },
    monthlyFeePaidMonths: ['2026-08', '2026-09', '2026-10'],
    notes: 'Rutin menyetor tabungan kurban sapi per 2 minggu',
    status: 'AKTIF'
  },
  {
    id: 'warga-2',
    nik: '3203015508850002',
    kk: '3203012001100008',
    name: 'Siti Aminah',
    phone: '085719332211',
    rt: '02',
    rw: '01',
    dusun: 'Dusun Mekarsari',
    joinDate: '2025-02-14',
    accounts: {
      KURBAN: 1200000,
      PENDIDIKAN: 3400000,
      HARI_RAYA: 1800000,
      SUKARELA: 250000
    },
    monthlyFeePaidMonths: ['2026-08', '2026-09'],
    notes: 'Persiapan masuk SMP anak kedua',
    status: 'AKTIF'
  },
  {
    id: 'warga-3',
    nik: '3203011202790003',
    kk: '3203012001100012',
    name: 'Budi Santoso',
    phone: '081398765432',
    rt: '01',
    rw: '01',
    dusun: 'Dusun Mekarsari',
    joinDate: '2025-01-05',
    accounts: {
      KURBAN: 3500000,
      PENDIDIKAN: 800000,
      HARI_RAYA: 2200000,
      SUKARELA: 650000
    },
    monthlyFeePaidMonths: ['2026-08'],
    notes: 'Target kurban sudah lunas target 1 ekor kambing',
    status: 'AKTIF'
  },
  {
    id: 'warga-4',
    nik: '3203016307880004',
    kk: '3203012001100019',
    name: 'Ratna Dewi, S.Pd.',
    phone: '081290112233',
    rt: '03',
    rw: '02',
    dusun: 'Dusun Sukarame',
    joinDate: '2025-03-01',
    accounts: {
      KURBAN: 1500000,
      PENDIDIKAN: 2600000,
      HARI_RAYA: 1400000,
      SUKARELA: 890000
    },
    monthlyFeePaidMonths: ['2026-08', '2026-09', '2026-10'],
    notes: 'Guru SDN 1 Sukamaju',
    status: 'AKTIF'
  },
  {
    id: 'warga-5',
    nik: '3203012211750005',
    kk: '3203012001100025',
    name: 'Hendra Gunawan',
    phone: '087822446688',
    rt: '02',
    rw: '02',
    dusun: 'Dusun Sukarame',
    joinDate: '2025-04-12',
    accounts: {
      KURBAN: 750000,
      PENDIDIKAN: 1200000,
      HARI_RAYA: 850000,
      SUKARELA: 120000
    },
    monthlyFeePaidMonths: ['2026-08'],
    notes: 'Pedagang kelontong RT 02',
    status: 'AKTIF'
  },
  {
    id: 'warga-6',
    nik: '3203011809830006',
    kk: '3203012001100031',
    name: 'Joko Widodo Priyanto',
    phone: '085233445566',
    rt: '04',
    rw: '01',
    dusun: 'Dusun Cibodas',
    joinDate: '2025-05-20',
    accounts: {
      KURBAN: 2100000,
      PENDIDIKAN: 950000,
      HARI_RAYA: 1600000,
      SUKARELA: 310000
    },
    monthlyFeePaidMonths: ['2026-08', '2026-09'],
    notes: 'Petani cabai & sayur hidroponik',
    status: 'AKTIF'
  },
  {
    id: 'warga-7',
    nik: '3203014101900007',
    kk: '3203012001100037',
    name: 'Sri Wahyuni Ningsih',
    phone: '081377889900',
    rt: '01',
    rw: '02',
    dusun: 'Dusun Sukarame',
    joinDate: '2025-06-15',
    accounts: {
      KURBAN: 1000000,
      PENDIDIKAN: 1750000,
      HARI_RAYA: 1100000,
      SUKARELA: 540000
    },
    monthlyFeePaidMonths: ['2026-08', '2026-09', '2026-10'],
    notes: 'Kader Posyandu Melati',
    status: 'AKTIF'
  },
  {
    id: 'warga-8',
    nik: '3203012506720008',
    kk: '3203012001100042',
    name: 'Supriadi Maman',
    phone: '087766554433',
    rt: '03',
    rw: '01',
    dusun: 'Dusun Cibodas',
    joinDate: '2025-02-18',
    accounts: {
      KURBAN: 3000000,
      PENDIDIKAN: 450000,
      HARI_RAYA: 750000,
      SUKARELA: 210000
    },
    monthlyFeePaidMonths: ['2026-08'],
    notes: 'Peternak kambing lokal',
    status: 'AKTIF'
  },
  {
    id: 'warga-9',
    nik: '3203015012920009',
    kk: '3203012001100048',
    name: 'Nining Suryani',
    phone: '081255443322',
    rt: '02',
    rw: '01',
    dusun: 'Dusun Mekarsari',
    joinDate: '2025-07-01',
    accounts: {
      KURBAN: 500000,
      PENDIDIKAN: 2100000,
      HARI_RAYA: 1300000,
      SUKARELA: 350000
    },
    monthlyFeePaidMonths: ['2026-08', '2026-09'],
    notes: 'Pengrajin anyaman bambu desa',
    status: 'AKTIF'
  },
  {
    id: 'warga-10',
    nik: '3203011403810010',
    kk: '3203012001100055',
    name: 'Dedi Mulyadi Saputra',
    phone: '085811223344',
    rt: '04',
    rw: '02',
    dusun: 'Dusun Cibodas',
    joinDate: '2025-01-25',
    accounts: {
      KURBAN: 1800000,
      PENDIDIKAN: 1900000,
      HARI_RAYA: 1500000,
      SUKARELA: 780000
    },
    monthlyFeePaidMonths: ['2026-08', '2026-09', '2026-10'],
    notes: 'Koordinator Linmas / Keamanan RT 04',
    status: 'AKTIF'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    refNumber: 'TR-20261028-001',
    citizenId: 'warga-1',
    citizenName: 'Ahmad Fauzi',
    citizenPhone: '081283921044',
    savingType: 'KURBAN',
    type: 'SETOR',
    amount: 150000,
    date: '2026-10-28T09:30:00.000Z',
    notes: 'Setoran rutin tabungan kurban minggu ke-4',
    adminName: 'Siti Rahmawati, S.E.',
    balanceBefore: 2700000,
    balanceAfter: 2850000,
    waStatus: 'DELIVERED',
    waMessageId: 'wa-msg-1'
  },
  {
    id: 'tx-2',
    refNumber: 'TR-20261028-002',
    citizenId: 'warga-2',
    citizenName: 'Siti Aminah',
    citizenPhone: '085719332211',
    savingType: 'PENDIDIKAN',
    type: 'SETOR',
    amount: 200000,
    date: '2026-10-28T10:15:00.000Z',
    notes: 'Setoran tabungan pendidikan bekal sekolah',
    adminName: 'Siti Rahmawati, S.E.',
    balanceBefore: 3200000,
    balanceAfter: 3400000,
    waStatus: 'DELIVERED',
    waMessageId: 'wa-msg-2'
  },
  {
    id: 'tx-3',
    refNumber: 'TR-20261028-003',
    citizenId: 'warga-3',
    citizenName: 'Budi Santoso',
    citizenPhone: '081398765432',
    savingType: 'SUKARELA',
    type: 'TARIK',
    amount: 100000,
    date: '2026-10-28T11:45:00.000Z',
    notes: 'Penarikan mendesak keperluan obat keluarga',
    adminName: 'Siti Rahmawati, S.E.',
    balanceBefore: 750000,
    balanceAfter: 650000,
    waStatus: 'DELIVERED',
    waMessageId: 'wa-msg-3'
  },
  {
    id: 'tx-4',
    refNumber: 'TR-20261029-001',
    citizenId: 'warga-4',
    citizenName: 'Ratna Dewi, S.Pd.',
    citizenPhone: '081290112233',
    savingType: 'HARI_RAYA',
    type: 'SETOR',
    amount: 250000,
    date: '2026-10-29T08:15:00.000Z',
    notes: 'Cicilan THR Lebaran Idul Fitri',
    adminName: 'Siti Rahmawati, S.E.',
    balanceBefore: 1150000,
    balanceAfter: 1400000,
    waStatus: 'DELIVERED',
    waMessageId: 'wa-msg-4'
  }
];

export const INITIAL_WA_MESSAGES: WhatsAppMessage[] = [
  {
    id: 'wa-msg-1',
    timestamp: '2026-10-28T09:30:15.000Z',
    recipientPhone: '081283921044',
    recipientName: 'Ahmad Fauzi',
    messageType: 'RECEIPT',
    content: `🏛️ *PEMERINTAH DESA SUKAMAJU*
*SITAB-Desa (Sistem Tabungan Warga)*
Bukti Transaksi Setoran Tabungan Kurban Rp 150.000 berhasil dicatat. Saldo Kurban Anda kini Rp 2.850.000. Terima kasih!`,
    status: 'READ',
    deliveryChannel: 'SIMULATOR',
    refNumber: 'TR-20261028-001'
  },
  {
    id: 'wa-msg-2',
    timestamp: '2026-10-28T10:15:18.000Z',
    recipientPhone: '085719332211',
    recipientName: 'Siti Aminah',
    messageType: 'RECEIPT',
    content: `🏛️ *PEMERINTAH DESA SUKAMAJU*
Bukti Transaksi Setoran Tabungan Pendidikan Rp 200.000 berhasil dicatat. Saldo Pendidikan Anda kini Rp 3.400.000.`,
    status: 'READ',
    deliveryChannel: 'SIMULATOR',
    refNumber: 'TR-20261028-002'
  },
  {
    id: 'wa-msg-3',
    timestamp: '2026-10-28T11:45:20.000Z',
    recipientPhone: '081398765432',
    recipientName: 'Budi Santoso',
    messageType: 'RECEIPT',
    content: `🏛️ *PEMERINTAH DESA SUKAMAJU*
Penarikan Tabungan Sukarela Rp 100.000 telah diserahkan tunai oleh Bendahara. Sisa saldo Sukarela Rp 650.000.`,
    status: 'DELIVERED',
    deliveryChannel: 'SIMULATOR',
    refNumber: 'TR-20261028-003'
  },
  {
    id: 'wa-msg-4',
    timestamp: '2026-10-29T08:15:22.000Z',
    recipientPhone: '081290112233',
    recipientName: 'Ratna Dewi, S.Pd.',
    messageType: 'RECEIPT',
    content: `🏛️ *PEMERINTAH DESA SUKAMAJU*
Setoran Tabungan Hari Raya sebesar Rp 250.000 sukses dibukukan. Saldo Hari Raya saat ini Rp 1.400.000.`,
    status: 'DELIVERED',
    deliveryChannel: 'SIMULATOR',
    refNumber: 'TR-20261029-001'
  }
];
