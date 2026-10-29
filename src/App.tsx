import React, { useState, useEffect } from 'react';
import { 
  Citizen, 
  Transaction, 
  WhatsAppMessage, 
  VillageConfig 
} from './types';
import { 
  INITIAL_CITIZENS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_WA_MESSAGES, 
  INITIAL_VILLAGE_CONFIG 
} from './data/initialData';
import { Navbar, NavTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { KasirTransaksi } from './components/KasirTransaksi';
import { WargaNasabah } from './components/WargaNasabah';
import { PengingatIuran } from './components/PengingatIuran';
import { WaGateway } from './components/WaGateway';
import { Laporan } from './components/Laporan';
import { ReceiptModal } from './components/ReceiptModal';
import { PhoneSimulatorModal } from './components/PhoneSimulatorModal';

const STORAGE_KEYS = {
  CITIZENS: 'sitab_desa_citizens_v1',
  TRANSACTIONS: 'sitab_desa_transactions_v1',
  MESSAGES: 'sitab_desa_wa_messages_v1',
  CONFIG: 'sitab_desa_village_config_v1'
};

export default function App() {
  // Load state from localStorage or fallback to realistic initial seed data
  const [citizens, setCitizens] = useState<Citizen[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CITIZENS);
      return saved ? JSON.parse(saved) : INITIAL_CITIZENS;
    } catch {
      return INITIAL_CITIZENS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [messages, setMessages] = useState<WhatsAppMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      return saved ? JSON.parse(saved) : INITIAL_WA_MESSAGES;
    } catch {
      return INITIAL_WA_MESSAGES;
    }
  });

  const [config, setConfig] = useState<VillageConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return saved ? JSON.parse(saved) : INITIAL_VILLAGE_CONFIG;
    } catch {
      return INITIAL_VILLAGE_CONFIG;
    }
  });

  const [currentTab, setCurrentTab] = useState<NavTab>('DASHBOARD');

  // Modals state
  const [activeReceipt, setActiveReceipt] = useState<{
    tx: Transaction;
    citizen: Citizen;
  } | null>(null);

  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [selectedPhoneForSimulator, setSelectedPhoneForSimulator] = useState<string>('');

  // Save to LocalStorage on updates
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CITIZENS, JSON.stringify(citizens));
  }, [citizens]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }, [config]);

  // Unpaid citizens for current month
  const currentMonthKey = '2026-10';
  const unpaidCount = citizens.filter(c => !c.monthlyFeePaidMonths.includes(currentMonthKey)).length;

  // Handlers
  const handleSaveTransaction = (
    tx: Transaction, 
    updatedCitizen: Citizen, 
    waMessageText?: string
  ) => {
    // 1. Prepend transaction
    setTransactions(prev => [tx, ...prev]);

    // 2. Update citizen accounts
    setCitizens(prev => prev.map(c => c.id === updatedCitizen.id ? updatedCitizen : c));

    // 3. Log WhatsApp message if sent
    if (waMessageText) {
      const newMsg: WhatsAppMessage = {
        id: 'wa-msg-' + Date.now(),
        timestamp: new Date().toISOString(),
        recipientPhone: updatedCitizen.phone,
        recipientName: updatedCitizen.name,
        messageType: 'RECEIPT',
        content: waMessageText,
        status: 'DELIVERED',
        deliveryChannel: 'SIMULATOR',
        refNumber: tx.refNumber
      };
      setMessages(prev => [newMsg, ...prev]);
    }
  };

  const handleAddCitizen = (newCitizen: Citizen) => {
    setCitizens(prev => [newCitizen, ...prev]);
  };

  const handleUpdateCitizen = (updated: Citizen) => {
    setCitizens(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleDeleteCitizen = (citizenId: string) => {
    setCitizens(prev => prev.filter(c => c.id !== citizenId));
  };

  const handleBroadcastReminders = (newMessages: WhatsAppMessage[]) => {
    setMessages(prev => [...newMessages, ...prev]);
  };

  const handleSendTestMessage = (phone: string, text: string) => {
    const targetCitizen = citizens.find(c => c.phone.includes(phone) || phone.includes(c.phone));
    const newMsg: WhatsAppMessage = {
      id: 'wa-test-' + Date.now(),
      timestamp: new Date().toISOString(),
      recipientPhone: phone,
      recipientName: targetCitizen ? targetCitizen.name : 'Nomor Uji Coba',
      messageType: 'TEST',
      content: text,
      status: 'DELIVERED',
      deliveryChannel: 'SIMULATOR'
    };
    setMessages(prev => [newMsg, ...prev]);
  };

  const handleSendChatMessageFromSimulator = (phone: string, text: string) => {
    const targetCitizen = citizens.find(c => c.phone === phone);
    const newMsg: WhatsAppMessage = {
      id: 'wa-sim-' + Date.now(),
      timestamp: new Date().toISOString(),
      recipientPhone: phone,
      recipientName: targetCitizen ? targetCitizen.name : 'Warga Desa',
      messageType: 'RECEIPT',
      content: text,
      status: 'DELIVERED',
      deliveryChannel: 'SIMULATOR'
    };
    setMessages(prev => [newMsg, ...prev]);
  };

  const handleOpenReceiptModal = (tx: Transaction, citizen: Citizen) => {
    setActiveReceipt({ tx, citizen });
  };

  const handleOpenPhoneSimulator = (phone?: string) => {
    if (phone) {
      setSelectedPhoneForSimulator(phone);
    } else if (citizens.length > 0) {
      setSelectedPhoneForSimulator(citizens[0].phone);
    }
    setIsPhoneModalOpen(true);
  };

  const handleResetDemoData = () => {
    if (confirm('Kembalikan seluruh data ke data awal demo Desa Sukamaju?')) {
      setCitizens(INITIAL_CITIZENS);
      setTransactions(INITIAL_TRANSACTIONS);
      setMessages(INITIAL_WA_MESSAGES);
      setConfig(INITIAL_VILLAGE_CONFIG);
      localStorage.clear();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
      
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        config={config}
        unpaidCount={unpaidCount}
        onOpenPhoneSimulator={() => handleOpenPhoneSimulator()}
        onResetDemoData={handleResetDemoData}
      />

      {/* Main App Content View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {currentTab === 'DASHBOARD' && (
          <Dashboard
            citizens={citizens}
            transactions={transactions}
            messages={messages}
            config={config}
            onNavigate={setCurrentTab}
            onOpenReceipt={handleOpenReceiptModal}
            onOpenPhoneSimulator={handleOpenPhoneSimulator}
          />
        )}

        {currentTab === 'KASIR' && (
          <KasirTransaksi
            citizens={citizens}
            config={config}
            onSaveTransaction={handleSaveTransaction}
            onOpenReceipt={handleOpenReceiptModal}
          />
        )}

        {currentTab === 'WARGA' && (
          <WargaNasabah
            citizens={citizens}
            transactions={transactions}
            config={config}
            onAddCitizen={handleAddCitizen}
            onUpdateCitizen={handleUpdateCitizen}
            onDeleteCitizen={handleDeleteCitizen}
            onOpenPhoneSimulator={handleOpenPhoneSimulator}
            onSendMessageLog={(phone, text, name) => {
              const newMsg: WhatsAppMessage = {
                id: 'wa-stmt-' + Date.now(),
                timestamp: new Date().toISOString(),
                recipientPhone: phone,
                recipientName: name,
                messageType: 'RECEIPT',
                content: text,
                status: 'DELIVERED',
                deliveryChannel: 'DIRECT_WAME'
              };
              setMessages(prev => [newMsg, ...prev]);
            }}
          />
        )}

        {currentTab === 'PENGINGAT' && (
          <PengingatIuran
            citizens={citizens}
            config={config}
            onUpdateCitizen={handleUpdateCitizen}
            onBroadcastReminders={handleBroadcastReminders}
            onOpenPhoneSimulator={handleOpenPhoneSimulator}
          />
        )}

        {currentTab === 'GATEWAY' && (
          <WaGateway
            messages={messages}
            config={config}
            onUpdateConfig={setConfig}
            onSendTestMessage={handleSendTestMessage}
            onOpenPhoneSimulator={handleOpenPhoneSimulator}
          />
        )}

        {currentTab === 'LAPORAN' && (
          <Laporan
            citizens={citizens}
            transactions={transactions}
            config={config}
            onOpenReceipt={handleOpenReceiptModal}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <b>SITAB-Desa</b> • Sistem Informasi Tabungan Desa & WhatsApp Gateway Otomatis
          </div>
          <div>
            Pemerintah Desa {config.desaName} • Dilengkapi Struk Digital & Pengingat Iuran Bulanan
          </div>
        </div>
      </footer>

      {/* RECEIPT MODAL (Struk Digital & Thermal Print) */}
      {activeReceipt && (
        <ReceiptModal
          isOpen={!!activeReceipt}
          onClose={() => setActiveReceipt(null)}
          transaction={activeReceipt.tx}
          citizen={activeReceipt.citizen}
          config={config}
          onOpenPhoneSimulator={(phone) => handleOpenPhoneSimulator(phone)}
        />
      )}

      {/* SMARTPHONE WHATSAPP SIMULATOR MODAL */}
      <PhoneSimulatorModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        citizens={citizens}
        messages={messages}
        config={config}
        initialCitizenPhone={selectedPhoneForSimulator}
        onSendMessage={handleSendChatMessageFromSimulator}
      />

    </div>
  );
}
