import mongoose from 'mongoose';
const schema=new mongoose.Schema({title:String,image:String,url:String,isLatest:Boolean,active:{type:Boolean,default:true}},{timestamps:true});
export default mongoose.model('Report',schema);
