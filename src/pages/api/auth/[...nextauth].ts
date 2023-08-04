import { prisma } from "@/utils/seed";
import { User } from "next-auth";
import NextAuth, { CookiesOptions, NextAuthOptions } from "next-auth";
import argon2 from "argon2";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextApiRequest, NextApiResponse } from "next";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

type CustomUser = User & {
  role: string;
}

export const authOptions: NextAuthOptions = { 
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
    name: "credentials",
    credentials: {
      username: {label: "Username", type: "text"},
      password: {label: "Password", type: "password"},
    },
    async authorize(credentials) {
      let username = credentials?.username;
      let password = credentials?.password;
      let user = await prisma.user_credentials.findFirst({
          where:{
            username: credentials?.username
          }
        });
      if (!user) {
          return null
        }
      if (username && password && await argon2.verify(user.password, password)) {
          let user_query = await prisma.users.findFirst({
            where: {
              id: user.user_id
            }
          });
          if (user_query) {
            return {id: user.id.toString(), name: user_query.name, email: user_query.email, role: user_query.role} as CustomUser
          }
          return null
        } else {
          // Passwords dont match
          return null
        }
    }
  })
  ],
  session: {
    strategy: "jwt",
  },
  jwt: {
    maxAge: 60*60,
  },
  callbacks: {
    async jwt({user, token}) {
      if (user) token.role = user.role
      return token
    },
    async session({session, token}) {
      if (!session?.user) {
        return session
      }
      session.user.role = token.role;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);

//export { handler as GET, handler as POST }
