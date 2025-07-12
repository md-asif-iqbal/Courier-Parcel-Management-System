import mongoose from 'mongoose';

const parcelSchema = new mongoose.Schema({
  customer: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  pickupAddress: String,
  deliveryAddress: String,
  size: String,
  cod: Boolean,
  status: { type: String, default: 'Booked', enum: ['Booked','Picked Up','In Transit','Delivered','Failed'] },
  agent: { type: mongoose.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Parcel', parcelSchema);