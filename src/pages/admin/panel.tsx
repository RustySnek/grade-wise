'use client'

import with_admin_session from "@/utils/admin_session";
import { getToken } from "next-auth/jwt";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router"
import { FormEvent, FormEventHandler } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const session = useSession();
  if (session) {
    console.log(session)
  }
  if (!session || session.status !=="authenticated") {
    return "Access denied"
  }
  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = data.get("username")?.toString();
    const password = data.get("password")?.toString();
    const response = await fetch('/api/register', {
      method: "POST",
      headers: {
        "Content-Type": 'application/json'
      },
      body: JSON.stringify({username:username, password:password})
    })
    const user_info = await response.json();
    console.log(user_info);
    router.push('/login');
    
  }
  return (
  <form onSubmit={handleRegister}>
      <label>
        Email:
        <input className="bg-black" minLength={4} type="text" name="username" />
      </label>
      <label>
        Password:
        <input className="bg-black" minLength={4} type="password" name="password" />
      </label>
      <button type="submit">Sign In</button>
    </form>

  );
}
