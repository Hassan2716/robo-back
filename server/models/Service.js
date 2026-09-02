import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 15
  },
  barbers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barber'
  }],
  image: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['haircut', 'beard', 'styling', 'treatment', 'package'],
    default: 'haircut'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

serviceSchema.index({ barbers: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ category: 1 });

export default mongoose.model('Service', serviceSchema);