"use client"
import { client } from "@/utils/trpc";
import { DefaultSession } from "next-auth";
import { getSession } from "next-auth/react";
import { ChangeEvent, FormEvent, FormEventHandler, MouseEventHandler, useEffect, useState } from "react";
import { Session } from "next-auth";
import { Student_Data } from "../api/students/upload";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";

export interface ClassData {
  name: string;
  surname: string;
  address: string;
  country: string;
  email: string;
  class: string;
  specialization: string;
}

const TableDropdown = () => {
  return (
    <Dropdown className="bg-[#121212] px-3 text-center rounded-xl py-2">
      <DropdownTrigger>
        <Button
          variant="bordered"
        >
          Open Menu
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Static Actions">
        <DropdownItem className="hover:font-semibold" key="new">New</DropdownItem>
        <DropdownItem className="hover:font-semibold" key="copy">Copy</DropdownItem>
        <DropdownItem className="hover:font-semibold" key="edit">Edit</DropdownItem>
        <DropdownItem key="delete" className="text-danger text-red-600 hover:font-semibold" color="danger">
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

const MassImport = () => {
  const [response_data, set_response_data] = useState<Record<string, Student_Data[]>>({});
  const [file, setFile] = useState<File | null>(null);
  const [error_message, set_error_message] = useState<string>("");
  const [switch_button, set_switch_button] = useState("Students");
  const [loading, set_loading] = useState(false);
  const [response_message, set_response_message] = useState("");
  const [school_id, set_school_id] = useState<number | null>(null);
  useEffect(() => {
    getSession().then((session: Session | null) => {
      if (session) {
        set_school_id(session.user.school_id)

      }
    })
  }, [])
  const handle_switch_button = () => {
    if (switch_button === "Students") {
      set_switch_button("Teachers")
    } else {
      set_switch_button("Students")
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      alert("please choose a file")
      return
    }
    setFile(event.target.files[0]);
  };
  const handleUpload = async (event: React.MouseEvent<HTMLButtonElement>) => {
    set_response_message("")
    set_error_message("")
    const body = new FormData();
    if (!file) {
      alert('Please select a file.');
      return;
    }

    body.append("file", file);
    set_loading(true);
    try {
      if (!school_id) {
        alert("No school detected, please try to sign in again")
        return null
      }
      const query_params = new URLSearchParams();
      query_params.append("school_id", school_id.toString())
      const url = `/api/${switch_button.toLowerCase()}/upload?${query_params.toString()}`;
      const response = await fetch(url, {
        method: 'POST',
        body: body,
      });

      if (response.ok) {
        set_response_message("File uploaded successfully!")
        const response_json = await response.json()
        set_response_data(response_json.message)
      } else {
        set_error_message("The file format seems incorrect. Please make sure the columns and values are set correctly")
      }
    } catch (error) {
      console.error("Invalid file. Please make sure the columns and values are set correctly");
    }
    set_loading(false);
  };
  return (
    <main className='space-y-8 flex-col flex w-full items-center text-center'>
      <button onClick={() => handle_switch_button()} className="rounded transition hover:brightness-125 bg-violet-700 px-4 py-2 text-2xl">{switch_button}</button>
      <h1>Columns: name,surname,address,country,email,class,specialization</h1>
      <input
        className="rounded-xl bg-gray-900 file:bg-gray-600 file:text-white font-medium file:mr-4 file:px-4 text-2xl block text-gray-600 cursor-pointer file:text-2xl file:border-none"

        onChange={handleFileChange} type="file" id="csv-file" accept=".csv" />
      <button
        className="rounded transition bg-green-600 hover:brightness-125 text-2xl px-4 py-2"
        type="submit" onClick={handleUpload}>{loading === true ? "Loading..." : "Upload CSV"}</button>
      <h1 className="text-xl text-green-600 font-semibold text-center">{response_message}</h1>
      <h1 className="text-xl text-red-600 font-semibold text-center">{error_message}</h1>
      <div className="flex flex-col items-center w-full space-y-4">
        {
          switch_button === "Students" ?
            (Object.entries(response_data).map(([key, value]) => {
              return (
                <div className="w-screen items-center justify-center flex flex-col rounded-xl">{key}

                  <TableDropdown />
                  <div className="flex flex-col w-full items-center rounded-xl">
                    <table className="w-1/2 text-lg bg-[#1f1f1f] border border-[#2b2b2b] rounded-xl py-2 border-separate">
                      <thead>
                        <tr className="rounded-tl-xl">
                          <th className="lg:pr-4">Name</th>
                          <th className="lg:pr-4">Surname</th>
                          <th className="lg:pr-4">Token</th>
                          <th className="lg:pr-4">Email</th>
                          <th className="lg:pr-4">Options</th>

                        </tr>
                      </thead>
                      <tbody>
                        {

                          value.map((student, idx) => {
                            return (
                              <tr className="rounded-xl h-8" style={{ backgroundColor: idx % 2 === 0 ? "#121212" : "#2b2b2b" }}>
                                <td className="">{student.name}</td>
                                <td className="">{student.surname}</td>
                                <td className="">{student.token}</td>
                                <td className="">{student.email}</td>
                                <TableDropdown />
                              </tr>
                            )
                          })

                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            }
            )) : null // handle viewing the teachers
        }
      </div>
    </main>
  );
}

export default MassImport;
