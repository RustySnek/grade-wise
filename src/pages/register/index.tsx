"use client"

import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { TRPCClientError, createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { client } from "@/utils/trpc";
import { TRPCError } from "@trpc/server";
import { useRouter } from "next/router";


interface SchoolData {
  name: string,
  principle_full_name: string,
  country: string,
  address: string
}

interface AdminData {
  admin_username: string,
  admin_email: string,
  admin_password: string,
}


export default function AdminPanel() {
  const router = useRouter();
  const [data, set_data] = useState({} as { [key: string]: any });
  const [error_message, set_error_message] = useState("");
  const [admin_data, set_admin_data] = useState({});
  const [is_form_filled, set_form_filled] = useState(false);
  const [message, set_message] = useState("");
  const query_schools = async () => {
    try {
      const concat_datas = {...data as SchoolData, ...admin_data as AdminData};
      const append = await client["register"].mutate(concat_datas)
        set_message(append.msg);
        router.push("/admin/panel")
      } catch (e) {
      if (e instanceof TRPCClientError) {
        set_error_message(e.message);
      }
    }
    }
  const handle_change = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = event.target;
    set_admin_data((prev_data) => ({
      ...prev_data,
      [name]: value,
    }))
  }  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
      set_data({});
      set_error_message("");
      const formData = new FormData(event.currentTarget);
      const name = formData.get("name")?.toString();
      const principle_full_name = formData.get("principle_full_name")?.toString();
      const address = formData.get("address")?.toString();
      const country = formData.get("country")?.toString();
      if (!name || !country || !address || !principle_full_name) {
            set_error_message("name, address, country or priciple name can't contain less than 4 characters")
            return
      }
    try {
      await client["school-availability"].query({name:name});
    } catch (e) {
      if (e instanceof TRPCClientError) {
        set_error_message(e.message);
        set_form_filled(false);
        return
      }
    }
      const school_data: SchoolData = {name:name, principle_full_name:principle_full_name, country:country, address:address};
      set_data(school_data);
      set_form_filled(true)
     };
  const handle_credential_submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    set_error_message("");
    set_message("");
    let check_form = Object.values(admin_data).filter((value) => typeof value === 'string' && value.length < 4);
    if (check_form) {
      set_error_message("Username, email or password cannot contain less than 4 characters")
      return
    }

    await query_schools();
  }

  return (
    <main className="">
      <div className="flex flex-col h-screen justify-start items-center space-y-6">
      {is_form_filled === false ? <form
          className="flex-col flex space-y-6 px-4 py-2  items-center sm:w-1/2 xl:w-2/5 2xl:w-1/3" onSubmit={handleSubmit}>
            <div className="space-y-6 flex-col flex w-full">
                            <h1 className="text-2xl font-bold text-center mt-2">Register your school</h1>

              <input className="bg-[#1f1f1f] rounded-lg text-2xl px-4 py-2 text-center h-16" minLength={4} type="text" name="name" placeholder="School's Name"/>
              <input className="bg-[#1f1f1f] rounded-lg text-2xl px-4 py-2 text-center h-16" minLength={4} type="text" name="principle_full_name" placeholder="Principle's full name"/>
              <input className="bg-[#1f1f1f] rounded-lg text-2xl px-4 py-2 text-center h-16" minLength={4} type="text" name="address" placeholder="School Address" />
              <input className="bg-[#1f1f1f] rounded-lg text-2xl px-4 py-2 text-center h-16" minLength={4} type="text" name="country" placeholder="Country"/>
            </div>
              <button className="bg-green-500 font-bold opacity-90 transition rounded-xl hover:brightness-110 px-4 py-3 text-2xl" type="submit">Register School</button>

          </form> :
      <form onSubmit={handle_credential_submit}
          className="flex-col flex space-y-6 px-4 py-2  items-center sm:w-1/2 xl:w-2/5 2xl:w-1/3" >
                <h1 className="text-2xl font-bold mt-2">Create Director's Acccount</h1>

              <input onChange={handle_change}
              className="bg-[#1f1f1f] rounded-lg text-2xl px-4 py-2 text-center h-16" minLength={4} type="text" name="admin_username" placeholder="Username"/>
              <input onChange={handle_change}
              className="bg-[#1f1f1f] rounded-lg text-2xl px-4 py-2 text-center h-16" minLength={4} type="email" name="admin_email" placeholder="Email"/>
              <input onChange={handle_change} 
              className="bg-[#1f1f1f] rounded-lg text-2xl px-4 py-2 text-center h-16" minLength={4} type="password" name="admin_password" placeholder="Password"/>
                  <button className="bg-green-500 font-bold opacity-90 transition rounded-xl hover:brightness-110 px-4 py-3 text-2xl" type="submit">Register School</button>

          </form>}
      <p className="text-2xl text-green-700 font-semibold text-center mx-4">{message}</p>
      <p className="text-2xl text-red-700 font-semibold text-center mx-4">{error_message}</p>

            </div>
    </main>
  );
}

