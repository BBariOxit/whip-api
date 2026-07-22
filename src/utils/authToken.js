import { userModel } from '~/models/userModel'

const resolveUser = async (decodedToken) => {
  if (!decodedToken?._id) return null

  const user = await userModel.findOneById(decodedToken._id)
  if (!user?.isActive) return null
  if ((user.tokenVersion || 0) !== (decodedToken.tokenVersion || 0)) return null

  return {
    ...decodedToken,
    email: user.email,
    avatar: user.avatar,
    displayName: user.displayName
  }
}

export const authToken = { resolveUser }
