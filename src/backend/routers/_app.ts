import { z } from 'zod';
import { procedure, router } from '../trpc';
import { prisma } from '../../utils/seed';
import { NextResponse } from 'next/server';
import argon2 from "argon2";
import { TRPCError } from '@trpc/server';


interface ClassData {
  name: string;
  surname: string;
  address: string;
  country: string;
  email: string;
  class: string;
  specialization: string;
}
interface SubjectData {
  id: number; name: string; school_id: number;
}
export interface TeacherData {
  name: string; surname: string; id: number
}

export const appRouter = router({
  "set-curriculum": procedure
    .input(
      z.object({
        curriculum: z.record(z.string(), z.object({
          teacher_id: z.nullable(z.number()),
          amount: z.number()
        })),
        class_ids: z.array(z.number()),
        school_id: z.number()
      })
    ).query(async ({ input }) => {
      const { curriculum, class_ids, school_id } = input;
      for (const class_id of class_ids) {
        Object.entries(curriculum).map(async ([subject, values]) => {
          if (!values.teacher_id) {
            return
          }
          const exists = await prisma.class_subjects.findFirst({
            where: {
              school_id,
              Class: { id: class_id },
              Subject: { name: subject },
              teacher_id: values.teacher_id,
            }
          })
          if (exists) {
            await prisma.class_subjects.updateMany({
              where: {
                school_id,
                Class: { id: class_id },
                Subject: { name: subject },
                teacher_id: values.teacher_id,
              },
              data: {
                amount: values.amount
              }
            })
          } else {
            const subject_id = await prisma.subjects.findFirst({
              where: {
                school_id,
                name: subject
              }
            })
            if (!subject_id) {
              return null
            }
            await prisma.class_subjects.create({
              data: {
                School: { connect: { id: school_id } },
                Class: { connect: { id: class_id } },
                Subject: { connect: { id: subject_id.id } },
                teacher_id: values.teacher_id,
                amount: values.amount
              }
            })
          }
        })
      }
      return { success: true }

    }),
  "get-available-teacher-subjects": procedure
    .input(
      z.object({
        school_id: z.number()
      })
    ).query(async ({ input }) => {
      const { school_id } = input;
      const response_data: Record<string, TeacherData[]> = {}
      const subjects = await prisma.schools.findUnique({
        where: {
          id: school_id
        },
        include: {
          Subjects: true,
        }
      })
      if (!subjects) {
        return null
      }
      for (const subject of subjects.Subjects) {
        response_data[subject.name] = []
        const teacher_subjects = await prisma.teacher_subjects.findMany({
          where: {
            subject_id: subject.id
          },
          include: {
            Teachers: true
          }
        })
        for (const teacher_subj of teacher_subjects) {
          const teachers = await prisma.users.findFirst({
            where: {
              role: "teacher",
              school_id,
              id: teacher_subj.Teachers.user_id
            },
          })
          if (!teachers) {
            return null
          }
          response_data[subject.name].push({ name: teachers.name, surname: teachers.family_name, id: teachers.id })

        }
      }
      return response_data
    }),
  "get-available-curriculum": procedure
    .input(
      z.object({


        school_id: z.number()
      })
    ).query(async ({ input }) => {
      const { school_id } = input;
      try {
        var curriculums = await prisma.schools.findUnique({
          where: {
            id: school_id
          },
          include: {
            class_subjects: true
          }
        })
      } catch (e) {
        return null
      }
      if (!curriculums || !curriculums.class_subjects) {
        return null
      }
      return { curriculums: curriculums.class_subjects }
    }),
  "get-classes": procedure
    .input(
      z.object(
        {
          school_id: z.number()
        }
      )
    ).query(async ({ input }) => {
      const { school_id } = input;
      const school = await prisma.schools.findUnique({
        where: {
          id: school_id
        },
        include: {
          Class: true
        }
      })
      if (!school) {
        return null
      }
      return { classes: school.Class }

    }),
  "register-user": procedure
    .input(
      z.object(
        {
          username: z.string(),
          email: z.string(),
          password: z.string(),
          user_id: z.number()
        })).query(async ({ input }) => {
          const { username, email, password, user_id } = input;
          const hash_password = await argon2.hash(password);
          const [credentials, user, remove_temp_token] = await prisma.$transaction([
            prisma.user_credentials.create({
              data: {
                username: username.toLowerCase(),
                email: email.toLowerCase(),
                password: hash_password,
                User: { connect: { id: user_id } }
              }
            }),
            prisma.users.update({
              where: {
                id: user_id
              },
              data: {
                email: email.toLowerCase(),
                role: "student"
              }
            }),
            prisma.$queryRaw`DELETE FROM new_users WHERE user_id = ${user_id}`
          ])
          /*
                const credentials = await prisma.user_credentials.create({
                  data: {
                    username,
                    email,
                    password: hash_password,
                    User: { connect: { id: user_id } }
                  }
                })
                const user = await prisma.users.update({
                  where: {
                    id: user_id
                  },
                  data: {
                    email,
                    role: "student"
                  }
                })
                const remove_temp_token = await prisma.$queryRaw`DELETE FROM new_users WHERE user_id = ${user_id}`*/
        }),
  "school-data": procedure
    .input(
      z.object({
        user_id: z.number()
      })
    ).query(async (opts) => {
      const { user_id } = opts.input;
      const user = await prisma.users.findFirst({
        where: {
          id: user_id
        }
      });
      if (!user) {
        return null
      }
      const school = await prisma.schools.findFirst({
        where: {
          id: user.school_id
        }
      });
      return { school: school }
    }),
  "school-availability": procedure
    .input(
      z.object({
        name: z.string()
      })
    ).query(async (opts) => {
      const { name } = opts.input;

      const exists = await prisma.schools.findFirst({
        where: {
          name: name
        }
      });
      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "School with the given name already exists",
        })

      }
    }),
  "register": procedure
    .input(
      z.object({
        name: z.string(),
        principle_full_name: z.string(),
        country: z.string(),
        address: z.string(),
        admin_username: z.string(),
        admin_email: z.string(),
        admin_password: z.string()
      }),
    )
    .mutation(async (opts) => {
      const { name, principle_full_name, country, address, admin_username, admin_password, admin_email } = opts.input;

      const exist = await prisma.schools.findFirst({
        where: {
          name: name
        }
      });
      if (exist) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "School with the given name already exists",
        })
      }
      const admin_exists = await prisma.user_credentials.findFirst({
        where: {
          email: admin_email.toLowerCase(),
        }
      });
      if (admin_exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "The director with this email is already registered"
        })
      }
      try {
        const append_school = await prisma.schools.create({
          data: {
            name: name,
            principle_full_name: principle_full_name,
            country: country,
            address: address,
          }
        });
        const create_admin_class = await prisma.classes.create({
          data: {
            class_name: "admin",
            School: { connect: { id: append_school.id } },
            specialization: "admin",

          }
        });
        const create_staff_class = await prisma.classes.create({
          data: {
            class_name: "staff",
            School: { connect: { id: append_school.id } },
            specialization: "staff"
          }
        })
        const create_director_account = await prisma.users.create({
          data: {
            name: "",
            family_name: "",
            email: admin_email.toLowerCase(),
            address: "",
            role: "admin",
            Class: { connect: { id: create_admin_class.id } },
            School: { connect: { id: append_school.id } }
          }
        });
        const hashed_password = await argon2.hash(admin_password);
        const create_director = await prisma.user_credentials.create({
          data: {
            username: admin_username.toLowerCase(),
            email: admin_email.toLowerCase(),
            password: hashed_password,
            User: { connect: { id: create_director_account?.id } }
          }
        });
        return {
          msg: "Successfully appended School and assigned the director"
        }
      } catch (e) {
        console.log(e)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "INTERNAL_SERVER_ERROR"
        })
      }
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
