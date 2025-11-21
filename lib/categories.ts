import { MaconomyCategory } from './types';

export const MACONOMY_CATEGORIES: MaconomyCategory[] = [
  { code: '1', name: 'Inköp hårdvara' },
  { code: '2', name: 'Programvara' },
  { code: '3', name: 'Förbrukningsmaterial' },
  { code: '4', name: 'Trängselskatt' },
  { code: '5', name: 'Övriga förmånsbilkostnader' },
  { code: '6', name: 'Flygresor' },
  { code: '7', name: 'Resekostnader' },
  { code: '8', name: 'Parkering' },
  { code: '9', name: 'Hotell Sverige' },
  { code: '10', name: 'Hotell Utland' },
  { code: '11', name: 'Extern representation' },
  { code: '12', name: 'Kontorsmatrial' },
  { code: '13', name: 'Telefon- & bredbandsabonnemang' },
  { code: '14', name: 'Utbildning' },
  { code: '15', name: 'Friskvård' },
  { code: '16', name: 'Intern representation' },
  { code: '17', name: 'Övriga personalkostnader' },
  { code: '18', name: 'Kaffe, fika m.m.' },
  { code: '19', name: 'Inget av ovanstående - övrigt' },
];

export function getCategoryName(code: string): string {
  const category = MACONOMY_CATEGORIES.find(cat => cat.code === code);
  return category ? category.name : 'Okänd kategori';
}

export function formatCategoryOption(category: MaconomyCategory): string {
  return `${category.code} - ${category.name}`;
}

