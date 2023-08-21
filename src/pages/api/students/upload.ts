import { NextApiRequest, NextApiResponse } from 'next';
import formidable from "formidable";
import fs from "fs";
import argon2 from 'argon2';
import { gen_temp_password } from '../_upload';

export const config = {
  api: {
    bodyParser: false,
  },
};
import { ClassData } from '../../admin/_mass_import';
import { prisma } from '@/utils/seed';
import { csv_into_object } from '../_upload';

export interface Student_Data {
  name: string;
  surname: string;
  token: string;
  email: string;
}

function isValidClassData(data: any): data is ClassData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    'surname' in data &&
    'address' in data &&
    'country' in data &&
    'email' in data &&
    'class' in data &&
    'specialization' in data
  );
}

const handle_data = async (file_data: ClassData[], school_id: number) => {
  const response_data: any = {}
  const classes: Array<string> = []
  var current_class_id = 0
  var current_class_name = ""
  for (const val of file_data) {
    if (!isValidClassData(val)) {
      throw new Error("Csv data is invalid")
    }
    if (!classes.includes(val.class)) {
      classes.push(val.class)
      const check_class = await prisma.classes.findFirst({
        where: {
          school_id,
          class_name: val.class,
        }
      })
      if (!check_class) {
        const create_class = await prisma.classes.create({
          data: {
            class_name: val.class,
            School: { connect: { id: school_id } },
            specialization: val.specialization
          }
        })
        current_class_id = create_class.id
        current_class_name = create_class.class_name
      } else {
        current_class_id = check_class.id
        current_class_name = check_class.class_name
      }
    }
    if (!(current_class_name in response_data)) {
      response_data[current_class_name] = [];
    }
    /*const check_user = await prisma.user_credentials.findFirst({
      where: {
        email: val.email
      }
    });
    if (!check_user) {
    }*/
    const user = await prisma.users.create({
      data: {
        name: val.name,
        family_name: val.surname,
        address: val.address,
        role: "unregistered",
        School: { connect: { id: school_id } },
        Class: { connect: { id: current_class_id } }
      }
    })
    if (!val.email || val.email === "") {
      const temp_token = gen_temp_password()
      console.log(temp_token)
      await prisma.new_users.create({
        data: {
          temporary_token: temp_token,
          user_id: user.id
        }
      })
      response_data[current_class_name].push({
        name: user.name,
        surname: user.family_name,
        token: temp_token,
        email: user.email,
      } as Student_Data)

    } else {
      await prisma.users.update({
        where: {
          id: user.id
        },
        data: {
          email: val.email
        }

      })
      response_data[current_class_name].push({
        name: user.name,
        surname: user.family_name,
        token: "emailed",
        email: user.email,
      } as Student_Data)
      // Handle logging in with magic link and email
    }

  }
  return response_data;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST' && typeof req.query.school_id === "string") {
    const school_id: number = parseInt(req.query.school_id, 10);
    try {
      const form = new formidable.IncomingForm();
      form.parse(req, async (err, fields, files) => {
        try {
          const parsed_data: ClassData[] = csv_into_object(files.file);
          try {
            const response = await handle_data(parsed_data, school_id)
            return res.status(201).send({ status: "success", message: response });
          } catch (data_error) {
            return res.status(422).send({ "status": "failure", "message": "The data of csv file seems to be incorrect." })
          }
        } catch (err) {
          return res.status(422).send({ "status": "failure", "message": err })
        }
      });
    } catch (error) {
      return res.status(500).send({ "error": "Internal server error" })
    }

  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }

}

