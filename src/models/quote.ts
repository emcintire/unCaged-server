import mongoose, { Schema } from 'mongoose';
import type { Quote as QuoteType } from '../schemas';

const quoteMongooseSchema = new Schema<QuoteType>({
  quote: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255,
  },
  subquote: {
    type: String,
    required: false,
    minlength: 1,
    maxlength: 128,
  },
  createdOn: {
    type: Date,
    default: () => new Date(),
  },
});

export const Quote = mongoose.model<QuoteType>('Quote', quoteMongooseSchema);
