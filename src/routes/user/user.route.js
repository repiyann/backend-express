import express from 'express'
import verifyToken from '../../middleware/jwt.middleware.js'
import pool from '../../config/db.js'

const router = express.Router()

export default router