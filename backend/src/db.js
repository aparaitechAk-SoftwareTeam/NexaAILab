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

export const Course = {
  find: (filter = {}) => (useMongo ? CourseModel.find(filter) : jsonRepos.Course.find(filter)),
  findOne: (filter = {}) => (useMongo ? CourseModel.findOne(filter) : jsonRepos.Course.findOne(filter)),
  findById: (id) => (useMongo ? CourseModel.findById(id) : jsonRepos.Course.findById(id)),
  create: (data) => (useMongo ? CourseModel.create(data) : jsonRepos.Course.create(data)),
  insertMany: (items) => (useMongo ? CourseModel.insertMany(items) : jsonRepos.Course.insertMany(items)),
  findByIdAndUpdate: (id, update, opts) => (useMongo ? CourseModel.findByIdAndUpdate(id, update, opts) : jsonRepos.Course.findByIdAndUpdate(id, update, opts)),
  findByIdAndDelete: (id) => (useMongo ? CourseModel.findByIdAndDelete(id) : jsonRepos.Course.findByIdAndDelete(id)),
  countDocuments: (filter = {}) => (useMongo ? CourseModel.countDocuments(filter) : jsonRepos.Course.countDocuments(filter))
};

export const Lead = {
  find: (filter = {}) => (useMongo ? LeadModel.find(filter) : jsonRepos.Lead.find(filter)),
  findOne: (filter = {}) => (useMongo ? LeadModel.findOne(filter) : jsonRepos.Lead.findOne(filter)),
  findById: (id) => (useMongo ? LeadModel.findById(id) : jsonRepos.Lead.findById(id)),
  create: (data) => (useMongo ? LeadModel.create(data) : jsonRepos.Lead.create(data)),
  insertMany: (items) => (useMongo ? LeadModel.insertMany(items) : jsonRepos.Lead.insertMany(items)),
  findByIdAndUpdate: (id, update, opts) => (useMongo ? LeadModel.findByIdAndUpdate(id, update, opts) : jsonRepos.Lead.findByIdAndUpdate(id, update, opts)),
  findByIdAndDelete: (id) => (useMongo ? LeadModel.findByIdAndDelete(id) : jsonRepos.Lead.findByIdAndDelete(id)),
  countDocuments: (filter = {}) => (useMongo ? LeadModel.countDocuments(filter) : jsonRepos.Lead.countDocuments(filter))
};

export const Testimonial = {
  find: (filter = {}) => (useMongo ? TestimonialModel.find(filter) : jsonRepos.Testimonial.find(filter)),
  findOne: (filter = {}) => (useMongo ? TestimonialModel.findOne(filter) : jsonRepos.Testimonial.findOne(filter)),
  findById: (id) => (useMongo ? TestimonialModel.findById(id) : jsonRepos.Testimonial.findById(id)),
  create: (data) => (useMongo ? TestimonialModel.create(data) : jsonRepos.Testimonial.create(data)),
  insertMany: (items) => (useMongo ? TestimonialModel.insertMany(items) : jsonRepos.Testimonial.insertMany(items)),
  findByIdAndUpdate: (id, update, opts) => (useMongo ? TestimonialModel.findByIdAndUpdate(id, update, opts) : jsonRepos.Testimonial.findByIdAndUpdate(id, update, opts)),
  findByIdAndDelete: (id) => (useMongo ? TestimonialModel.findByIdAndDelete(id) : jsonRepos.Testimonial.findByIdAndDelete(id)),
  countDocuments: (filter = {}) => (useMongo ? TestimonialModel.countDocuments(filter) : jsonRepos.Testimonial.countDocuments(filter))
};

