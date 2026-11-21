import fs from 'fs';
import path from 'path';
import { Catalog } from '@/types';

const DB_PATH = path.join(process.cwd(), 'data', 'catalog.json');

export function getCatalog(): Catalog {
  if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initialData: Catalog = { movies: {}, categories: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

export function saveCatalog(catalog: Catalog): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(catalog, null, 2));
}
