const express = require('express')
const movies = require('./movies.json')
const crypto = require('node:crypto')
const cors = require('cors')

const { validateMovie, validatePartialMovie } = require('./schemas/movies.js')

const app = express()
app.disable('x-powered-by') // deshabilita el header que indica version de express
const PORT = process.env.PORT ?? 3000

app.use(express.json())

app.use(cors({
  origin: (origin, callcack) => {
    // lista de origenes CORS aceptados
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhots:3000',
      'https://movies.com'
    ]
    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
      return callcack(null, true)
    }
    return callcack(new Error('Not allowed by CORS'))
  }
}))

app.get('/', (req, res) => {
  res.json({ message: 'Hola mundo' })
})

//  Recuperar peliculas por id
app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)
  if (movie) return res.json(movie)

  res.status(404).json({ message: 'No se encuentra la pelicula' })
})

// Recuperar peliculas por genero
app.get('/movies', (req, res) => {
  const { genre } = req.query
  if (genre) {
    const filteredMovies = movies.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    return res.json(filteredMovies)
  }
  res.json(movies)
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data // el resto de los datos ya validados en el esquema
  }

  movies.push(newMovie)

  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const { id } = req.params
  const result = validatePartialMovie(req.body)

  if (!result.success) {
    res.status(400).json({ error: JSON.parse(result.error.message) })
  }
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Could not find the movie' })
  }

  // luego de las validaciones actualizamos
  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie
  console.log(movieIndex)
  return res.json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Unable to find movie' })
  }
  movies.splice(movieIndex, 1)
  return res.json({ message: 'Movie deleted' })
})

// app.options('/movies/:id ', (req, res) => {
//   const origin = req.header('origin')

//   if (ACCEPTED_ORIGINS.includes(origin) || !origin){
//     res.header('Access-Control-Allow-Origin', origin)
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE')
//   }
//   res.send(200)
// })

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto http://localhost:${PORT}`)
})
