import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // CLEAN UP: Delete all existing wards first
    console.log('🧹 Cleaning existing wards...');
    await prisma.$executeRaw`DELETE FROM wards`;
    
    // Create Zones first
    console.log('📍 Creating zones...');
    const eastZone = await prisma.zone.upsert({
      where: { name: 'East Zone' },
      update: {},
      create: {
        name: 'East Zone',
        code: 'EAST',
      },
    });

    const northZone = await prisma.zone.upsert({
      where: { name: 'North Zone' },
      update: {},
      create: {
        name: 'North Zone',
        code: 'NORTH',
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

    const southZone = await prisma.zone.upsert({
      where: { name: 'South Zone' },
      update: {},
      create: {
        name: 'South Zone',
        code: 'SOUTH',
      },
    });

    console.log('✅ Zones created');

    // Load GeoJSON data
    console.log('📍 Loading ward boundaries from GeoJSON...');
    const geojsonPath = path.join(__dirname, '../data/ward-boundaries.geojson');
    const geojsonData = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

    // Zone mapping
    const zoneMap = {
      'EAST': eastZone.id,
      'NORTH': northZone.id,
      'WEST': westZone.id,
      'SOUTH': southZone.id
    };

    // Create ONLY wards from GeoJSON data (12 wards)
    console.log('📍 Creating wards with boundaries...');
    console.log(`📊 Processing ${geojsonData.features.length} wards from GeoJSON`);
    
    for (const feature of geojsonData.features) {
      const { ward_no, ward_name, zone_code } = feature.properties;
      const coordinates = feature.geometry.coordinates;
      
      console.log(`   Creating Ward ${ward_no}: ${ward_name} (${zone_code} Zone)`);
      
      // Convert coordinates to PostGIS format
      const polygonWKT = `POLYGON((${coordinates[0].map(coord => `${coord[0]} ${coord[1]}`).join(', ')}))`;
      
      await prisma.$executeRaw`
        INSERT INTO wards (id, ward_number, name, zone_id, boundary, created_at, updated_at)
        VALUES (
          uuid_generate_v4(),
          ${ward_no},
          ${ward_name},
          ${zoneMap[zone_code]}::uuid,
          ST_GeomFromText(${polygonWKT}, 4326),
          NOW(),
          NOW()
        )
      `;
    }

    console.log('✅ Wards created with boundaries');

    // Verify ward creation
    const wardCount = await prisma.ward.count();
    console.log(`📊 Total wards in database: ${wardCount}`);

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
    console.log('📊 Final Ward Summary (12 wards with boundaries):');
    console.log('- East Zone: Nyay Mandir, Waghodia, Pratap Nagar, Raopura');
    console.log('- North Zone: Harni, Fatehgunj, Tin Rasta, Ajwa');
    console.log('- West Zone: Akota, Subhanpura, Vasna');
    console.log('- South Zone: Makarpura');
    console.log('');
    console.log('🚀 Clean database with real ward boundaries ready!');

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