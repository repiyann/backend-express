import jwt from 'jsonwebtoken'

const JWT_SECRET_KEY = process.env.JWT_SECRET

function verifyToken(req, res, next) {
	// get token from header
	const token = req.headers['authorization']

	if (!token) {
		return res.status(403).json({ message: 'Token not provided' })
	}

	// verify token from header
	jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
		if (err) {
			return res.status(401).json({ message: 'Failed to authenticate token' })
		}
		req.userId = decoded.userId
		next()
	})
}

export default verifyToken
