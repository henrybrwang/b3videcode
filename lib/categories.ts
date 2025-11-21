import { MaconomyCategory } from './types';

export const MACONOMY_CATEGORIES: MaconomyCategory[] = [
  { code: '5410', name: 'Inköp hårdvara' },
  { code: '5420', name: 'Programvara' },
  { code: '5460', name: 'Förbrukningsmatrial' },
  { code: '5614', name: 'Trängselskatt' },
  { code: '5619', name: 'Övriga förmånsbilkostnader' },
  { code: '510', name: 'Flygresor' },
  { code: '5800', name: 'Resekostnader' },
  { code: '5810', name: 'Parkering' },
  { code: '5831', name: 'Hotell Sverige' },
  { code: '5832', name: 'Hotell utland' },
  { code: '6072', name: 'Extern representation' },
  { code: '6110', name: 'Kontorsmatrial' },
  { code: '6210', name: 'Telefon- & bredbandsabonnemang' },
  { code: '7610', name: 'Utbildning' },
  { code: '7620', name: 'Friskvård' },
  { code: '7632', name: 'Intern representation' },
  { code: '7690', name: 'Övriga personalkostnader' },
  { code: '7694', name: 'Kaffe, fika m.m.' },
  { code: '9998', name: 'Inget av ovanstående - övrigt' },
  { code: '620', name: 'Traktamente' },
  { code: '621', name: 'Traktamente avdrag frukost' },
  { code: '622', name: 'Traktamente avdrag lunch' },
  { code: '623', name: 'Traktamente avdrag middag' },
];

export function getCategoryName(code: string): string {
  const category = MACONOMY_CATEGORIES.find(cat => cat.code === code);
  return category ? category.name : 'Okänd kategori';
}

export function formatCategoryOption(category: MaconomyCategory): string {
  return `${category.code} - ${category.name}`;
}

