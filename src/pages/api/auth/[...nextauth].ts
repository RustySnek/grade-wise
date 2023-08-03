import { prisma } from "@/utils/seed";
import NextAuth, { CookiesOptions, NextAuthOptions } from "next-auth";
import argon2 from "argon2";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextApiRequest, NextApiResponse } from "next";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

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
      
    }
  })
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }
