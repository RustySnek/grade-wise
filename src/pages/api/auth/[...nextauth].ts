import { prisma } from "@/utils/seed";
import { DefaultSession, User } from "next-auth";
import NextAuth, { CookiesOptions, NextAuthOptions } from "next-auth";
import argon2 from "argon2";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextApiRequest, NextApiResponse } from "next";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export type CustomUser = User & {
  role: string | undefined | null;
  id: number,
  banned: boolean
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        new_user_token: { label: "Temporary Token", type: "password" },
      },
      async authorize(credentials) {
        let username = credentials?.username;
        let password = credentials?.password;
        let new_user_token = credentials?.new_user_token;
        if (new_user_token) {
          let new_user = await prisma.new_users.findFirst({
            where: {
              temporary_token: new_user_token
            }
          });
          if (!new_user) {
            return null
          }
          let user = await prisma.users.findFirst({
            where: {
              id: new_user.user_id
            }
          });
          if (!user) {
            return null
          }
          return { id: user.id.toString(), name: user.name, email: user.email, role: user.role, banned: user.banned, school_id: user.school_id } as CustomUser


        }
        let user = await prisma.user_credentials.findFirst({
          where: {
            username
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
            return { id: user.id.toString(), name: user_query.name, email: user_query.email, role: user_query.role, banned: user_query.banned, school_id: user_query.school_id } as CustomUser
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
    // The master token age
    maxAge: 60 * 60 * 2,
  },
  jwt: {
    // refresh age
    maxAge: 60,

  },
  callbacks: {
    async signIn({ user, credentials }) {
      if (user?.banned) {
        return false
      }
      return true
    },
    async jwt({ user, token }) {
      console.log(token)
      if (user) {
        token.role = user.role
        token.id = +user.id
        token.school_id = user.school_id
        token.banned = user.banned
      }
      const is_banned = await prisma.users.findFirst({
        where: {
          id: token.id
        },
      })
      if (!is_banned || is_banned.banned === true) {
        return Promise.reject(null);
      }
      return token
    },
    async session({ session, token }): Promise<any> {
      if (!session?.user) {
        return session
      }
      session.user.role = token.role;
      session.user.id = token.id;
      session.user.school_id = token.school_id;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);

//export { handler as GET, handler as POST }
