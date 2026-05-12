import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src/data/db.json');

// Initial data structure
const initialData = {
  products: [
    { id: '1', name: 'Emerald Velvet L-Sofa', category: 'sofas', img: '/images/sofa_hero.png', price: 'Premium', desc: 'Exquisite comfort in emerald green velvet.', isNewArrival: true, isBestSeller: false },
    { id: '2', name: 'Royal Oak 6-Seater', category: 'wooden', img: '/images/dining_hero.png', price: 'Classic', desc: 'Solid oak dining for the whole family.', isNewArrival: false, isBestSeller: true },
    { id: '3', name: 'Crystal Glass Table', category: 'glass', img: '/images/glass_dining_hero.png', price: 'Modern', desc: 'Sleek glass top with a metallic base.', isNewArrival: true, isBestSeller: true },
  ],
  categories: [
    { id: 'sofas', name: 'Premium Sofas' },
    { id: 'wooden', name: 'Wooden Dining' },
    { id: 'glass', name: 'Glass Dining' },
    { id: 'custom', name: 'Custom Furniture' },
  ],
  settings: {
    password: 'bhuviaarya'
  }
};

async function ensureDb() {
  try {
    await fs.access(DB_PATH);
  } catch {
    const dir = path.dirname(DB_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2));
  }
}

export async function getDb() {
  await ensureDb();
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function saveDb(data: any) {
  await ensureDb();
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}
