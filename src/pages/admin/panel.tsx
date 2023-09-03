'use client'

import { getToken } from "next-auth/jwt";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router"
import { FormEvent, FormEventHandler, useState } from "react";
import SchoolSettings from "./_school_settings";
import ClassCurriculum from "./_class_curriculum"
import { CustomUser } from "../api/auth/[...nextauth]";
import MassImport from "./_mass_import";
import SchoolPeriods from "./_school_periods";


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

  const NavigationButton = (props: { route: string, label: string }) => {
    const { route, label } = props
    return (
      <button onClick={() => set_option(route)}
        style={{ borderWidth: option === route ? 2 : 0 }}
        className="rounded-lg bg-[#2a2a2a] h-12 transition hover:brightness-125 border-red-600">{label}</button>

    );
  }
  return (
    <main className="flex flex-col w-screen">
      <div className="mt-1 w-full grid grid-cols-3 md:grid-cols-6 transition bg-opacity-90 rounded-r-2xl gap-x-4 gap-y-2 items-center bg-[#121212]">
        <NavigationButton label="School Settings" route="school_settings" />
        <NavigationButton label="Create new class" route="append_class" />
        <NavigationButton label="Mass Import" route="import" />
        <NavigationButton label="Class Curriculum" route="curriculum" />
        <NavigationButton label="School Periods" route="periods" />

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
          ) : option === 'periods' ? (
            <SchoolPeriods />
          )
            : null
        }
      </div>
    </main>
  );
}
