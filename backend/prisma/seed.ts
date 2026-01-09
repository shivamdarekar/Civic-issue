import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

// Use the same adapter pattern as your main app
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create Zones first
    console.log('📍 Creating zones...');
    const northZone = await prisma.zone.upsert({
      where: { name: 'North Zone' },
      update: {},
      create: {
        name: 'North Zone',
        code: 'NORTH',
      },
    });

    const southZone = await prisma.zone.upsert({
      where: { name: 'South Zone' },
      update: {},
      create: {
        name: 'South Zone',
        code: 'SOUTH',
      },
    });

    const eastZone = await prisma.zone.upsert({
      where: { name: 'East Zone' },
      update: {},
      create: {
        name: 'East Zone',
        code: 'EAST',
      },
    });

    const westZone = await prisma.zone.upsert({
      where: { name: 'West Zone' },
      update: {},
      create: {
        name: 'West Zone',
        code: 'WEST',
      },
    });

    console.log('✅ Zones created');

    // Create Wards
    console.log('📍 Creating wards...');
    const wards = [
      { wardNumber: 1, name: 'Fatehgunj', zoneId: northZone.id },
      { wardNumber: 2, name: 'Alkapuri', zoneId: northZone.id },
      { wardNumber: 3, name: 'Sayajigunj', zoneId: northZone.id },
      { wardNumber: 4, name: 'Raopura', zoneId: northZone.id },
      { wardNumber: 5, name: 'Mandvi', zoneId: northZone.id },
      { wardNumber: 6, name: 'Sama', zoneId: southZone.id },
      { wardNumber: 7, name: 'Gorwa', zoneId: southZone.id },
      { wardNumber: 8, name: 'Akota', zoneId: southZone.id },
      { wardNumber: 9, name: 'Karelibaug', zoneId: southZone.id },
      { wardNumber: 10, name: 'Vasna', zoneId: southZone.id },
      { wardNumber: 11, name: 'Manjalpur', zoneId: eastZone.id },
      { wardNumber: 12, name: 'Tandalja', zoneId: eastZone.id },
      { wardNumber: 13, name: 'Vadsar', zoneId: eastZone.id },
      { wardNumber: 14, name: 'Waghodia', zoneId: eastZone.id },
      { wardNumber: 15, name: 'Harni', zoneId: westZone.id },
      { wardNumber: 16, name: 'Productivity Road', zoneId: westZone.id },
      { wardNumber: 17, name: 'Subhanpura', zoneId: westZone.id },
      { wardNumber: 18, name: 'Makarpura', zoneId: westZone.id },
      { wardNumber: 19, name: 'Ajwa Road', zoneId: westZone.id },
    ];

    for (const ward of wards) {
      await prisma.ward.upsert({
        where: { wardNumber: ward.wardNumber },
        update: {},
        create: ward,
      });
    }

    console.log('✅ Wards created');

    // Create Super Admin
    console.log('👤 Creating Super Admin...');
    const hashedPassword = await bcrypt.hash('SuperAdmin@123', 12);

    const superAdmin = await prisma.user.upsert({
      where: { email: 'superadmin@vmc.gov.in' },
      update: {},
      create: {
        fullName: 'VMC Super Administrator',
        email: 'superadmin@vmc.gov.in',
        phoneNumber: '9876543210',
        hashedPassword,
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      },
    });

    console.log('✅ Super Admin created');

    // Create Issue Categories
    console.log('📋 Creating issue categories...');
    const categories = [
      {
        name: 'Pothole',
        slug: 'pothole',
        description: 'Road potholes and surface damage',
        slaHours: 48,
        formSchema: {
          fields: [
            { name: 'depth_cm', type: 'number', label: 'Depth (cm)', required: true },
            { name: 'width_cm', type: 'number', label: 'Width (cm)', required: true }
          ]
        }
      },
      {
        name: 'Stray Cattle',
        slug: 'stray-cattle',
        description: 'Stray animals on roads',
        slaHours: 24,
        formSchema: {
          fields: [
            { name: 'animal_count', type: 'number', label: 'Number of Animals', required: true },
            { name: 'animal_type', type: 'select', label: 'Animal Type', required: true, options: ['cow', 'buffalo', 'dog'] }
          ]
        }
      },
      {
        name: 'Garbage Dump',
        slug: 'garbage',
        description: 'Illegal garbage dumping',
        slaHours: 24,
        formSchema: {
          fields: [
            { name: 'volume', type: 'select', label: 'Volume', required: true, options: ['small', 'medium', 'large'] },
            { name: 'waste_type', type: 'select', label: 'Waste Type', required: true, options: ['dry', 'wet', 'mixed'] }
          ]
        }
      }
    ];

    for (const category of categories) {
      await prisma.issueCategory.upsert({
        where: { slug: category.slug },
        update: {},
        create: category,
      });
    }

    console.log('✅ Issue categories created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📋 Test Credentials:');
    console.log('Email: superadmin@vmc.gov.in');
    console.log('Password: SuperAdmin@123');
    console.log('');
    console.log('🚀 You can now test the API endpoints!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });