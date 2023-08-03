import { z } from 'zod';
import { procedure, router } from '../trpc';
import { prisma } from '../../utils/seed';
import { NextResponse } from 'next/server';
import argon2 from "argon2";
import { TRPCError } from '@trpc/server';

export const appRouter = router({
    "school-availability": procedure
    .input(
      z.object({
      name: z.string()
    })
    ).query(async (opts) => {
        const {name} = opts.input;
        
        const exists = await prisma.schools.findFirst({
        where:{
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
    const {name, principle_full_name, country, address, admin_username, admin_password, admin_email} = opts.input;
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
        email: admin_email,
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
      const create_director_account = await prisma.users.create({
        data: {
          name: "",
          family_name: "",
          email: admin_email,
          address: "",
          role: "Director",
          class_id: 0,
          school_id: append_school?.id
        }
      });
      const hashed_password = await argon2.hash(admin_password);
      const create_director = await prisma.user_credentials.create({
        data: {
          username: admin_username,
          email: admin_email,
          password: hashed_password,
          user_id: create_director_account?.id 
        }
      });
      return {
        msg: "Successfully appended School and assigned the director"
      }
    } catch (e) {
      console.log(e)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "ok xd"
      })
    }
  }),   
});

// export type definition of API
export type AppRouter = typeof appRouter;
