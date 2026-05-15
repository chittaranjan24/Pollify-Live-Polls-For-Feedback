import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedOptionIndex: { type: Number, required: true }
});

const responseSchema = new mongoose.Schema({
  poll: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true
  },
  respondent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null  // null = anonymous
  },
  answers: [answerSchema],
  submittedAt: { type: Date, default: Date.now },
  ipAddress: { type: String }  // For basic duplicate prevention on anonymous polls
}, { timestamps: true });

export default mongoose.model('Response', responseSchema);