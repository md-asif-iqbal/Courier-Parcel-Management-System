// backend/controllers/parcel.js
import Parcel from '../models/parcel.js';
import { io } from '../server.js';

/** Customer books a parcel */
export const bookParcel = async (req, res) => {
  const parcel = await new Parcel({
    ...req.body,
    customer: req.user._id
  }).save();

  // Emit to **this** customer’s socket room
  io.to(req.user._id.toString()).emit('parcelBooked', parcel);

  // Also notify agents globally if you want
  io.emit('parcelAssigned', parcel);

  res.status(201).json(parcel);
};

/** Get parcels for the logged-in customer */
export const getUserParcels = async (req, res) => {
  const parcels = await Parcel.find({ customer: req.user._id });
  res.json(parcels);
};

/** Agent’s assigned parcels */
export const getAssignedParcels = async (req, res) => {
  const parcels = await Parcel.find({ agent: req.user._id });
  res.json(parcels);
};

/** Single parcel by ID */
export const getParcel = async (req, res) => {
  const parcel = await Parcel.findById(req.params.id);
  res.json(parcel);
};

export const updateStatus = async (req, res) => {
    const { status } = req.body;
    const parcel = await Parcel.findById(req.params.id);
    if (!parcel) return res.status(404).json({ message: 'Parcel not found' });
  
    parcel.status = status;
    await parcel.save();
  
    // Emit the update to the specific customer’s room
    io.to(parcel.customer.toString()).emit('parcelStatusUpdated', {
      statusKey: status,
      count: await Parcel.countDocuments({ status })
    });
  
    res.json(parcel);
  };

/** Summary stats for dashboard */
export const getStats = async (req, res) => {
  const total     = await Parcel.countDocuments();
  const inTransit = await Parcel.countDocuments({ status: 'In Transit' });
  const delivered = await Parcel.countDocuments({ status: 'Delivered' });
  res.json({ total, inTransit, delivered });
};
