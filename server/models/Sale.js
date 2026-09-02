import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['service', 'product'],
    required: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'type'
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  }
}, { _id: false });

const saleSchema = new mongoose.Schema({
  items: [saleItemSchema],
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'mobile', 'other'],
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  barber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barber'
  },
  handledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

saleSchema.index({ createdAt: -1 });
saleSchema.index({ handledBy: 1, createdAt: -1 });

export default mongoose.model('Sale', saleSchema);