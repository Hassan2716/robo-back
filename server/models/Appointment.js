import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  barber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barber',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  },
  totalPrice: {
    type: Number,
    required: true
  },
  isWalkIn: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

appointmentSchema.index({ barber: 1, date: 1, time: 1 }, { unique: true });
appointmentSchema.index({ customer: 1, date: -1 });
appointmentSchema.index({ date: 1, status: 1 });
appointmentSchema.index({ status: 1 });

export default mongoose.model('Appointment', appointmentSchema);