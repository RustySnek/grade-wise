'use client'

import { getToken } from "next-auth/jwt";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router"
import { FormEvent, FormEventHandler, useState } from "react";
import SchoolSettings from "./_school_settings";
import { CustomUser } from "../api/auth/[...nextauth]";

export default function RegisterPage() {
  const router = useRouter();
  const [option, set_option] = useState("");
  const session = useSession();
  if (!session || session.status !=="authenticated") {
    return "Access denied"
  }
  const user = session.data.user;
  return (
    <main className="flex flex-row ">
      <div className=" h-screen w-1/6 space-y-3 pl-1 pr-4 pt-8 flex transition flex-col flex-wrap bg-opacity-90 rounded-r-2xl justify-start items-start bg-[#121212]  opacity-70">
        <button
          onClick={() => set_option("school_settings")}
          className="rounded-lg bg-[#1f1f1f] h-8 transition hover:brightness-125 w-full">
          School settings</button>
        <button 
          onClick={() => set_option("append_class")}
          className="rounded-lg bg-[#1f1f1f] h-8 transition hover:brightness-125 w-full">
          Create a new class</button> 
        <button className="rounded-lg bg-[#1f1f1f] h-8 transition hover:brightness-125 w-full">School settings</button> 
        <button className="rounded-lg bg-[#1f1f1f] h-8 transition hover:brightness-125 w-full">School settings</button> 
        <button className="rounded-lg bg-[#1f1f1f] h-8 transition hover:brightness-125 w-full">School settings</button> 
        <button className="rounded-lg bg-[#1f1f1f] h-8 transition hover:brightness-125 w-full">School settings</button> 
      </div>
      {
        option === 'school_settings' ? (
          <SchoolSettings user_id={user.id}/>
        ) : option === 'append_class' ? (
          <p>Showing append class menu</p>
        ) : null
      }
    </main>
  );
}
