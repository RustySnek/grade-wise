"use client"

import { client } from "@/utils/trpc";
import { getSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { FormEvent, FormEventHandler, useEffect, useState } from "react";


const RegisterCredentials = () => {
  const [user_id, set_user_id] = useState<number | null>(null);
  const router = useRouter()
  const handle_register = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get("username")?.toString();
    const password = formData.get("password")?.toString();
    const email = formData.get("email")?.toString();
    if (!username || !password || !email || !user_id) {
      return null
    }
    try {
      const resp = await client["register-user"].query({ username, password, email, user_id })
      signOut()
    } catch (err) {
      console.log(err)
    }

  }
  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        set_user_id(session.user.id)
        if (session.user.role !== "unregistered") {
          router.push("/student/panel")
        }
      } else {
        router.push("/login")
      }
    }).catch((err) => {
      console.log(err)
    });

  }, [])

  return (
    <div className="flex h-full flex-row justify-center ">
      <form onSubmit={handle_register} className="flex-col sm:w-1/2 xl:w-1/3 w-full flex mt-16 space-y-4">
        <input className="bg-[#1f1f1f] px-4 py-2 text-2xl rounded-xl text-center" placeholder="username" type="text" name="username"></input>
        <input className="bg-[#1f1f1f] px-4 py-2 text-2xl rounded-xl text-center" placeholder="email" type="email" name="email"></input>
        <input className="bg-[#1f1f1f] px-4 py-2 text-2xl rounded-xl text-center" placeholder="password" type="password" name="password"></input>
        <button className="bg-green-600 px-4 py-2 text-2xl font-bold rounded-xl text-center w-fit self-center" type="submit">Submit</button>
      </form>
    </div>
  );
}

export default RegisterCredentials;
