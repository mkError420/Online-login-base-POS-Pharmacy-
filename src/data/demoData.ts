import { Medicine, Sale, Settings } from '../types';

export const demoMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    genericName: 'Acetaminophen',
    manufacturer: 'Beximco Pharma',
    price: 5,
    costPrice: 3,
    stock: 100,
    expiryDate: '2025-12-31',
    batchNumber: 'P2024001',
    unit: 'Tablet'
  },
  {
    id: '2',
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin Trihydrate',
    manufacturer: 'Square Pharma',
    price: 15,
    costPrice: 10,
    stock: 50,
    expiryDate: '2025-08-31',
    batchNumber: 'A2024002',
    unit: 'Capsule'
  },
  {
    id: '3',
    name: 'Ibuprofen 400mg',
    genericName: 'Ibuprofen',
    manufacturer: 'Incepta Pharma',
    price: 8,
    costPrice: 5,
    stock: 75,
    expiryDate: '2025-10-31',
    batchNumber: 'I2024003',
    unit: 'Tablet'
  },
  {
    id: '4',
    name: 'Omeprazole 20mg',
    genericName: 'Omeprazole',
    manufacturer: 'Eskayef Pharma',
    price: 12,
    costPrice: 8,
    stock: 30,
    expiryDate: '2025-09-30',
    batchNumber: 'O2024004',
    unit: 'Capsule'
  },
  {
    id: '5',
    name: 'Cetirizine 10mg',
    genericName: 'Cetirizine Hydrochloride',
    manufacturer: 'ACI Pharma',
    price: 6,
    costPrice: 4,
    stock: 60,
    expiryDate: '2026-01-31',
    batchNumber: 'C2024005',
    unit: 'Tablet'
  },
  {
    id: '6',
    name: 'Azithromycin 250mg',
    genericName: 'Azithromycin',
    manufacturer: 'Drug International',
    price: 25,
    costPrice: 18,
    stock: 25,
    expiryDate: '2025-07-31',
    batchNumber: 'Z2024006',
    unit: 'Tablet'
  },
  {
    id: '7',
    name: 'Metformin 500mg',
    genericName: 'Metformin Hydrochloride',
    manufacturer: 'Renata Pharma',
    price: 10,
    costPrice: 7,
    stock: 80,
    expiryDate: '2025-11-30',
    batchNumber: 'M2024007',
    unit: 'Tablet'
  },
  {
    id: '8',
    name: 'Saline Nasal Spray',
    genericName: 'Sodium Chloride',
    manufacturer: 'Beximco Pharma',
    price: 45,
    costPrice: 30,
    stock: 20,
    expiryDate: '2026-02-28',
    batchNumber: 'S2024008',
    unit: 'Bottle'
  }
];

export const demoSales: Sale[] = [
  {
    id: '1',
    date: '2024-03-25T09:30:00',
    items: [
      {
        medicineId: '1',
        name: 'Paracetamol 500mg',
        quantity: 2,
        price: 5,
        total: 10
      },
      {
        medicineId: '3',
        name: 'Ibuprofen 400mg',
        quantity: 1,
        price: 8,
        total: 8
      }
    ],
    subtotal: 18,
    discount: 2,
    discountPercent: 11,
    total: 16,
    customerPhone: '01712345678',
    paymentMethod: 'Cash'
  },
  {
    id: '2',
    date: '2024-03-25T10:15:00',
    items: [
      {
        medicineId: '2',
        name: 'Amoxicillin 500mg',
        quantity: 1,
        price: 15,
        total: 15
      }
    ],
    subtotal: 15,
    discount: 0,
    total: 15,
    paymentMethod: 'Card'
  },
  {
    id: '3',
    date: '2024-03-25T11:45:00',
    items: [
      {
        medicineId: '4',
        name: 'Omeprazole 20mg',
        quantity: 2,
        price: 12,
        total: 24
      },
      {
        medicineId: '5',
        name: 'Cetirizine 10mg',
        quantity: 1,
        price: 6,
        total: 6
      }
    ],
    subtotal: 30,
    discount: 3,
    discountPercent: 10,
    total: 27,
    customerPhone: '01898765432',
    paymentMethod: 'Mobile Banking'
  }
];

export const demoSettings: Settings = {
  shopName: 'MK Pharmacy Demo',
  shopAddress: '123 Demo Street, Dhaka, Bangladesh',
  shopPhone: '+880-2-1234567',
  shopEmail: 'demo@mkpharmacy.com',
  currency: 'BDT'
};
