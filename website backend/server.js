require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')

const { logger } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')

// environment variables
const PORT = process.env.PORT || 3500

//middleware
app.use(logger)
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

// serve all static files from the public folder, atm just style.css
app.use('/', express.static(path.join(__dirname, 'public')))

//routes
app.use('/', require('./routes/root')) // base url
app.use('/recipe', require('./routes/recipes'))
app.use('/mealplan', require('./routes/mealplans'))
app.use('/auth', require('./routes/auth'))
app.use('/user', require('./routes/users'))
app.use('/test', require('./test/testroute'))

//404 after all other routes
app.all('*', (req, res) => {
  res.status(404)
  // if (req.accepts('html')) {res.sendFile(path.join(__dirname, 'views', '404.html'))} 
  if (req.accepts('json')) {res.json({ message: '404 Not Found' })} 
  else {res.type('txt').send('404 Not Found')}
})

//log errors
app.use(errorHandler)

// listen for requests
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
