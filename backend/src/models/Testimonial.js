import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:String,role:String,company:String,image:String,placedAt:String,hike:String,text:String,tags:[String],active:{type:Boolean,default:true}},{timestamps:true});
export default mongoose.model('Testimonial',schema);
