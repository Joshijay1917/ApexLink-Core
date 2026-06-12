import jwt from 'jsonwebtoken'

export async function generateAccessToken(payload: any) {
    const accessSecret = process.env.JWT_SECRET
    const accessExpiry = process.env.ACCESS_JWT_EXPIRY
    if(!accessExpiry || !accessSecret) return null;

    return jwt.sign(payload, accessSecret as jwt.Secret, {expiresIn: accessExpiry} as jwt.SignOptions)
}

export async function generateRefreshToken(payload: any) {
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET
    const refreshExpiry = process.env.REFRESH_TOKEN_EXPIRY
    if(!refreshExpiry || !refreshSecret) return null;

    return jwt.sign(payload, refreshSecret as jwt.Secret, {expiresIn: refreshExpiry} as jwt.SignOptions)
}

export async function verifyRefreshToken(token: string) {
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET
    if(!refreshSecret) return null;

    return jwt.verify(token, refreshSecret)
}

export async function verifyAccessToken(token: string) {
    const accessSecret = process.env.JWT_SECRET
    if(!accessSecret) return null;

    return jwt.verify(token, accessSecret)
}