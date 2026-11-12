import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../../data');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export class JsonCollection {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    ensureDir();
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]), 'utf-8');
    }
  }

  _read() {
    try {
      if (!fs.existsSync(this.filePath)) return [];
      const content = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(content || '[]');
    } catch (e) {
      return [];
    }
  }

  _write(data) {
    ensureDir();
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async create(doc) {
    const records = this._read();
    const newDoc = {
      _id: doc._id || crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    };
    records.push(newDoc);
    this._write(records);
    return newDoc;
  }

  async insertMany(docs) {
    const records = this._read();
    const created = docs.map(d => ({
      _id: d._id || crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...d
    }));
    records.push(...created);
    this._write(records);
    return created;
  }

  find(query = {}) {
    const records = this._read();
    let filtered = records.filter(item => {
      for (const [key, val] of Object.entries(query)) {
        if (key === '_id' && item._id !== val && item._id !== String(val)) return false;
        if (key === 'userId' && item.userId !== val && item.userId !== String(val)) return false;
        if (key === 'auditId' && item.auditId !== val && item.auditId !== String(val)) return false;
        if (key === 'severity' && item.severity !== val) return false;
        if (typeof val === 'object' && val !== null) {
          if (val.$in && !val.$in.includes(item[key])) return false;
        } else if (item[key] !== val && key !== '_id' && key !== 'userId' && key !== 'auditId') {
          return false;
        }
      }
      return true;
    });

    const chain = {
      _data: filtered,
      sort(criteria) {
        if (typeof criteria === 'object') {
          const [field, order] = Object.entries(criteria)[0] || [];
          if (field) {
            chain._data.sort((a, b) => {
              const valA = a[field];
              const valB = b[field];
              if (order === -1 || order === 'desc') {
                return valB > valA ? 1 : valB < valA ? -1 : 0;
              }
              return valA > valB ? 1 : valA < valB ? -1 : 0;
            });
          }
        }
        return chain;
      },
      limit(n) {
        chain._data = chain._data.slice(0, n);
        return chain;
      },
      select(fields) {
        return chain;
      },
      lean() {
        return chain;
      },
      async exec() {
        return chain._data;
      },
      then(resolve, reject) {
        return Promise.resolve(chain._data).then(resolve, reject);
      }
    };

    return chain;
  }

  async findOne(query) {
    const results = await this.find(query);
    return results[0] || null;
  }

  async findById(id) {
    const records = this._read();
    const strId = String(id);
    return records.find(r => String(r._id) === strId) || null;
  }

  async findByIdAndDelete(id) {
    const records = this._read();
    const strId = String(id);
    const index = records.findIndex(r => String(r._id) === strId);
    if (index !== -1) {
      const removed = records.splice(index, 1)[0];
      this._write(records);
      return removed;
    }
    return null;
  }

  async deleteMany(query = {}) {
    const records = this._read();
    const remaining = records.filter(item => {
      for (const [key, val] of Object.entries(query)) {
        if (key === 'auditId' && (item.auditId === val || item.auditId === String(val))) return false;
        if (item[key] === val) return false;
      }
      return true;
    });
    const deletedCount = records.length - remaining.length;
    this._write(remaining);
    return { deletedCount };
  }

  async countDocuments(query = {}) {
    const results = await this.find(query);
    return results.length;
  }

  async updateOne(query, update) {
    const records = this._read();
    const item = records.find(r => {
      for (const [k, v] of Object.entries(query)) {
        if (String(r[k]) !== String(v)) return false;
      }
      return true;
    });
    if (item) {
      const payload = update.$set ? update.$set : update;
      Object.assign(item, payload, { updatedAt: new Date().toISOString() });
      this._write(records);
      return { modifiedCount: 1 };
    }
    return { modifiedCount: 0 };
  }
}

