import prismadb from '@/lib/prismadb';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'text',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and Password required');
        }

        const user = await prismadb.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.hashedPassword) {
          throw new Error("Email doesn't Exist");
        }

        const isCorrectPassword = await compare(
          credentials.password,
          user.hashedPassword // Corrected this line to use 'user.hashedPassword'
        );

        if (!isCorrectPassword) {
          throw new Error('Incorrect password');
        }

        return user;
      },
    }),
    // Import and configure other providers here
  ],
  pages: {
    signIn: '/auth',
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  secret: process.env.NEXTAUTH_SECRET,
});

// Export the appropriate handler for both GET and POST requests
export const GET = handler;
export const POST = handler;
