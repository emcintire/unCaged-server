export type CreateMovieDto = {
  title: string;
  director: string;
  description: string;
  date: Date;
  rating: number;
  runtime: number;
  img: string;
  year: number;
  genre: string[];
  genres: string[];
};
