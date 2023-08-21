"use client"

import { client } from "@/utils/trpc";
import { getSession } from "next-auth/react";
import { ChangeEvent, FormEvent, useEffect, useState, useSyncExternalStore } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownSection, DropdownItem, Button } from "@nextui-org/react";
import { TeacherData } from "@/backend/routers/_app";
interface SchoolClass {
  school_id: number; id: number; class_name: string; specialization: string;
}
interface SchoolCurriculum {
  school_id: number; id: number; class_id: number; subject_id: number; teacher_id: number; amount: number;
}

interface CurriculumData {
  teacher_id: number;
  amount: number;
}

const ClassCurriculum = () => {
  const [classes, set_classes] = useState<SchoolClass[] | []>([]);
  const [teacher_subjects, set_teacher_subjects] = useState<Record<string, TeacherData[]>>({});
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [curriculum_data, set_curriculum_data] = useState<Record<string, CurriculumData>>({});
  const [school_curriculums, set_school_curriculums] = useState<SchoolCurriculum[] | []>([]);
  //const [school_id, set_school_id] = useState<number | null>(null);

  const handle_curriculum_form = (e: ChangeEvent<HTMLSelectElement>) => {
    const teacher_id = +e.target.value.toString()
    const subject_name = e.target.name.toString()
    set_curriculum_data(curriculum_data => ({ ...curriculum_data, [subject_name]: { amount: curriculum_data[subject_name]?.amount || 0, teacher_id } }))
  }
  const handle_subject_amount = (increment_value: number, key: string, e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
    console.log(key, curriculum_data)
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
  const handleSelectionChange = (newSelection: any) => {
    if (newSelection instanceof Set) {
      setSelectedKeys(newSelection);
    }
  };
  useEffect(() => {
    (async () => {

      const session = await getSession()
      if (session) {
        const school_classes = await client["get-classes"].query({ school_id: session.user.school_id })
        const school_curriculums = await client["get-available-curriculum"].query({ school_id: session.user.school_id })
        const teachers_with_subjects = await client["get-available-teacher-subjects"].query({ school_id: session.user.school_id })
        console.log(teachers_with_subjects)
        if (school_classes) {
          set_classes(school_classes.classes);
        }
        if (school_curriculums) {
          set_school_curriculums(school_curriculums.curriculums);
        }
        if (teachers_with_subjects) {
          set_teacher_subjects(teachers_with_subjects)
        }
        //set_school_id(session.user.school_id)
      }
    })()
  }, [])
  return (
    <div>
      <Dropdown>
        <DropdownTrigger>
          <Button
            variant="bordered"
            className="capitalize"
          >
            Keys: {selectedKeys}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Single selection actions"
          variant="flat"
          closeOnSelect={false}
          selectionMode="multiple"
          selectedKeys={selectedKeys}
          onSelectionChange={handleSelectionChange}
        >
          {classes.map((_class, idx) => {
            return (
              <DropdownItem key={_class.class_name}>{_class.class_name} {selectedKeys.has(_class.class_name) ? "/>" : null}</DropdownItem>
            )

          })}
        </DropdownMenu>
      </Dropdown>
      <div className='flex flex-col justify-center items-center text-center'>
        <form>

          {Object.entries(teacher_subjects).map(([key, value]) => {
            return (
              <div key={key} className='space-x-4'>
                <label>{key}</label>
                <select className="bg-black" id="teacher_select" name={key} onChange={(e) => handle_curriculum_form(e)}>
                  <option value="">Select a teacher...</option>

                  {value.map((teacher, idx) => {
                    return (
                      <option key={teacher.name} value={teacher.id}>{teacher.name} {teacher.surname}</option>
                    )
                  })}


                </select>
                <input type="number" className="bg-[#1f1f1f]" readOnly value={curriculum_data[key]?.amount} defaultValue={0}></input>
                <button className="text-2xl" onClick={(e) => handle_subject_amount(1, key, e)}>+</button>
                <button className="text-2xl" onClick={(e) => handle_subject_amount(-1, key, e)}>-</button>

              </div>
            );
          })}
          <button type="submit">Submit</button>

        </form>
      </div>
      - ? Copy from other class curriculum
      - Choose number of each subject for class ( get subjects ( try to get them from existing curriculum ), return them with number inputs )
      - Submit
    </div>
  );
}

export default ClassCurriculum;
