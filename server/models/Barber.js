import mongoose from 'mongoose';

const workingHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  },
  isWorking: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: String,
    default: '09:00'
  },
  endTime: {
    type: String,
    default: '18:00'
  },
  breakStart: {
    type: String
  },
  breakEnd: {
    type: String
  }
}, { _id: false });

const barberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  photo: {
    type: String,
    default: ''
  },
  specialties: [{
    type: String,
    trim: true
  }],
  experience: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    default: ''
  },
  workingHours: [workingHoursSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

barberSchema.index({ specialties: 1 });
barberSchema.index({ isActive: 1 });

export default mongoose.model('Barber', barberSchema);