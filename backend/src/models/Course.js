import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: String,
  hours: String,
  duration: String,
  badge: String,
  description: String,
  category: { type: String, default: 'Data Science & Analytics' },
  fee: { type: String, default: '₹55,000' }, // Offer amount / Current fee
  originalFee: { type: String, default: '₹68,000' }, // Actual amount / M.R.P.
  saveAmount: { type: String, default: 'Save ₹13,000' }, // Offer savings badge
  emi: { type: String, default: '₹4,583/mo' },
  monthlyEmi: { type: String, default: '₹4,583/mo' },
  emiMonths: { type: [Number], default: [3, 6, 9, 12] },
  rating: { type: String, default: '4.9' },
  reviewsCount: { type: String, default: '2,840' },
  partner: { type: String, default: 'NASSCOM FutureSkills Prime & AI Industry Council' },
  syllabus: [String],
  tools: [String],
  projects: [String],
  batches: [{
    city: String,
    date: String,
    mode: String,
    time: String,
    seatsLeft: Number
  }],
  active: { type: Boolean, default: true }
}, { timestamps: true, strict: false });

export default mongoose.model('Course', courseSchema);
