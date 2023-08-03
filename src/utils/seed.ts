import { PrismaClient } from "@prisma/client";

export const prisma : PrismaClient = new PrismaClient();

async function seedData() {
  try {
    await prisma.schools.create({
      data: {
        id: 0,
        name: "Administratorz",
        principle_full_name: "Administrator",
        country: "Valhalla",
        address: "Valhalla",
      }
    });
    await prisma.classes.create({
      data: {
        id: 0,
        school_id: 0,
        class_name: "Administrators",
        specialization: "Administration",
      }
    });
    // Insert the permanent user data into the database
    await prisma.users.create({
      data: {
        id: 0,
        name: 'Administrator',
        family_name: 'admin',
        address: 'valhalla',
        email: "admin@istrator.net",
        role: "Administrator",
        school_id: 0,
        class_id: 0,
      },
    });

    await prisma.user_credentials.create({
      data: {
        id: 0,
        username: "Admin",
        password: "Admin",
        email: "Admin@admin.admin",
        user_id: 0
      }
    })
        console.log('Data seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();
