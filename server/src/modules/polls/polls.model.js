import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  count: { type: Number, default: 0 }
});

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  options: {
    type: [optionSchema],
    validate: {
      validator: (v) => v.length >= 2,
      message: 'Each question must have at least 2 options'
    }
  },
  isMandatory: { type: Boolean, default: true }
});

const pollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Poll title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: {
    type: [questionSchema],
    validate: {
      validator: (v) => v.length >= 1,
      message: 'Poll must have at least 1 question'
    }
  },
  shareCode: {
    type: String,
    unique: true,
    default: () => uuidv4().substring(0, 8)
  },
  isAnonymous: { type: Boolean, default: true },
  requiresAuth: { type: Boolean, default: false },
  expiresAt: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: false },
  totalResponses: { type: Number, default: 0 }
}, { timestamps: true });

// Virtual to check if poll is expired
pollSchema.virtual('isExpired').get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

pollSchema.set('toJSON', { virtuals: true });
pollSchema.set('toObject', { virtuals: true });

export default mongoose.model('Poll', pollSchema);
