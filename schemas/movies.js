const { z } = require('zod')

// esquema para validar que los datos al crear una nueva peli sean los esperados
const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie tittle is required'
  }),
  year: z.number().int().positive().min(1900).max(2024),

  director: z.string({
    invalid_type_error: 'Movie director must be a string',
    required_error: 'Director is required'
  }),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(5),
  poster: z.string().url({
    message: 'Poster must be a valid url'
  }).endsWith('.png'),
  genre : z.array(
    z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Sci-Fi', 'Thriller', 'Crime']),
  { 
    invalid_type_error : 'Movie genre must be from the array ',
    required_error: 'Movie genre is required' 
  }
  ),
})

// Para validar la pelicula
function validateMovie (input) {
  return movieSchema.safeParse(input)
}

// Para validar parcialmente las peliculas y usarse en PATCH
function validatePartialMovie (input){
  return movieSchema.partial().safeParse(input)
}

module.exports = {
  validateMovie, validatePartialMovie
}