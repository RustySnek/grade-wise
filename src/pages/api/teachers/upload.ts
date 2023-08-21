import formidable from "formidable";
import { NextApiRequest, NextApiResponse } from "next";
import { csv_into_object, gen_temp_password } from "../_upload";
import Papa from "papaparse";
import fs from "fs";
import { ParseResult } from "zod";
import { UniqueESSymbolType } from "typescript";
import { prisma } from "@/utils/seed";
import argon2 from 'argon2';

interface TeacherData {
  name: string;
  surname: string;
  address: string;
  country: string;
  email: string;
  subjects: string;
  tutor: boolean;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

function is_valid_teacher_data(data: any): data is TeacherData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    'surname' in data &&
    'address' in data &&
    'country' in data &&
    'email' in data &&
    'subjects' in data &&
    'tutor' in data
  );
}
const handle_teacher_data = async (data: TeacherData[], school_id: number) => {
  const teacher_response_data = [];
  const teacher_class = await prisma.classes.findFirst({
    where: {
      school_id,
      class_name: "staff"
    }
  });
  for (const val of data) {
    if (!is_valid_teacher_data(val)) {
      throw new Error("The csv file is invalid")
    }
    const check_user = await prisma.user_credentials.findFirst({
      where: {
        email: val.email
      }
    })
    if (!check_user) {
      const user = await prisma.users.create({
        data: {
          name: val.name,
          family_name: val.surname,
          address: val.address,
          email: val.email,
          role: "teacher",
          School: {
            connect: {
              id: school_id
            }
          },
          Class: {
            connect: {
              id: teacher_class?.id
            }
          }
        }
      })
      const _temp_password = gen_temp_password();
      const username = gen_temp_password();
      const temp_password = await argon2.hash(_temp_password)
      const user_creds = await prisma.user_credentials.create({
        data: {
          username,
          password: temp_password,
          email: val.email,
          User: { connect: { id: user.id } }
        }
      })
      const teacher = await prisma.teachers.create({
        data: {
          User: { connect: { id: user.id } }
        }
      })
      const subjects = JSON.parse(val.subjects.replaceAll("'", '"'))
      let subject_id = 0
      for (const subj of subjects) {
        const subject_check = await prisma.subjects.findFirst({
          where: {
            name: subj
          }
        })
        if (!subject_check) {
          const subject = await prisma.subjects.create({
            data: {
              name: subj,
              Schools: { connect: { id: school_id } }
            }
          })
          subject_id = subject.id
        } else {
          subject_id = subject_check.id
        }
        const teacher_subject = await prisma.teacher_subjects.create({
          data: {

            Teachers: {
              connect: {
                id: teacher.id
              }
            },
            Subjects: {
              connect: {
                id: subject_id
              }
            }
          }
        })
        teacher_response_data.push({ name: user.name, surname: user.family_name, email: user.email, subjects: subjects, username, password: _temp_password })
      }
    }

  }
  return teacher_response_data

}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST' && typeof req.query.school_id === "string") {
    const school_id: number = parseInt(req.query.school_id, 10);
    try {
      const form = new formidable.IncomingForm();
      form.parse(req, async (err, fields, files) => {
        console.log("parsing")
        if (err) {
          return res.status(500).send({ "error": "error when parsing form" })
        }
        try {
          const parsed_data: TeacherData[] = await csv_into_object(files.file) as TeacherData[];
          try {
            await handle_teacher_data(parsed_data, school_id)
          } catch (err) {
            return res.status(422).send({ "status": "failure", "message": err })
          }
          return res.status(201).send({ "status": "success" });

        } catch (err) {
          return res.status(422).send({ "status": "failure", "message": err })
        }
      });
    } catch (error) {
      return res.status(500).send({ "error": "Internal server error" })
    }

  } else {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

}

