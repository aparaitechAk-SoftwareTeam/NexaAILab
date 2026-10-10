import mongoose from 'mongoose';
const schema=new mongoose.Schema({question:String,answer:String,active:{type:Boolean,default:true},order:{type:Number,default:0}},{timestamps:true});
export default mongoose.model('Faq',schema);
