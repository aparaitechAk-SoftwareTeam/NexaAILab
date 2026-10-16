import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import CourseModel from './models/Course.js';
import LeadModel from './models/Lead.js';
import TestimonialModel from './models/Testimonial.js';
import ReportModel from './models/Report.js';
import FaqModel from './models/Faq.js';
import AdminModel from './models/Admin.js';
import BatchModel from './models/Batch.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

let useMongo = false;
let store = {
  courses: [],
  batches: [],
  leads: [],
  testimonials: [],
  reports: [],
  faqs: [],
  admins: []
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(STORE_PATH)) {
    try {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      store = { ...store, ...JSON.parse(raw) };
    } catch (e) {
      console.warn('Could not parse existing store.json, using fresh store.');
    }
  } else {
    persist();
  }
}

function persist() {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write store.json:', err);
  }
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

function createJsonRepo(collectionName) {
  return {
    async find(filter = {}) {
      let items = [...(store[collectionName] || [])];
      if (filter && typeof filter === 'object') {
        items = items.filter(item => {
          for (const key of Object.keys(filter)) {
            if (filter[key] !== undefined && item[key] !== filter[key]) {
              return false;
            }
          }
          return true;
        });
      }
      return items;
    },
    async findOne(filter = {}) {
      const items = await this.find(filter);
      return items[0] || null;
    },
    async findById(id) {
      const items = store[collectionName] || [];
      return items.find(x => String(x._id) === String(id)) || null;
    },
    async create(data) {
      const now = new Date().toISOString();
      const doc = {
        _id: genId(),
        ...data,
        createdAt: now,
        updatedAt: now
      };
      if (!store[collectionName]) store[collectionName] = [];
      store[collectionName].unshift(doc);
      persist();
      return doc;
    },
    async insertMany(items) {
      const created = [];
      for (const item of items) {
        created.push(await this.create(item));
      }
      return created;
    },
    async findByIdAndUpdate(id, update, options = {}) {
      const items = store[collectionName] || [];
      const idx = items.findIndex(x => String(x._id) === String(id));
      if (idx === -1) return null;
      items[idx] = {
        ...items[idx],
        ...update,
        updatedAt: new Date().toISOString()
      };
      persist();
      return items[idx];
    },
    async findByIdAndDelete(id) {
      const items = store[collectionName] || [];
      const idx = items.findIndex(x => String(x._id) === String(id));
      if (idx === -1) return null;
      const [removed] = items.splice(idx, 1);
      persist();
      return removed;
    },
    async countDocuments(filter = {}) {
      const items = await this.find(filter);
      return items.length;
    }
  };
}

const jsonRepos = {
  Course: createJsonRepo('courses'),
  Batch: createJsonRepo('batches'),
  Lead: createJsonRepo('leads'),
  Testimonial: createJsonRepo('testimonials'),
  Report: createJsonRepo('reports'),
  Faq: createJsonRepo('faqs'),
  Admin: createJsonRepo('admins')
};

export function setMongoMode(enabled) {
  useMongo = enabled;
}

export function isMongoActive() {
  return useMongo;
}

function makeRepo(Model, jsonRepo) {
  return {
    find: (filter = {}) => (useMongo ? Model.find(filter) : jsonRepo.find(filter)),
    findOne: (filter = {}) => (useMongo ? Model.findOne(filter) : jsonRepo.findOne(filter)),
    findById: (id) => {
      if (useMongo) {
        return mongoose.Types.ObjectId.isValid(id) ? Model.findById(id) : Model.findOne({ _id: id });
      }
      return jsonRepo.findById(id);
    },
    create: (data) => (useMongo ? Model.create(data) : jsonRepo.create(data)),
    insertMany: (items) => (useMongo ? Model.insertMany(items) : jsonRepo.insertMany(items)),
    findByIdAndUpdate: (id, update, opts = { new: true }) => {
      if (useMongo) {
        return mongoose.Types.ObjectId.isValid(id)
          ? Model.findByIdAndUpdate(id, update, opts)
          : Model.findOneAndUpdate({ _id: id }, update, opts);
      }
      return jsonRepo.findByIdAndUpdate(id, update, opts);
    },
    findByIdAndDelete: (id) => {
      if (useMongo) {
        return mongoose.Types.ObjectId.isValid(id)
          ? Model.findByIdAndDelete(id)
          : Model.findOneAndDelete({ _id: id });
      }
      return jsonRepo.findByIdAndDelete(id);
    },
    countDocuments: (filter = {}) => (useMongo ? Model.countDocuments(filter) : jsonRepo.countDocuments(filter))
  };
}

export const Course = makeRepo(CourseModel, jsonRepos.Course);
export const Lead = makeRepo(LeadModel, jsonRepos.Lead);
export const Testimonial = makeRepo(TestimonialModel, jsonRepos.Testimonial);
export const Report = makeRepo(ReportModel, jsonRepos.Report);
export const Faq = makeRepo(FaqModel, jsonRepos.Faq);
export const Admin = makeRepo(AdminModel, jsonRepos.Admin);
export const Batch = makeRepo(BatchModel, jsonRepos.Batch);

ensureDataDir();
