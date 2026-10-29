export type SavingType = 'KURBAN' | 'PENDIDIKAN' | 'HARI_RAYA' | 'SUKARELA' | 'IURAN_RT';

export type TransactionType = 'SETOR' | 'TARIK' | 'IURAN';

export interface Citizen {
  id: string;
  nik: string; // 16 digit NIK
  kk: string;  // 16 digit No KK
  name: string;
  phone: string; // e.g. "08123456789"
  rt: string;
  rw: string;
  dusun: string;
  joinDate: string; // YYYY-MM-DD
  accounts: {
    KURBAN: number;
    PENDIDIKAN: number;
    HARI_RAYA: number;
    SUKARELA: number;
  };
  monthlyFeePaidMonths: string[]; // ['2026-09', '2026-10']
  notes?: string;
  status: 'AKTIF' | 'NONAKTIF';
}

export interface Transaction {
  id: string;
  refNumber: string; // e.g. "TR-20261029-001"
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  savingType: SavingType;
  type: TransactionType;
  amount: number;
  date: string; // ISO string
  notes: string;
  adminName: string;
  balanceBefore: number;
  balanceAfter: number;
  waStatus: 'DELIVERED' | 'FAILED' | 'PENDING' | 'SKIPPED';
  waMessageId?: string;
}

export interface WhatsAppMessage {
  id: string;
  timestamp: string;
  recipientPhone: string;
  recipientName: string;
  messageType: 'RECEIPT' | 'REMINDER' | 'BROADCAST' | 'TEST';
  content: string;
  status: 'DELIVERED' | 'QUEUED' | 'READ' | 'FAILED';
  deliveryChannel: 'SIMULATOR' | 'DIRECT_WAME' | 'GATEWAY_API';
  refNumber?: string;
}

export interface VillageConfig {
  desaName: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kepalaDesa: string;
  bendaharaName: string;
  villageOfficeAddress: string;
  waGatewayNumber: string;
  waGatewayProvider: 'SIMULATOR' | 'FONNTE' | 'WABLAS' | 'CUSTOM_API';
  apiKey?: string;
  endpointUrl?: string;
  autoSendReceipt: boolean;
  autoSendMonthlyReminder: boolean;
  monthlyFeeAmount: number; // e.g. 25000
  receiptTemplate: string;
  reminderTemplate: string;
}
