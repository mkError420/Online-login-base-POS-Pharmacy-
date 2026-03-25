import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  BarChart3, 
  Plus, 
  Search, 
  Trash2, 
  Printer, 
  X,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Users,
  Pill,
  Download,
  Upload,
  FileText,
  Info,
  Settings as SettingsIcon,
  Store,
  Mail,
  Phone,
  MapPin,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { usePharmacyData } from './usePharmacyData';
import { Medicine, Sale, SaleItem, Settings } from './types';
import { cn, formatCurrency, exportToCSV } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  React.useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      console.log('PWA: beforeinstallprompt event fired');
    };
    window.addEventListener('beforeinstallprompt', handler);
    
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      console.log('PWA: App installed successfully');
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  return { canInstall: !!installPrompt && !isInstalled, isInstalled, install };
}

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

type View = 'dashboard' | 'inventory' | 'pos' | 'history' | 'reports' | 'settings';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const { medicines, sales, settings, addMedicine, updateMedicine, deleteMedicine, setMedicines, addSale, updateSettings } = usePharmacyData();
  const { canInstall, isInstalled, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const { user, logout, isDemoMode } = useAuth();

  // Update favicon when logo changes
  useEffect(() => {
    if (settings.logoUrl) {
      const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (link) {
        link.href = settings.logoUrl;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = settings.logoUrl;
        document.head.appendChild(newLink);
      }
    }
    
    // Update document title to shop name
    if (settings.shopName) {
      document.title = settings.shopName;
    }
  }, [settings.logoUrl, settings.shopName]);

  // Navigation Items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'New Sale', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'history', label: 'Sales History', icon: History },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col no-print">
          <div className="p-6 flex items-center gap-3 border-b border-[#E5E7EB]">
            <div className="bg-emerald-600 p-2 rounded-lg overflow-hidden flex items-center justify-center w-10 h-10">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <svg 
                  viewBox="0 0 489.566 489.566" 
                  className="text-white w-6 h-6 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g>
                    <path d="M226.625,82.266l-118.6-32.7c-40.4-11.3-82,12.4-93.3,52.9c-10.9,40.4,12.8,82.4,53.2,93.3l118.5,32.6L226.625,82.266z"/>
                    <path d="M433.725,144.466c38.1-17.9,54.4-63,36.5-100.7c-17.9-38.1-63-54.4-100.7-36.5l-111.5,51.7l64.1,137.6L433.725,144.466z"/>
                    <path d="M291.525,302.966c6.3-50.4,22.1-102.6,22.1-103.4c1.6-5.4-1.2-10.9-6.6-12.4c-5.4-1.6-10.9,1.2-12.4,6.6 c-0.8,3.1-16.3,54.4-22.9,105.7c-22.5-45.1-57.1-84-59.1-86.3c-3.5-4.3-10.1-4.3-14-0.8c-4.3,3.5-4.3,10.1-0.8,14 c0.4,0.4,32.6,36.5,54,77.7c13.5-0.8,26.5-1,39.2-0.8c-8.1,22.1-0.3,56-0.3,61c-0.6,9.8-8.9,10.1-8.9,10.1 c-7.8,1.7-10.5-7.8-10.5-7.8c-0.8-4.7-2.6-42.1-19-62.2c-78.5,3.9-137.2,20.6-137.2,40.8c0,22.9,78.1,41.6,174.5,41.6 s174.5-18.7,174.5-41.6C463.625,322.066,386.925,303.466,291.525,302.966z"/>
                    <path d="M289.125,406.366c-96.4,0-174.5-18.7-174.5-41.6v83.2c0,22.9,78.1,41.6,174.5,41.6s174.5-18.7,174.5-41.6v-83.2 C463.625,387.766,385.525,406.366,289.125,406.366z"/>
                  </g>
                </svg>
              )}
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight truncate max-w-[140px]">{settings.shopName}</h1>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pharmacy POS</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  currentView === item.id 
                    ? "bg-emerald-50 text-emerald-700 font-semibold shadow-sm" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5",
                  currentView === item.id ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-600"
                )} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-[#E5E7EB] space-y-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">System Status</p>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  isOnline ? "bg-emerald-500" : "bg-orange-500"
                )} />
                <span className="text-sm font-medium text-gray-700">
                  {isOnline ? "Online Mode" : "Offline Mode Active"}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative no-print">
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] px-8 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold capitalize">{currentView.replace('-', ' ')}</h2>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold">{format(new Date(), 'EEEE, MMMM do')}</p>
                <p className="text-xs text-gray-500">{format(new Date(), 'hh:mm a')}</p>
              </div>
              {user && (
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        {isDemoMode && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                            Demo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </header>

          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {currentView === 'dashboard' && <Dashboard medicines={medicines} sales={sales} />}
                {currentView === 'pos' && <POS medicines={medicines} onCompleteSale={(sale) => {
                  const newSale = addSale(sale);
                  setLastSale(newSale);
                }} />}
                {currentView === 'inventory' && (
                  <Inventory 
                    medicines={medicines} 
                    onAdd={addMedicine} 
                    onUpdate={updateMedicine} 
                    onDelete={deleteMedicine}
                    onImport={setMedicines}
                  />
                )}
                {currentView === 'history' && <SalesHistory sales={sales} settings={settings} onPrint={setLastSale} />}
                {currentView === 'reports' && <Reports sales={sales} medicines={medicines} />}
                {currentView === 'settings' && <SettingsView settings={settings} onUpdate={updateSettings} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Global Print Preview Modal (Auto-opens on sale) */}
        <AnimatePresence>
          {lastSale && (
            <PrintPreviewModal 
              sale={lastSale} 
              onClose={() => setLastSale(null)} 
              settings={settings} 
              autoPrint={true}
            />
          )}
        </AnimatePresence>

        {/* PWA Install Help Modal */}
        <AnimatePresence>
          {showInstallHelp && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setShowInstallHelp(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 p-8"
              >
                <div className="text-center mb-6">
                  <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Download className="text-emerald-600 w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black">Get the PC Version</h3>
                  <p className="text-sm text-gray-500 mt-2">Install MK Pharmacy POS as a standalone PC software (.exe) or PWA.</p>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <h4 className="font-bold text-emerald-700 mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      Option 1: Web Install (PWA)
                    </h4>
                    <p className="text-xs text-gray-600 mb-3">Fastest way. Works like a real PC app.</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      Option 2: Standalone .EXE
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">For a full local installation file.</p>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      To generate your own <b>.exe</b> installer:
                      <br />
                      1. Click <b>Settings</b> in the top bar.
                      <br />
                      2. Select <b>"Export to ZIP"</b>.
                      <br />
                      3. On your PC, run <code>npm install</code> then <code>npm run electron:build</code>.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowInstallHelp(false)}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
                >
                  Got it!
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// --- Print Preview Modal Component ---
function PrintPreviewModal({ sale, onClose, settings, autoPrint = false }: { sale: Sale, onClose: () => void, settings: Settings, autoPrint?: boolean }) {
  const [printFormat, setPrintFormat] = React.useState<'thermal' | 'a4'>('thermal');

  React.useEffect(() => {
    if (autoPrint) {
      // Small delay to ensure modal is rendered before printing
      const timer = setTimeout(() => {
        window.print(); 
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 invoice-modal-container bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row gap-6 max-w-6xl w-full h-[90vh] invoice-modal-inner">
        {/* Controls Panel */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white rounded-3xl p-6 w-full md:w-80 shadow-2xl flex flex-col no-print"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Print Options</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 flex-1">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Paper Size</label>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => setPrintFormat('thermal')}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                    printFormat === 'thermal' ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-gray-100 hover:border-gray-200"
                  )}
                >
                  <div className={cn("p-2 rounded-lg", printFormat === 'thermal' ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-500")}>
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold">Thermal Receipt</p>
                    <p className="text-xs opacity-70">80mm Width</p>
                  </div>
                </button>

                <button 
                  onClick={() => setPrintFormat('a4')}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                    printFormat === 'a4' ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-gray-100 hover:border-gray-200"
                  )}
                >
                  <div className={cn("p-2 rounded-lg", printFormat === 'a4' ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-500")}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold">A4 Invoice</p>
                    <p className="text-xs opacity-70">Standard Page</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
              <div className="flex gap-3 text-amber-700">
                <Info className="w-5 h-5 shrink-0" />
                <p className="text-xs leading-relaxed">
                  Ensure your printer settings match the selected paper size in the system dialog.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 space-y-3">
            <button 
              onClick={handlePrint}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
            >
              <Printer className="w-5 h-5" />
              Print Now
            </button>
            <button 
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-600 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>

        {/* Preview Panel */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex-1 bg-gray-800/50 rounded-3xl p-8 overflow-y-auto flex justify-center items-start invoice-preview-panel"
        >
          <div 
            id="printable-invoice"
            className={cn(
              "bg-white shadow-2xl transition-all duration-300 origin-top",
              printFormat === 'thermal' ? "w-[80mm] p-6 print-thermal" : "w-[210mm] min-h-[297mm] p-12 print-a4"
            )}
          >
            {/* Invoice Header */}
            <div className="text-center mb-8">
              <div className="bg-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Pill className="text-white w-8 h-8" />
                )}
              </div>
              <h3 className={cn("font-black", printFormat === 'thermal' ? "text-xl" : "text-3xl")}>{settings.shopName}</h3>
              <p className="text-sm text-gray-500 mt-1">{settings.shopAddress}</p>
              <div className="flex justify-center gap-4 text-xs text-gray-400 mt-2">
                <p>Phone: {settings.shopPhone}</p>
                {settings.shopEmail && <p>Email: {settings.shopEmail}</p>}
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="border-y border-dashed border-gray-200 py-4 mb-8 flex justify-between text-xs font-mono">
              <div className="space-y-1">
                <p><span className="text-gray-400">INVOICE:</span> {sale.id}</p>
                <p><span className="text-gray-400">DATE:</span> {format(new Date(sale.date), 'yyyy-MM-dd')}</p>
                {sale.customerPhone && <p><span className="text-gray-400">CUSTOMER:</span> {sale.customerPhone}</p>}
              </div>
              <div className="text-right space-y-1">
                <p><span className="text-gray-400">TIME:</span> {format(new Date(sale.date), 'hh:mm a')}</p>
                <p><span className="text-gray-400">CASHIER:</span> Admin</p>
                <p><span className="text-gray-400">METHOD:</span> {sale.paymentMethod}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <div className="grid grid-cols-12 gap-2 pb-2 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">
                <div className="col-span-6">Item Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              <div className="space-y-4">
                {sale.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 text-sm items-start">
                    <div className="col-span-6">
                      <p className="font-bold text-gray-900 leading-tight">{item.name}</p>
                    </div>
                    <div className="col-span-2 text-center text-gray-600">{item.quantity}</div>
                    <div className="col-span-2 text-right text-gray-600">{formatCurrency(item.price)}</div>
                    <div className="col-span-2 text-right font-bold text-gray-900">{formatCurrency(item.total)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Section */}
            <div className="space-y-3 border-t-2 border-gray-900 pt-6">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-sm text-red-600 font-medium">
                  <span>Discount {sale.discountPercent ? `(${sale.discountPercent}%)` : ''}</span>
                  <span>-{formatCurrency(sale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2">
                <span className="text-lg font-black uppercase">Grand Total</span>
                <span className="text-3xl font-black text-emerald-600">{formatCurrency(sale.total)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-dashed border-gray-200 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Thank you for your business!</p>
              <p className="text-[10px] text-gray-300">Software by MK POS</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// --- Dashboard Component ---
function Dashboard({ medicines, sales }: { medicines: Medicine[], sales: Sale[] }) {
  const todaySales = sales.filter(s => format(new Date(s.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'));
  const totalRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  const lowStockCount = medicines.filter(m => m.stock < 50).length;
  const expiringSoonCount = medicines.filter(m => {
    const expiry = new Date(m.expiryDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiry < threeMonthsFromNow;
  }).length;

  const stats = [
    { label: "Today's Revenue", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Today's Sales", value: todaySales.length, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Low Stock Items", value: lowStockCount, icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Expiring Soon", value: expiringSoonCount, icon: BarChart3, color: "text-red-600", bg: "bg-red-50" },
  ];

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return format(d, 'MMM dd');
    }).reverse();

    return last7Days.map(day => {
      const daySales = sales.filter(s => format(new Date(s.date), 'MMM dd') === day);
      return {
        name: day,
        revenue: daySales.reduce((sum, s) => sum + s.total, 0)
      };
    });
  }, [sales]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
          <h3 className="text-lg font-bold mb-6">Revenue Trend (Last 7 Days)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(v) => `৳${v}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
          <h3 className="text-lg font-bold mb-6">Recent Sales</h3>
          <div className="space-y-4">
            {sales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div>
                  <p className="text-sm font-bold">{sale.id}</p>
                  <p className="text-xs text-gray-500">{format(new Date(sale.date), 'hh:mm a')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">{formatCurrency(sale.total)}</p>
                  <p className="text-xs text-gray-400">{sale.items.length} items</p>
                </div>
              </div>
            ))}
            {sales.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <History className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No sales recorded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- POS Component ---
function POS({ medicines, onCompleteSale }: { medicines: Medicine[], onCompleteSale: (sale: any) => void }) {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [search, setSearch] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Mobile Banking'>('Cash');
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredMedicines = medicines.filter(m => 
    (m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.genericName.toLowerCase().includes(search.toLowerCase())) &&
    m.stock > 0
  );

  const addToCart = (medicine: Medicine) => {
    setCart(prev => {
      const existing = prev.find(item => item.medicineId === medicine.id);
      if (existing) {
        if (existing.quantity >= medicine.stock) return prev;
        return prev.map(item => 
          item.medicineId === medicine.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price } 
            : item
        );
      }
      return [...prev, {
        medicineId: medicine.id,
        name: medicine.name,
        quantity: 1,
        price: medicine.price,
        total: medicine.price
      }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.medicineId !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.medicineId === id) {
        const medicine = medicines.find(m => m.id === id);
        const newQty = Math.max(1, item.quantity + delta);
        if (medicine && newQty > medicine.stock) return item;
        return { ...item, quantity: newQty, total: newQty * item.price };
      }
      return item;
    }));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    onCompleteSale({
      items: cart,
      subtotal,
      discount: discountAmount,
      discountPercent: discount,
      total,
      customerPhone,
      paymentMethod
    });
    setCart([]);
    setCustomerPhone('');
    setDiscount(0);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-180px)]">
      {/* Product Selection */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search medicine by name or generic..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 pr-2">
          {filteredMedicines.map(medicine => (
            <button
              key={medicine.id}
              onClick={() => addToCart(medicine)}
              className="bg-white p-5 rounded-2xl border border-[#E5E7EB] text-left hover:border-emerald-500 hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-lg">{medicine.name}</h4>
                  <p className="text-xs text-gray-500 italic">{medicine.genericName}</p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded-lg">
                  {medicine.unit}
                </span>
              </div>
              <div className="flex justify-between items-end mt-4">
                <div>
                  <p className="text-lg font-black text-emerald-600">{formatCurrency(medicine.price)}</p>
                  <p className={cn("text-xs font-medium", medicine.stock < 50 ? "text-orange-500" : "text-gray-400")}>
                    Stock: {medicine.stock}
                  </p>
                </div>
                <div className="bg-emerald-600 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-5 h-5" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart / Checkout */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg flex flex-col overflow-hidden">
        <div className="p-6 border-b border-[#E5E7EB] bg-gray-50/50">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            Current Order
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.map(item => (
            <div key={item.medicineId} className="flex items-center gap-4 group">
              <div className="flex-1">
                <p className="text-sm font-bold">{item.name}</p>
                <p className="text-xs text-gray-500">{formatCurrency(item.price)} / unit</p>
              </div>
              <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-2 py-1">
                <button onClick={() => updateQuantity(item.medicineId, -1)} className="text-gray-500 hover:text-emerald-600 font-bold">-</button>
                <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.medicineId, 1)} className="text-gray-500 hover:text-emerald-600 font-bold">+</button>
              </div>
              <div className="text-right min-w-[80px]">
                <p className="text-sm font-bold">{formatCurrency(item.total)}</p>
              </div>
              <button 
                onClick={() => removeFromCart(item.medicineId)}
                className="text-gray-300 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-10" />
              <p className="text-sm">Your cart is empty</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-[#E5E7EB] space-y-4">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Phone number (Optional)"
              className="w-full px-4 py-2 text-sm bg-white border border-[#E5E7EB] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
            <div className="flex gap-2">
              <select 
                className="flex-1 px-4 py-2 text-sm bg-white border border-[#E5E7EB] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
              >
                <option>Cash</option>
                <option>Card</option>
                <option>Mobile Banking</option>
              </select>
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder="Discount (%)"
                  className="w-full px-4 py-2 text-sm bg-white border border-[#E5E7EB] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 pr-8"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-red-500">
                <span>Discount ({discount}%)</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-black pt-2">
              <span>Total</span>
              <span className="text-emerald-600">{formatCurrency(total)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
          >
            Complete Sale
          </button>
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span className="font-bold">Sale completed successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Inventory Component ---
function Inventory({ 
  medicines, 
  onAdd, 
  onUpdate, 
  onDelete,
  onImport
}: { 
  medicines: Medicine[], 
  onAdd: (m: any) => void, 
  onUpdate: (id: string, m: any) => void, 
  onDelete: (id: string) => void,
  onImport: (m: Medicine[]) => void
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const filtered = medicines.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.genericName.toLowerCase().includes(search.toLowerCase())
  );

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const [headerLine, ...rows] = text.split('\n').filter(line => line.trim());
        const headers = headerLine.split(',').map(h => h.trim());
        const data = rows.map(row => {
          const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          return headers.reduce((obj: any, header, i) => {
            let val = values[i]?.replace(/^"|"$/g, '').replace(/""/g, '"');
            if (!isNaN(Number(val)) && val.trim() !== '') {
              obj[header] = Number(val);
            } else {
              obj[header] = val;
            }
            return obj;
          }, {});
        });
        onImport(data as Medicine[]);
      } catch (err) {
        console.error('Import failed:', err);
        alert('Failed to import CSV. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search inventory..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".csv" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white text-gray-700 px-6 py-3 rounded-xl font-bold border border-[#E5E7EB] flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Upload className="w-5 h-5" />
            Import
          </button>
          <button 
            onClick={() => exportToCSV(medicines, 'inventory.csv')}
            className="bg-white text-gray-700 px-6 py-3 rounded-xl font-bold border border-[#E5E7EB] flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
          >
            <Plus className="w-5 h-5" />
            Add Medicine
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-[#E5E7EB]">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Medicine</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {filtered.map(m => (
              <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.genericName}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "font-bold",
                    m.stock < 50 ? "text-orange-600" : "text-gray-900"
                  )}>
                    {m.stock} {m.unit}s
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(m.price)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{format(new Date(m.expiryDate), 'MMM dd, yyyy')}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => { setEditingId(m.id); setShowAddModal(true); }}
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(m.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => { setShowAddModal(false); setEditingId(null); }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-[#E5E7EB] flex justify-between items-center">
                <h3 className="text-xl font-bold">{editingId ? 'Edit Medicine' : 'Add New Medicine'}</h3>
                <button onClick={() => { setShowAddModal(false); setEditingId(null); }} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form 
                className="p-8 grid grid-cols-2 gap-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const data = Object.fromEntries(formData.entries());
                  const formattedData = {
                    ...data,
                    price: Number(data.price),
                    costPrice: Number(data.costPrice),
                    stock: Number(data.stock),
                  };
                  if (editingId) onUpdate(editingId, formattedData);
                  else onAdd(formattedData);
                  setShowAddModal(false);
                  setEditingId(null);
                }}
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Medicine Name</label>
                  <input name="name" required defaultValue={medicines.find(m => m.id === editingId)?.name} className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Generic Name</label>
                  <input name="genericName" required defaultValue={medicines.find(m => m.id === editingId)?.genericName} className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Manufacturer</label>
                  <input name="manufacturer" required defaultValue={medicines.find(m => m.id === editingId)?.manufacturer} className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Selling Price (৳)</label>
                  <input name="price" type="number" step="0.01" required defaultValue={medicines.find(m => m.id === editingId)?.price} className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Stock Quantity</label>
                  <input name="stock" type="number" required defaultValue={medicines.find(m => m.id === editingId)?.stock} className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Expiry Date</label>
                  <input name="expiryDate" type="date" required defaultValue={medicines.find(m => m.id === editingId)?.expiryDate} className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Unit Type</label>
                  <select name="unit" className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500">
                    <option>Tablet</option>
                    <option>Capsule</option>
                    <option>Syrup</option>
                    <option>Injection</option>
                    <option>Ointment</option>
                  </select>
                </div>
                <div className="col-span-2 pt-4">
                  <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-100">
                    {editingId ? 'Update Medicine' : 'Add Medicine'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sales History Component ---
function SalesHistory({ sales, settings, onPrint }: { sales: Sale[], settings: Settings, onPrint: (sale: Sale) => void }) {
  const [searchPhone, setSearchPhone] = useState('');

  const filteredSales = useMemo(() => {
    return sales.filter(sale => 
      (sale.customerPhone || '').toLowerCase().includes(searchPhone.toLowerCase())
    );
  }, [sales, searchPhone]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h2 className="text-2xl font-black">Sales History</h2>
        <div className="flex flex-1 max-w-md w-full gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by phone..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
            />
          </div>
          <button 
            onClick={() => exportToCSV(filteredSales, 'sales_history.csv')}
            className="bg-white text-gray-700 px-6 py-3 rounded-xl font-bold border border-[#E5E7EB] flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-[#E5E7EB]">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice ID</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {filteredSales.map(sale => (
              <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-bold">{sale.id}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {format(new Date(sale.date), 'MMM dd, yyyy')}
                  <br />
                  <span className="text-xs text-gray-400">{format(new Date(sale.date), 'hh:mm a')}</span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">{sale.customerPhone || 'Walk-in'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{sale.items.length} items</td>
                <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(sale.total)}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onPrint(sale)}
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Settings Component ---
function SettingsView({ settings, onUpdate }: { settings: Settings, onUpdate: (updates: Partial<Settings>) => void }) {
  const [formData, setFormData] = useState(settings);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black">Shop Settings</h2>
        {isSaved && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Settings saved successfully!
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-sm text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Shop Logo</p>
            <div className="w-32 h-32 bg-gray-100 rounded-3xl mx-auto mb-6 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-200">
              {formData.logoUrl ? (
                <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <Store className="w-12 h-12 text-gray-300" />
              )}
            </div>
            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors border border-emerald-200"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Logo
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-3 w-3 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Or paste URL..."
                    className="w-full pl-8 pr-4 py-2 text-[10px] bg-gray-50 border border-[#E5E7EB] rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                    value={formData.logoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-400">Use a square image for best results.</p>
            </div>
          </div>

          <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-lg shadow-emerald-100">
            <h4 className="font-bold mb-2">MK Pharmacy POS</h4>
            <p className="text-xs opacity-80 leading-relaxed">
              Your settings are stored locally on this device. Changes will reflect on all invoices and reports immediately.
            </p>
          </div>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Store className="w-4 h-4 text-gray-400" />
                  Shop Name
                </label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  Currency Symbol
                </label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  Shop Address
                </label>
                <textarea 
                  required
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                  value={formData.shopAddress}
                  onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  Contact Phone
                </label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={formData.shopPhone}
                  onChange={(e) => setFormData({ ...formData, shopPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  Contact Email
                </label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={formData.shopEmail}
                  onChange={(e) => setFormData({ ...formData, shopEmail: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button 
                type="submit"
                className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-[0.98]"
              >
                Save All Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- Reports Component ---
function Reports({ sales, medicines }: { sales: Sale[], medicines: Medicine[] }) {
  const unitData = useMemo(() => {
    const units: Record<string, number> = {};
    medicines.forEach(m => {
      units[m.unit] = (units[m.unit] || 0) + 1;
    });
    return Object.entries(units).map(([name, value]) => ({ name, value }));
  }, [medicines]);

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalProfit = sales.reduce((sum, s) => {
    const saleProfit = s.items.reduce((p, item) => {
      const med = medicines.find(m => m.id === item.medicineId);
      const cost = med ? med.costPrice : item.price * 0.8;
      return p + (item.price - cost) * item.quantity;
    }, 0);
    return sum + saleProfit;
  }, 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm">
          <h3 className="text-xl font-bold mb-8">Unit Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={unitData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {unitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {unitData.map((unit, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-sm text-gray-600">{unit.name} ({unit.value})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm flex flex-col justify-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Total Lifetime Revenue</p>
              <h4 className="text-5xl font-black text-emerald-600">{formatCurrency(totalRevenue)}</h4>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Estimated Gross Profit</p>
              <h4 className="text-5xl font-black text-blue-600">{formatCurrency(totalProfit)}</h4>
            </div>
            <div className="pt-8 border-t border-gray-100">
              <div className="flex items-center gap-3 text-emerald-600">
                <TrendingUp className="w-6 h-6" />
                <span className="font-bold">Profit Margin: {((totalProfit / totalRevenue) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
