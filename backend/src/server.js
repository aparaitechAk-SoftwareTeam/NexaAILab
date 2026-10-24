import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import { Course, Testimonial, Report, Faq, Admin, Batch, Lead, setMongoMode } from './db.js';
import { courses, testimonials, reports, faqs, batches } from './seed/data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'NexaAI Lab Backend API',
    status: 'online',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);
// Also mount at root so requests omitting /api work seamlessly
app.use('/', publicRoutes);
app.use('/', adminRoutes);

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.all('/api/webhook', (req, res) => {
  res.json({ ok: true, received: true, timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

async function seed() {
  try {
    let storeData = null;
    try {
      const storePath = path.join(__dirname, '..', 'data', 'store.json');
      if (fs.existsSync(storePath)) {
        storeData = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
      }
    } catch (e) {
      console.warn('Could not read store.json for seeding:', e.message);
    }

    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      console.log('Seeding initial courses...');
      const coursesToSeed = (storeData?.courses?.length)
        ? storeData.courses.map(({ _id, ...rest }) => rest)
        : courses;
      await Course.insertMany(coursesToSeed);
    }

    const batchCount = await Batch.countDocuments();
    if (batchCount === 0) {
      console.log('Seeding initial batches and labs...');
      const batchesToSeed = (storeData?.batches?.length)
        ? storeData.batches.map(({ _id, ...rest }) => rest)
        : batches;
      await Batch.insertMany(batchesToSeed);
    }

    const testCount = await Testimonial.countDocuments();
    if (testCount === 0) {
      console.log('Seeding initial testimonials...');
      const testimonialsToSeed = (storeData?.testimonials?.length)
        ? storeData.testimonials.map(({ _id, ...rest }) => rest)
        : testimonials;
      await Testimonial.insertMany(testimonialsToSeed);
    }

    const reportCount = await Report.countDocuments();
    if (reportCount === 0) {
      console.log('Seeding initial reports...');
      const reportsToSeed = (storeData?.reports?.length)
        ? storeData.reports.map(({ _id, ...rest }) => rest)
        : reports;
      await Report.insertMany(reportsToSeed);
    }

    const faqCount = await Faq.countDocuments();
    if (faqCount === 0) {
      console.log('Seeding initial FAQs...');
      const faqsToSeed = (storeData?.faqs?.length)
        ? storeData.faqs.map(({ _id, ...rest }) => rest)
        : faqs;
      await Faq.insertMany(faqsToSeed);
    }

    const allLeads = await Lead.find();
    if (allLeads.length === 0 && storeData?.leads?.length) {
      console.log(`Seeding ${storeData.leads.length} initial leads from store.json...`);
      const leadsToSeed = storeData.leads.map(({ _id, ...rest }) => rest);
      await Lead.insertMany(leadsToSeed);
    } else {
      console.log(`✓ Synchronized ${allLeads.length} leads across cloud Atlas and local database.`);
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (!existingAdmin) {
      console.log(`Seeding default admin (${adminEmail})...`);
      const password = process.env.ADMIN_PASSWORD || 'Admin@123';
      const hash = await bcrypt.hash(password, 10);
      await Admin.create({
        name: 'Super Admin',
        email: adminEmail,
        password: hash
      });
    }
  } catch (err) {
    console.error('Error during seeding:', err);
  }
}

async function start() {
  const defaultAtlasUri = "mongodb://mailblast:Aparaitech2129@ac-rl6rdwo-shard-00-00.kmi9oku.mongodb.net:27017,ac-rl6rdwo-shard-00-01.kmi9oku.mongodb.net:27017,ac-rl6rdwo-shard-00-02.kmi9oku.mongodb.net:27017/nexaailab?ssl=true&replicaSet=atlas-3ebffw-shard-0&authSource=admin&appName=Cluster0";
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || defaultAtlasUri;
  try {
    console.log('Attempting MongoDB connection...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000, dbName: 'nexaailab' });
    console.log('✓ Connected to MongoDB');
    setMongoMode(true);
  } catch (err) {
    console.log('⚠ MongoDB connection failed:', err.message);
    console.log('⚠ Falling back to persistent JSON store.');
    setMongoMode(false);
  }

  await seed();

  const port = process.env.PORT || 5000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`=============================================`);
    console.log(`🚀 NexaAI Lab API running on port ${port} (0.0.0.0)`);
    console.log(`Admin credentials: admin@example.com / Admin@123`);
    console.log(`=============================================`);
  });
}

start();
