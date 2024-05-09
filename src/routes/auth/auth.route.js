import express from 'express'
import rateLimit from 'express-rate-limit'
import { register, login, logout, getUser } from '../../controllers/auth/auth.controller.js'
import verifyToken from '../../middleware/jwt.middleware.js'
import pool from '../../config/db.js'

const router = express.Router()

// attempts limiter untuk keamanan penyerangan berkali-kali
const attemptsLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: { message: 'Too many attempts. Please try again later.' },
	standardHeaders: true,
	legacyHeaders: false
})

// simple route, dont need verify but only need database
router.post('/register', attemptsLimiter, async (req, res, next) => await register(req, res, pool, next))
router.post('/login', attemptsLimiter, async (req, res, next) => await login(req, res, pool, next))
router.get('/get-cookie', (req, res) => {
	const token = req.cookies.token
	res.json({ token })
})
router.get('/getUser', verifyToken, async (req, res) => await getUser(req, res, pool))

// protected route for verify token, but dont need database
router.post('/logout', verifyToken, async (req, res) => await logout(req, res))

router.get('/protected', verifyToken, (req, res) => {
	res.json({ message: 'This is a protected route' })
})

export default router
