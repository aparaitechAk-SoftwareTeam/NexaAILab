import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { auth } from '../middleware/auth.js';
import { Admin, Course, Lead, Testimonial, Report, Faq, Batch } from '../db.js';

const r = Router();

r.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const match = await bcrypt.compare(password || '', admin.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const secret = process.env.JWT_SECRET || 'nexaailab_super_secure_jwt_secret_2026';
    const token = jwt.sign(
      { id: admin._id, email: admin.email, name: admin.name },
      secret,
      { expiresIn: '3d' }
    );
    res.json({
      token,
      user: { name: admin.name, email: admin.email }
    });
  } catch (err) {
    res.status(500).json({ message: 'Admin login failed', error: err.message });
  }
});

r.use(auth);

r.get('/stats', async (req, res) => {
  try {
    const [coursesCount, leadsCount, testimonialsCount, reportsCount, faqsCount, batchesCount] = await Promise.all([
      Course.countDocuments(),
      Lead.countDocuments(),
      Testimonial.countDocuments(),
      Report.countDocuments(),
      Faq.countDocuments(),
      Batch.countDocuments()
    ]);
    res.json({
      courses: coursesCount,
      leads: leadsCount,
      testimonials: testimonialsCount,
      reports: reportsCount,
      faqs: faqsCount,
      batches: batchesCount
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch admin stats' });
  }
});

const makeCrud = (Model) => ({
  list: async (req, res) => {
    try {
      const items = await Model.find();
      res.json(items);
    } catch (e) {
      res.status(500).json({ message: 'Failed to fetch items' });
    }
  },
  create: async (req, res) => {
    try {
      const item = await Model.create(req.body);
      res.status(201).json(item);
    } catch (e) {
      res.status(400).json({ message: 'Failed to create item', error: e.message });
    }
  },
  update: async (req, res) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!item) return res.status(404).json({ message: 'Item not found' });
      res.json(item);
    } catch (e) {
      res.status(400).json({ message: 'Failed to update item' });
    }
  },
  remove: async (req, res) => {
    try {
      await Model.findByIdAndDelete(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ message: 'Failed to delete item' });
    }
  }
});

const entities = [
  ['courses', Course],
  ['testimonials', Testimonial],
  ['reports', Report],
  ['faqs', Faq],
  ['leads', Lead],
  ['batches', Batch]
];

for (const [path, Model] of entities) {
  const handler = makeCrud(Model);
  r.get(`/${path}`, handler.list);
  r.post(`/${path}`, handler.create);
  r.put(`/${path}/:id`, handler.update);
  r.delete(`/${path}/:id`, handler.remove);
}

export default r;
