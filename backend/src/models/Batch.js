import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  title: { type: String, required: true },
  courseId: { type: String },
  type: { type: String, default: 'Classroom Course' }, // 'Classroom Course' or 'AI & Robotics Lab'
  city: { type: String, required: true }, // e.g. 'Pune (Hinjawadi)', 'Bangalore', 'Gurgaon', 'Noida', 'Interactive Live Online'
  locationDetail: { type: String }, // e.g. 'Hinjawadi Phase 1, High-Tech Campus'
  mode: { type: String, default: 'Classroom Bootcamp Weekdays' }, // 'Classroom Bootcamp Weekdays', 'Weekend Live', 'Hands-on Hardware Lab', etc.
  date: { type: String, required: true }, // e.g. '10th Jan 2027'
  month: { type: String, default: 'January' },
  time: { type: String, required: true }, // e.g. '9:30 AM - 1:30 PM'
  seatsLeft: { type: Number, default: 10 },
  totalSeats: { type: Number, default: 25 },
  partner: { type: String, default: 'NASSCOM FutureSkills Prime & AI Industry Council' },
  duration: { type: String, default: '6–8 Months' },
  fee: { type: String, default: '₹55,000' },
  workstation: { type: String },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Batch', batchSchema);
