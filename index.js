import express from 'express'
import compression from 'compression'
import cors from 'cors'
import 'dotenv/config'
import helmet from 'helmet'
import authRouter from './src/routes/auth/auth.route.js'

// initiate expressjs and port
const app = express()
const PORT = process.env.PORT

function createCorsMiddleware(whitelist) {
	return (req, res, next) => {
		res.header('Access-Control-Allow-Origin', whitelist || 'http://localhost:5173')
		res.header('Access-Control-Allow-Credentials', 'true')
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
		res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')

		next()
	}
}
const corsMiddleware = createCorsMiddleware('http://localhost:5173')

// initiate compression for make backend smaller and faster
app.use(compression())
// initiate express to use json and body parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// initiate cors for one time connection with frontend
app.use(corsMiddleware)
// initiate helmet for safety purposes of backend
app.use(helmet())

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack)
	res.status(500).send('Something broke!')
})

// route untuk authentication
app.use('/auth', authRouter)

// menjalankan backend expressjs
app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}`)
})
