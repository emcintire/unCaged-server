import mongoose, { Schema, Document, Types } from 'mongoose';
import type { MovieData } from '../schemas/movieSchema';

export type MovieDocument = MovieData & Document & {
  _id: Types.ObjectId;
};

const movieMongooseSchema = new Schema<MovieDocument>({
  title: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 100,
    unique: true,
  },
  director: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 512,
  },
  genres: {
    type: [String],
    minlength: 1,
    maxlength: 100,
  },
  runtime: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 100,
  },
  rating: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 100,
  },
  date: { 
    type: String, 
    minlength: 1, 
    maxlength: 100, 
    required: true 
  },
  img: {
    type: String,
    default: '',
  },
  avgRating: {
    type: Number,
    max: 10,
  },
  ratings: [
    {
      id: String,
      rating: Number,
    },
  ],
});

export const Movie = mongoose.model<MovieDocument>('Movie', movieMongooseSchema);
