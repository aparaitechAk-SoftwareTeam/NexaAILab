import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import { Course, Testimonial, Report, Faq, Admin, Batch, setMongoMode } from './db.js';
import { courses, testimonials, reports, faqs, batches } from './seed/data.js';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

async function seed() {
  try {
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      console.log('Seeding initial courses...');
      await Course.insertMany(courses);
    }

    const batchCount = await Batch.countDocuments();
    if (batchCount === 0) {
      console.log('Seeding initial batches and labs...');
      await Batch.insertMany(batches);
    }

    const testCount = await Testimonial.countDocuments();
    if (testCount === 0) {
      console.log('Seeding initial testimonials...');
      await Testimonial.insertMany(testimonials);
    }

    const reportCount = await Report.countDocuments();
    if (reportCount === 0) {
      console.log('Seeding initial reports...');
      await Report.insertMany(reports);
    }

    const faqCount = await Faq.countDocuments();
    if (faqCount === 0) {
      console.log('Seeding initial FAQs...');
      await Faq.insertMany(faqs);
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
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexaailab';
  try {
    console.log('Attempting MongoDB connection...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 1500 });
    console.log('✓ Connected to MongoDB');
    setMongoMode(true);
  } catch (err) {
    console.log('⚠ MongoDB is offline or unavailable. Using persistent JSON store fallback.');
    setMongoMode(false);
  }

  await seed();

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`=============================================`);
    console.log(`🚀 NexaAI Lab API running on http://localhost:${port}`);
    console.log(`Admin credentials: admin@example.com / Admin@123`);
    console.log(`=============================================`);
  });
}

start();
