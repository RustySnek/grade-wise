"use client"
import { client } from "@/utils/trpc";
import { DefaultSession, SessionStrategy } from "next-auth";
import { getSession } from "next-auth/react";
import { CustomUser } from "../api/auth/[...nextauth]";
import { useEffect, useState } from "react";

interface SchoolData {
  id: number;
  name: string,
  principle_full_name: string,
  country: string,
  address: string,
}

const SchoolSettings = (props: {user_id: number}) => {
  const [school_data, set_school_data] = useState({});
  useEffect(() => {
    (async() => {
      const school = await client["school-data"].query({user_id: props.user_id})
      set_school_data(school?.school as SchoolData);
    })()
  } ,[])
  return (
    <div className="flex flex-row bg-[#1f1f1f] space-x-6 justify-between w-full">
      <div className="bg-[#1f1f1f] w-3/5">FIRST</div>
      <div className="bg-[#1f1f1f] w-2/5 text-center flex flex-col justify-start mt-4 space-y-4">
        {Object.entries(school_data).map(([key,value], idx) => {
          return (
            <div className="rounded-full bg-[#121212] bg-opacity-80 mx-4 py-2" key={idx}>{key as any}: {value}</div>
          );
        })}
      </div>
    </div>
  );
}

export default SchoolSettings;
