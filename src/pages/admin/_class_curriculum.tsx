"use client"

import { client } from "@/utils/trpc";
import { getSession } from "next-auth/react";
import { ChangeEvent, FormEvent, useEffect, useState, useSyncExternalStore } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownSection, DropdownItem, Button } from "@nextui-org/react";
import { TeacherData } from "@/backend/routers/_app";
import SearchBar from "./_search_bar";
interface SchoolClass {
  school_id: number; id: number; class_name: string; specialization: string;
}
interface SchoolCurriculum {
  school_id: number; id: number; class_id: number; subject_id: number; teacher_id: number; amount: number;
}

export interface CurriculumData {
  teacher_id: number | null;
  amount: number;
}

const ClassCurriculum = () => {
  const [classes, set_classes] = useState<SchoolClass[] | []>([]);
  const [teacher_subjects, set_teacher_subjects] = useState<Record<string, TeacherData[]>>({});
  const [selectedKeys, setSelectedKeys] = useState<Array<number>>([]);
  const [curriculum_data, set_curriculum_data] = useState<Record<string, CurriculumData>>({});
  const [school_curriculums, set_school_curriculums] = useState<SchoolCurriculum[] | []>([]);
  const [school_id, set_school_id] = useState<number | null>(null);

  const handle_curriculum_form = (e: ChangeEvent<HTMLSelectElement>) => {
    const subject_name = e.target.name.toString()

    if (!e.target.value) {
      set_curriculum_data(curriculum_data => ({ ...curriculum_data, [subject_name]: { amount: curriculum_data[subject_name]?.amount || 0, teacher_id: null } }))

      return null
    }
    const teacher_id = +e.target.value.toString()
    set_curriculum_data(curriculum_data => ({ ...curriculum_data, [subject_name]: { amount: curriculum_data[subject_name]?.amount || 0, teacher_id } }))
  }
  const handle_curriculum_submit = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const class_ids = selectedKeys
    if (!school_id) {
      return null
    }
    const response = await client["set-curriculum"].query({ curriculum: curriculum_data, class_ids, school_id })
  }
  const handle_subject_amount = (increment_value: number, key: string, e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!curriculum_data[key]) {
      return null
    }
    let new_amount = (curriculum_data[key]?.amount + increment_value) || 0 + increment_value
    if (new_amount < 0) {
      new_amount = 0
    }
    set_curriculum_data(curriculum_data => ({
      ...curriculum_data,
      [key]: {
        ...curriculum_data[key],
        amount: new_amount
      }
    }))
  }
  const handleSelectionChange = (class_id: number) => {
    if (!selectedKeys.includes(class_id)) {
      setSelectedKeys(selectedKeys => [...selectedKeys, class_id]);
    } else {
      setSelectedKeys(selectedKeys.filter(id => id != class_id))
    }
  };
  const add_subject = (subject_name: string) => {
    set_curriculum_data(curriculum_data => ({
      ...curriculum_data, [subject_name]: {
        teacher_id: null, amount: 0
      }
    }))

  }
  const remove_subject = (subject: string) => {
    const { [subject]: string, ...curriculum } = curriculum_data;
    set_curriculum_data(curriculum)
  }
  useEffect(() => {
    (async () => {

      const session = await getSession()
      if (session) {
        const school_classes = await client["get-classes"].query({ school_id: session.user.school_id })
        const school_curriculums = await client["get-available-curriculum"].query({ school_id: session.user.school_id })
        const teachers_with_subjects = await client["get-available-teacher-subjects"].query({ school_id: session.user.school_id })
        if (school_classes) {
          set_classes(school_classes.classes.filter(_class => !["staff", "admin"].includes(_class.class_name)));
        }
        if (school_curriculums) {
          set_school_curriculums(school_curriculums.curriculums);
        }
        if (teachers_with_subjects) {
          const new_curriculum_data: Record<string, CurriculumData> = {};
          set_teacher_subjects(teachers_with_subjects)

        }
        set_school_id(session.user.school_id)
      }
    })()
  }, [])
  return (
    <div className="w-screen flex relative flex-col space-y-2 items-center justify-start">


      <div className="bg-[#1f1f1f] rounded px-2 py-1 grid grid-rows-2 sm:grid-rows-1 gap-x-2 grid-flow-col"
      >
        {classes.map((_class, idx) => {
          return (
            <button onClick={() => handleSelectionChange(_class.id)} className="bg-[#2b2b2b] rounded px-1 py-1 font-semibold" key={idx}
              style={{ filter: selectedKeys.includes(_class.id) ? "brightness(1.5)" : "none" }}>{_class.class_name}</button>
          )

        })}
      </div>
      <div className='flex flex-col w-screen justify-center items-center text-center'>
        <form className="">
          <table className=" border-separate  border-spacing-x-2 border-spacing-y-2">
            <thead>
              <tr>
                <th onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                  }
                }} className="p-0">
                  <SearchBar subjects={Object.keys(teacher_subjects)} on_select={add_subject} included_subjects={Object.keys(curriculum_data)} />
                </th>
                <th>
                  Subjects
                </th>
                <th>Teacher</th>
                <th>Amount</th>


              </tr>
            </thead>
            <tbody>
              {Object.keys(curriculum_data).map((key, idx) => {
                return (

                  <tr key={key} className=''>
                    <td className="border border-slate-600 rounded-full font-bold text-xs sm:text-xl px-0.5 sm:px-2">{key}</td>
                    <td className="w-10 sm:w-fit rounded">
                      <select className="bg-[#2b2b2b] text-center px-2 py-1  text-xs sm:text-xl  rounded-2xl w-full" id="teacher_select" name={key} onChange={(e) => handle_curriculum_form(e)}>
                        <option value="">Select a teacher...</option>

                        {teacher_subjects[key].map((teacher, idx) => {
                          return (
                            <option key={teacher.name} value={teacher.id}>{teacher.name} {teacher.surname}</option>
                          )
                        })}


                      </select>
                    </td>
                    <td className=" font-semibold text-xs sm:text-xl  rounded bg-[#2b2b2b] px-0 sm:px-2" defaultValue={0}>{curriculum_data[key]?.amount || 0}</td>
                    <td className="space-x-0 sm:space-x-4">
                      <button className="text-lg sm:text-2xl rounded bg-[#2b2b2b] px-2" onClick={(e) => handle_subject_amount(1, key, e)}>↑</button>
                      <button className=" text-lg sm:text-2xl  rounded bg-[#2b2b2b] px-2" onClick={(e) => handle_subject_amount(-1, key, e)}>↓</button>
                    </td>
                    <td>
                      <button className=" text-lg sm:text-2xl text-red-500 font-bold" onClick={() => remove_subject(key)}>X</button>

                    </td>
                  </tr>

                );
              })}
            </tbody>

          </table>
          <button className="px-4 mt-1 py-2 text-xl bg-green-600 rounded-lg" onClick={handle_curriculum_submit}>Submit</button>

        </form>
      </div>
    </div>
  );
}

export default ClassCurriculum;
