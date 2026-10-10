import mongoose from 'mongoose';
const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, default: '+91' },
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  city: { type: String, default: 'Pune (Hinjawadi)' },
  course: { type: String, default: 'General Inquiry' },
  source: { type: String, default: 'Website Form' },
  status: { type: String, default: 'New' },
  notes: { type: String, default: '' },
  preferredSlot: { type: String },
  date: { type: String },
  time: { type: String },
  passId: { type: String },
  background: { type: String }
}, { timestamps: true, strict: false });
export default mongoose.model('Lead', leadSchema);

