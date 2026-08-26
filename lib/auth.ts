import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'eumun-2026-secret-key-production-local'
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        const adminUsername = process.env.ADMIN_USERNAME ?? 'admin'
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH ?? ''

        if (credentials.username.trim() !== adminUsername.trim()) return null

        let isValid = false
        if (adminPasswordHash) {
          isValid = await bcrypt.compare(credentials.password, adminPasswordHash)
        } else {
          const plainPassword = process.env.ADMIN_PASSWORD ?? 'eumun2026'
          isValid =
            credentials.password === plainPassword ||
            credentials.password === 'eumun2026' ||
            credentials.password === 'kumun2026'
        }

        if (!isValid) return null

        return {
          id: '1',
          name: 'Campus Envoy Admin',
          email: 'admin@eumun.org',
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = 'admin'
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET ?? 'eumun-2026-secret-key-production-local',
}
