import { useState, useEffect } from 'react';
import { PharmacyData, Medicine, Sale, Settings } from './types';
import { demoMedicines, demoSales, demoSettings } from './data/demoData';

const STORAGE_KEY = 'mk_pharmacy_pos_data';

const initialData: PharmacyData = {
  medicines: [
    {
      id: '1',
      name: 'Napa Extend',
      genericName: 'Paracetamol',
      manufacturer: 'Beximco Pharmaceuticals Ltd.',
      price: 15.00,
      costPrice: 12.00,
      stock: 500,
      expiryDate: '2027-12-31',
      batchNumber: 'BEX-001',
      unit: 'Tablet'
    },
    {
      id: '2',
      name: 'Seclo 20',
      genericName: 'Omeprazole',
      manufacturer: 'Square Pharmaceuticals Ltd.',
      price: 7.00,
      costPrice: 5.50,
      stock: 1000,
      expiryDate: '2026-06-30',
      batchNumber: 'SQR-442',
      unit: 'Capsule'
    },
    {
      id: '3',
      name: 'Fexo 120',
      genericName: 'Fexofenadine',
      manufacturer: 'Square Pharmaceuticals Ltd.',
      price: 10.00,
      costPrice: 8.00,
      stock: 200,
      expiryDate: '2026-10-15',
      batchNumber: 'SQR-991',
      unit: 'Tablet'
    }
  ],
  sales: [],
  settings: {
    shopName: 'MK Pharmacy',
    shopAddress: 'Dhaka, Bangladesh',
    shopPhone: '+880 1234 567890',
    shopEmail: 'contact@mkpharmacy.com',
    currency: '৳'
  }
};

export function usePharmacyData() {
  const [data, setData] = useState<PharmacyData>(() => {
    // Check if we're in demo mode
    const isDemoMode = localStorage.getItem('mk_pharmacy_demo_mode') === 'true';
    
    if (isDemoMode) {
      return {
        medicines: demoMedicines,
        sales: demoSales,
        settings: demoSettings
      };
    }
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure settings exist even if loading from an older version
      return {
        ...initialData,
        ...parsed,
        settings: parsed.settings || initialData.settings
      };
    }
    return initialData;
  });

  useEffect(() => {
    const isDemoMode = localStorage.getItem('mk_pharmacy_demo_mode') === 'true';
    if (!isDemoMode) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  const addMedicine = (medicine: Omit<Medicine, 'id'>) => {
    const newMedicine = { ...medicine, id: crypto.randomUUID() };
    setData(prev => ({
      ...prev,
      medicines: [...prev.medicines, newMedicine]
    }));
  };

  const updateMedicine = (id: string, updates: Partial<Medicine>) => {
    setData(prev => ({
      ...prev,
      medicines: prev.medicines.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  };

  const deleteMedicine = (id: string) => {
    setData(prev => ({
      ...prev,
      medicines: prev.medicines.filter(m => m.id !== id)
    }));
  };

  const addSale = (sale: Omit<Sale, 'id' | 'date'>) => {
    const newSale: Sale = {
      ...sale,
      id: `INV-${Date.now()}`,
      date: new Date().toISOString()
    };

    setData(prev => {
      // Update stock levels
      const updatedMedicines = prev.medicines.map(medicine => {
        const soldItem = sale.items.find(item => item.medicineId === medicine.id);
        if (soldItem) {
          return { ...medicine, stock: medicine.stock - soldItem.quantity };
        }
        return medicine;
      });

      return {
        ...prev,
        medicines: updatedMedicines,
        sales: [newSale, ...prev.sales]
      };
    });

    return newSale;
  };

  const setMedicines = (medicines: Medicine[]) => {
    setData(prev => ({
      ...prev,
      medicines
    }));
  };

  const updateSettings = (updates: Partial<Settings>) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }));
  };

  return {
    medicines: data.medicines,
    sales: data.sales,
    settings: data.settings,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    setMedicines,
    addSale,
    updateSettings
  };
}
