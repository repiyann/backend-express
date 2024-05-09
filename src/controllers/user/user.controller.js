import User from '../models/User.js'

async function editUser(req, res) {
	const { userId } = req.params
	const { name, email } = req.body

	try {
		const updatedUser = await User.findByIdAndUpdate(userId, { name, email }, { new: true })

		if (!updatedUser) {
			return res.status(404).json({ message: 'User not found' })
		}

		res.status(200).json({ message: 'User details updated successfully', user: updatedUser })
	} catch (error) {
		res.status(500).json({ message: 'Internal server error', error: error.message })
	}
}

async function deleteUser(req, res) {
	const { userId } = req.params

	try {
		const deletedUser = await User.findByIdAndDelete(userId)

		if (!deletedUser) {
			return res.status(404).json({ message: 'User not found' })
		}

		res.status(200).json({ message: 'User deleted successfully', user: deletedUser })
	} catch (error) {
		res.status(500).json({ message: 'Internal server error', error: error.message })
	}
}

export { editUser, deleteUser }
