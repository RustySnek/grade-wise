import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface User extends DefaultUser {
    role: string;
  }
  interface Session {
    user: {
      role?: string | null
    } & DefaultSession["user"]
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    role: string
  }
}