export const Report = {
  find: (filter = {}) => (useMongo ? ReportModel.find(filter) : jsonRepos.Report.find(filter)),
  findOne: (filter = {}) => (useMongo ? ReportModel.findOne(filter) : jsonRepos.Report.findOne(filter)),
  findById: (id) => (useMongo ? ReportModel.findById(id) : jsonRepos.Report.findById(id)),
  create: (data) => (useMongo ? ReportModel.create(data) : jsonRepos.Report.create(data)),
  insertMany: (items) => (useMongo ? ReportModel.insertMany(items) : jsonRepos.Report.insertMany(items)),
  findByIdAndUpdate: (id, update, opts) => (useMongo ? ReportModel.findByIdAndUpdate(id, update, opts) : jsonRepos.Report.findByIdAndUpdate(id, update, opts)),
  findByIdAndDelete: (id) => (useMongo ? ReportModel.findByIdAndDelete(id) : jsonRepos.Report.findByIdAndDelete(id)),
  countDocuments: (filter = {}) => (useMongo ? ReportModel.countDocuments(filter) : jsonRepos.Report.countDocuments(filter))
};

export const Faq = {
  find: (filter = {}) => (useMongo ? FaqModel.find(filter) : jsonRepos.Faq.find(filter)),
  findOne: (filter = {}) => (useMongo ? FaqModel.findOne(filter) : jsonRepos.Faq.findOne(filter)),
  findById: (id) => (useMongo ? FaqModel.findById(id) : jsonRepos.Faq.findById(id)),
  create: (data) => (useMongo ? FaqModel.create(data) : jsonRepos.Faq.create(data)),
  insertMany: (items) => (useMongo ? FaqModel.insertMany(items) : jsonRepos.Faq.insertMany(items)),
  findByIdAndUpdate: (id, update, opts) => (useMongo ? FaqModel.findByIdAndUpdate(id, update, opts) : jsonRepos.Faq.findByIdAndUpdate(id, update, opts)),
  findByIdAndDelete: (id) => (useMongo ? FaqModel.findByIdAndDelete(id) : jsonRepos.Faq.findByIdAndDelete(id)),
  countDocuments: (filter = {}) => (useMongo ? FaqModel.countDocuments(filter) : jsonRepos.Faq.countDocuments(filter))
};

export const Admin = {
  find: (filter = {}) => (useMongo ? AdminModel.find(filter) : jsonRepos.Admin.find(filter)),
  findOne: (filter = {}) => (useMongo ? AdminModel.findOne(filter) : jsonRepos.Admin.findOne(filter)),
  findById: (id) => (useMongo ? AdminModel.findById(id) : jsonRepos.Admin.findById(id)),
  create: (data) => (useMongo ? AdminModel.create(data) : jsonRepos.Admin.create(data)),
  countDocuments: (filter = {}) => (useMongo ? AdminModel.countDocuments(filter) : jsonRepos.Admin.countDocuments(filter))
};

export const Batch = {
  find: (filter = {}) => (useMongo ? BatchModel.find(filter) : jsonRepos.Batch.find(filter)),
  findOne: (filter = {}) => (useMongo ? BatchModel.findOne(filter) : jsonRepos.Batch.findOne(filter)),
  findById: (id) => (useMongo ? BatchModel.findById(id) : jsonRepos.Batch.findById(id)),
  create: (data) => (useMongo ? BatchModel.create(data) : jsonRepos.Batch.create(data)),
  insertMany: (items) => (useMongo ? BatchModel.insertMany(items) : jsonRepos.Batch.insertMany(items)),
  findByIdAndUpdate: (id, update, opts) => (useMongo ? BatchModel.findByIdAndUpdate(id, update, opts) : jsonRepos.Batch.findByIdAndUpdate(id, update, opts)),
  findByIdAndDelete: (id) => (useMongo ? BatchModel.findByIdAndDelete(id) : jsonRepos.Batch.findByIdAndDelete(id)),
  countDocuments: (filter = {}) => (useMongo ? BatchModel.countDocuments(filter) : jsonRepos.Batch.countDocuments(filter))
};

ensureDataDir();
