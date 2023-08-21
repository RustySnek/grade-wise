'use client'

import { getToken } from "next-auth/jwt";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router"
import { FormEvent, FormEventHandler, useState } from "react";
import SchoolSettings from "./_school_settings";
import ClassCurriculum from "./_class_curriculum"
import { CustomUser } from "../api/auth/[...nextauth]";
import MassImport from "./_mass_import";

export default function RegisterPage() {
  const router = useRouter();
  const [option, set_option] = useState("");
  const session = useSession();
  console.log(session)
  if (!session || session.status !== "authenticated" || session.data.user.role !== "admin") {
    if (session.data === null) {
      router.push("/login")
    }
    console.log(session)
    return "Access denied"
  }
  const user = session.data.user;
  return (
    <main className="flex flex-col w-screen">
      <div className="mt-1 w-full grid grid-cols-6 transition bg-opacity-90 rounded-r-2xl gap-4 items-center bg-[#121212]">
        <button
          onClick={() => set_option("school_settings")}
          className="rounded-lg bg-[#2a2a2a] h-12 transition hover:brightness-125 border-red-600"
          style={{ borderWidth: option === "school_settings" ? 2 : 0 }}>
          School settings</button>
        <button
          onClick={() => set_option("append_class")}
          style={{ borderWidth: option === "append_class" ? 2 : 0 }}
          className="rounded-lg bg-[#2a2a2a] h-12 transition hover:brightness-125 border-red-600">
          Create a new class</button>
        <button
          onClick={() => set_option("import")}
          style={{ borderWidth: option === "import" ? 2 : 0 }}
          className="rounded-lg bg-[#2a2a2a] h-12 transition hover:brightness-125 border-red-600">
          Mass Import</button>
        <button onClick={() => set_option("curriculum")}
          style={{ borderWidth: option === "curriculum" ? 2 : 0 }}
          className="rounded-lg bg-[#2a2a2a] h-12 transition hover:brightness-125 border-red-600">Class Curriculum</button>
        <button className="rounded-lg bg-[#2a2a2a] h-12 transition hover:brightness-125 border-red-600">School settings</button>
        <button className="rounded-lg bg-[#2a2a2a] h-12 transition hover:brightness-125 border-red-600">School settings</button>
      </div>
      <div className="mt-4">
        {
          option === 'school_settings' ? (
            <SchoolSettings user_id={user.id} />
          ) : option === 'append_class' ? (
            <p>Showing append class menu</p>
          ) : option === 'import' ? (
            <MassImport />
          ) : option === 'curriculum' ? (
            <ClassCurriculum />
          ) : null
        }
      </div>
    </main>
  );
}
