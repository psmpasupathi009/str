import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function createOTP(email: string, type: 'SIGNUP' | 'FORGOT_PASSWORD') {
  const code = generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  // Delete old OTPs for this email and type
  await prisma.otp.deleteMany({
    where: {
      email,
      type,
    },
  })

  return prisma.otp.create({
    data: {
      email,
      code,
      type,
      expiresAt,
    },
  })
}

export async function verifyOTP(email: string, code: string, type: 'SIGNUP' | 'FORGOT_PASSWORD') {
  const otp = await prisma.otp.findFirst({
    where: {
      email,
      code,
      type,
      expiresAt: {
        gt: new Date(),
      },
    },
  })

  if (!otp) {
    return false
  }

  // Delete the OTP after verification
  await prisma.otp.delete({
    where: { id: otp.id },
  })

  return true
}

export async function createUser(
  email: string,
  password: string,
  name?: string,
  phoneNumber?: string
) {
  const hashedPassword = await hashPassword(password)
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      phoneNumber,
      isEmailVerified: true, // Set to true after OTP verification
    },
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}

export async function updateUserPassword(userId: string, password: string) {
  const hashedPassword = await hashPassword(password)
  return prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  })
}
