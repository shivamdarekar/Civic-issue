import { PrismaClient, UserRole, Department } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed2 database seeding...');

  try {
    // Clean up existing data (preserve super admin)
    console.log('🧹 Cleaning up existing data...');
    await prisma.passwordReset.deleteMany({});
    await prisma.issueHistory.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.issueMedia.deleteMany({});
    await prisma.issue.deleteMany({});
    // Delete all users except super admin
    await prisma.user.deleteMany({
      where: {
        role: {
          not: UserRole.SUPER_ADMIN
        }
      }
    });
    
    // Recreate super admin if it doesn't exist
    const superAdminExists = await prisma.user.findUnique({
      where: { email: 'superadmin@vmc.gov.in' }
    });
    
    if (!superAdminExists) {
      console.log('👤 Recreating Super Admin...');
      const hashedPassword = await bcrypt.hash('SuperAdmin@123', 12);
      await prisma.user.create({
        data: {
          fullName: 'VMC Super Administrator',
          email: 'superadmin@vmc.gov.in',
          phoneNumber: '9876543210',
          hashedPassword,
          role: UserRole.SUPER_ADMIN,
          isActive: true,
        }
      });
      console.log('   ✅ Super Admin recreated');
    } else {
      console.log('   ✅ Super Admin preserved');
    }
    
    console.log('   ✅ Database cleaned up successfully');

    // Get zones and wards for assignment
    console.log('🔍 Fetching zones and wards...');
    
    const zones = await Promise.race([
      prisma.zone.findMany({
        include: {
          wards: true
        }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Zone query timeout after 10 seconds')), 10000)
      )
    ]) as any;

    console.log(`📊 Found ${zones.length} zones`);
    if (zones.length === 0) {
      console.error('❌ No zones found. Please run the main seed first.');
      throw new Error('No zones found. Please run the main seed first.');
    }

    console.log('📍 Found zones:', zones.map((z: any) => `${z.name} (${z.wards.length} wards)`));

    // 1. Create 12 Field Workers
    console.log('👷 Creating 12 Field Workers...');
    const fieldWorkers = [
      { firstName: 'Rajesh', surname: 'Patel' },
      { firstName: 'Priya', surname: 'Shah' },
      { firstName: 'Amit', surname: 'Sharma' },
      { firstName: 'Neha', surname: 'Desai' },
      { firstName: 'Vikram', surname: 'Joshi' },
      { firstName: 'Kavita', surname: 'Mehta' },
      { firstName: 'Suresh', surname: 'Trivedi' },
      { firstName: 'Pooja', surname: 'Pandya' },
      { firstName: 'Ravi', surname: 'Thakkar' },
      { firstName: 'Meera', surname: 'Vyas' },
      { firstName: 'Kiran', surname: 'Modi' },
      { firstName: 'Deepak', surname: 'Amin' }
    ];

    for (let i = 0; i < fieldWorkers.length; i++) {
      const worker = fieldWorkers[i];
      const fullName = `${worker.firstName} ${worker.surname}`;
      const email = `${worker.firstName.toLowerCase()}${(i + 1).toString().padStart(3, '0')}@vmc.in`;
      const phoneNumber = `${9000000000 + i + 1}`;
      const password = `${worker.firstName}@123`;
      const hashedPassword = await bcrypt.hash(password, 12);

      await prisma.user.create({
        data: {
          fullName,
          email,
          phoneNumber,
          hashedPassword,
          role: UserRole.FIELD_WORKER,
          isActive: true
        }
      });

      console.log(`   ✅ Created Field Worker: ${fullName} (${email})`);
    }

    // 2. Create 4 Zone Officers (one for each zone)
    console.log('🏢 Creating 4 Zone Officers...');
    const zoneOfficers = [
      { firstName: 'Ashok', surname: 'Patel', zone: 'EAST' },
      { firstName: 'Sunita', surname: 'Sharma', zone: 'WEST' },
      { firstName: 'Mahesh', surname: 'Joshi', zone: 'NORTH' },
      { firstName: 'Rekha', surname: 'Desai', zone: 'SOUTH' }
    ];

    for (let i = 0; i < zoneOfficers.length; i++) {
      const officer = zoneOfficers[i];
      const zone = zones.find(z => z.code === officer.zone);
      
      if (!zone) {
        console.log(`   ❌ Zone ${officer.zone} not found, skipping...`);
        continue;
      }

      const fullName = `${officer.firstName} ${officer.surname}`;
      const email = `${officer.firstName.toLowerCase()}${(i + 1).toString().padStart(3, '0')}@vmc.in`;
      const phoneNumber = `${8000000000 + i + 1}`;
      const password = `${officer.firstName}@123`;
      const hashedPassword = await bcrypt.hash(password, 12);

      await prisma.user.create({
        data: {
          fullName,
          email,
          phoneNumber,
          hashedPassword,
          role: UserRole.ZONE_OFFICER,
          zoneId: zone.id,
          isActive: true
        }
      });

      console.log(`   ✅ Created Zone Officer: ${fullName} (${email}) - ${zone.name}`);
    }

    // 3. Create Ward Engineers (multiple per ward for different departments)
    console.log('🔧 Creating Ward Engineers...');
    const engineerNames = [
      'Dinesh', 'Anjali', 'Bharat', 'Nisha', 'Hitesh', 'Ritu', 'Jayesh', 'Sonal', 
      'Nitin', 'Hetal', 'Paresh', 'Minal', 'Kiran', 'Deepak', 'Priya', 'Amit',
      'Neha', 'Vikram', 'Kavita', 'Suresh', 'Pooja', 'Ravi', 'Meera', 'Rajesh',
      'Ashok', 'Sunita', 'Mahesh', 'Rekha', 'Darshan', 'Jyoti', 'Chirag', 'Nidhi'
    ];
    
    const surnames = ['Patel', 'Shah', 'Sharma', 'Desai', 'Joshi', 'Mehta', 'Trivedi', 'Pandya'];

    // Core departments for each ward (9 engineers per ward)
    const coreDepartments = [
      Department.ROAD,
      Department.HEALTH,
      Department.SOLID_WASTE_MANAGEMENT,
      Department.STREET_LIGHT,
      Department.WATER_WORKS,
      Department.STORM_WATER_DRAINAGE,
      Department.SEWAGE_DISPOSAL,
      Department.PARKS_GARDENS,
      Department.ENCROACHMENT
    ];

    type WardWithZone = {
      id: string;
      wardNumber: number;
      name: string;
      zoneId: string;
      zoneName: string;
      zoneCode: string;
    };

    const allWards: WardWithZone[] = zones.flatMap(zone => 
      zone.wards.map(ward => ({ ...ward, zoneName: zone.name, zoneCode: zone.code }))
    ).sort((a, b) => a.wardNumber - b.wardNumber);

    let engineerIndex = 0;
    for (const ward of allWards) {
      for (const department of coreDepartments) {
        const firstName = engineerNames[engineerIndex % engineerNames.length];
        const surname = surnames[engineerIndex % surnames.length];
        const fullName = `${firstName} ${surname}`;
        const email = `${firstName.toLowerCase()}${(engineerIndex + 1).toString().padStart(3, '0')}@vmc.in`;
        const phoneNumber = `${7000000000 + engineerIndex + 1}`;
        const password = `${firstName}@123`;
        const hashedPassword = await bcrypt.hash(password, 12);

        await prisma.user.create({
          data: {
            fullName,
            email,
            phoneNumber,
            hashedPassword,
            role: UserRole.WARD_ENGINEER,
            wardId: ward.id,
            zoneId: ward.zoneId,
            department,
            isActive: true
          }
        });

        console.log(`   ✅ Created Ward Engineer: ${fullName} (${email}) - Ward ${ward.wardNumber} (${ward.name}) - ${department} - ${ward.zoneName}`);
        engineerIndex++;
      }
    }

    console.log('🎉 Seed2 database seeding completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('- 12 Field Workers created');
    console.log('- 4 Zone Officers created (one per zone)');
    console.log('- 108 Ward Engineers created (9 per ward covering all core departments)');
    console.log('');
    console.log('📋 Test Credentials Format:');
    console.log('Field Workers: rajesh001@vmc.in / Rajesh@123, priya002@vmc.in / Priya@123, etc.');
    console.log('Zone Officers: ashok001@vmc.in / Ashok@123, sunita002@vmc.in / Sunita@123, etc.');
    console.log('Ward Engineers: dinesh001@vmc.in / Dinesh@123, anjali002@vmc.in / Anjali@123, etc.');
    console.log('');
    console.log('📊 Department Coverage:');
    console.log('Each ward has 9 engineers covering:');
    console.log('ROAD, HEALTH, SOLID_WASTE_MANAGEMENT, STREET_LIGHT,');
    console.log('WATER_WORKS, STORM_WATER_DRAINAGE, SEWAGE_DISPOSAL,');
    console.log('PARKS_GARDENS, ENCROACHMENT');

  } catch (error) {
    console.error('❌ Error during seed2 seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed2 seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });