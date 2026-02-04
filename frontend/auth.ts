import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'magic-link',
      name: 'Magic Link',
      credentials: {
        email: { label: 'Email', type: 'email' },
        token: { label: 'Token', type: 'text' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString() ?? '';
        const token = credentials?.token?.toString() ?? '';

        if (!email || !token) {
          return null;
        }

        const apiUrl =
          process.env.INTERNAL_API_URL ??
          process.env.NEXT_PUBLIC_API_URL ??
          'http://localhost:3000';

        const response = await fetch(
          `${apiUrl}/auth/magic-link/verify?email=${encodeURIComponent(
            email,
          )}&token=${encodeURIComponent(token)}`,
          { method: 'GET' },
        );

        if (!response.ok) {
          return null;
        }

        const data = await response.json();

        return {
          id: data.user?.id ?? email,
          email: data.user?.email ?? email,
          name: data.user?.name ?? null,
          role: data.user?.role ?? 'MEMBER',
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    verifyRequest: '/verify',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).refreshToken = token.refreshToken;
      (session.user as any).role = token.role;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
