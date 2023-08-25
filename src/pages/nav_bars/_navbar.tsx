"use client"
import { DefaultSession } from "next-auth";
import { getSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Session } from "next-auth";
import AdminNav from "./_admin_nav";
import StudentNav from "./_student_nav";

const NavBar = () => {
  const [session, set_session] = useState<Session | null>(null);
  useEffect(() => {
    (async () => {
      const _session = await getSession();
      set_session(_session)
    })()
  }, [])

  return (

    <div className="flex border-b-gray-700 border-b flex-row h-12 text-xl xl:w-auto sm:w-auto items-center px-4 justify-start bg-[#1f1f1f]">
      <a href="/" className="font-semibold inline-flex border-r h-full items-center pr-12 mr-4">
        <Image src="https://dummyimage.com/8" width={0} height={0} alt="wise_logo" className='w-8 h-8 mr-4' />
        <p>GradeWise</p>
      </a>
      <div className="">
        {session ?
          (
            session.user.role === "admin" ?
              <AdminNav /> :
              session.user.role === "student" ?
                <StudentNav /> :
                session.user.role === "teacher" ?
                  <p>Teacher</p> : null
          ) : <p>Session doesnt exist</p>
        }
      </div>
      <button onClick={() => signOut()} className='ml-auto transition hover:brightness-125 font-semibold text-lg px-4 sm:px-6 md:px-12 py-2 rounded bg-red-800 '>⤷</button>
    </div>
  );
}
export default NavBar;
