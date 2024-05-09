import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// salt round adalah angka untuk mengacak bcrypt. + better, - bad
// sama kaya salt round bedanya make string
const SALT_ROUNDS = process.env.SALT_ROUND
const JWT_SECRET_KEY = process.env.JWT_SECRET

async function register(req, res, pool, next) {
	try {
		const { email, password, telepon, confirmPassword } = req.body

		if (password.length < 8) {
			return res.status(400).json({ message: 'Password should be at least 8 characters long' })
		}

		if (password !== confirmPassword) {
			return res.status(400).json({ message: 'Password and Confirm Password do not match' })
		}

		const [checkEmailResult] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
		if (checkEmailResult.length > 0) {
			return res.status(400).json({ message: 'Email already exists' })
		}

		const hashedPassword = await bcrypt.hash(password, parseInt(SALT_ROUNDS))

		await pool.query('INSERT INTO users (email, password, telepon) VALUES (?, ?, ?)', [email, hashedPassword, telepon])

		return res.status(201).json({ message: 'Registration successful' })
	} catch (err) {
		console.error(err.stack)
		res.status(500).json({ message: 'Internal Server Error' })
	}
}

async function login(req, res, pool, next) {
	try {
		const { email, password } = req.body

		const [validateUserResult] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
		if (validateUserResult.length === 0) {
			return res.status(401).json({ message: 'Invalid username or password' })
		}

		const user = validateUserResult[0]

		const isPasswordValid = await bcrypt.compare(password, user.password)
		if (!isPasswordValid) {
			return res.status(401).json({ message: 'Invalid username or password' })
		}

		// initiate jwt to store it in cookie that expires in 1 hour
		const token = jwt.sign({ userId: user.id }, JWT_SECRET_KEY, { expiresIn: '1h' })
		res.cookie('token', token, { httpOnly: true })

		return res.status(200).json({ message: 'Login successful' })
	} catch (err) {
		console.error(err.stack)
		res.status(500).json({ message: 'Internal Server Error' })
	}
}

async function getUser(req, res, pool) {
	try {
		// Mendapatkan token dari request header
		const token = req.headers['authorization']
		if (!token) {
			return res.status(401).json({ message: 'Unauthorized' })
		}

		// Verifikasi token
		const decoded = jwt.verify(token, JWT_SECRET_KEY)
		if (!decoded) {
			return res.status(401).json({ message: 'Invalid token' })
		}

		// Mendapatkan data pengguna berdasarkan userId dari token
		const user = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.userId])

		// Mengembalikan data pengguna
		return res.status(200).json({ user: user[0] })
	} catch (err) {
		console.error(err.stack)
		return res.status(500).json({ message: 'Internal Server Error' })
	}
}

async function logout(req, res) {
	try {
		// get token from headers
		const token = req.headers['authorization']
		if (!token) {
			return res.status(401).json({ message: 'Unauthorized' })
		}

		// verify token and remove token from cookie for logout logic
		const decoded = jwt.verify(token, JWT_SECRET_KEY)
		if (!decoded) {
			return res.status(401).json({ message: 'Invalid token' })
		}

		res.clearCookie('token')

		res.status(200).json({ message: 'Logout successful' })
	} catch (error) {
		res.status(401).json({ message: 'Unauthorized' })
	}
}

export { register, login, getUser, logout }
