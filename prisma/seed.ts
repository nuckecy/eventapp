import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clean existing data
  await prisma.notification.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.requestChange.deleteMany()
  await prisma.requestFeedback.deleteMany()
  await prisma.event.deleteMany()
  await prisma.eventRequest.deleteMany()
  await prisma.user.deleteMany()
  await prisma.department.deleteMany()

  console.log('🧹 Cleaned existing data')

  // Create departments
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        id: 'dept-youth',
        name: 'Youth Ministry',
        leadName: 'Sarah Johnson',
        leadEmail: 'youth@church.org',
        leadPhone: '555-0101',
        icon: '👥',
        color: '#3B82F6',
      }
    }),
    prisma.department.create({
      data: {
        id: 'dept-worship',
        name: 'Worship & Arts',
        leadName: 'Michael Chen',
        leadEmail: 'worship@church.org',
        leadPhone: '555-0102',
        icon: '🎵',
        color: '#8B5CF6',
      }
    }),
    prisma.department.create({
      data: {
        id: 'dept-children',
        name: 'Children\'s Ministry',
        leadName: 'Emily Davis',
        leadEmail: 'children@church.org',
        leadPhone: '555-0103',
        icon: '👶',
        color: '#EC4899',
      }
    }),
    prisma.department.create({
      data: {
        id: 'dept-outreach',
        name: 'Community Outreach',
        leadName: 'James Wilson',
        leadEmail: 'outreach@church.org',
        leadPhone: '555-0104',
        icon: '🤲',
        color: '#10B981',
      }
    }),
    prisma.department.create({
      data: {
        id: 'dept-women',
        name: 'Women\'s Ministry',
        leadName: 'Grace Martinez',
        leadEmail: 'women@church.org',
        leadPhone: '555-0105',
        icon: '👩',
        color: '#F59E0B',
      }
    }),
    prisma.department.create({
      data: {
        id: 'dept-men',
        name: 'Men\'s Ministry',
        leadName: 'Robert Thompson',
        leadEmail: 'men@church.org',
        leadPhone: '555-0106',
        icon: '👨',
        color: '#6B7280',
      }
    }),
  ])

  console.log(`✅ Created ${departments.length} departments`)

  // Hash password for all users (using same password for testing)
  const hashedPassword = await bcrypt.hash('PassWord2021', 10)

  // Create users with different roles
  const users = await Promise.all([
    // Super Admin
    prisma.user.create({
      data: {
        email: 'superadmin@church.org',
        name: 'Super Admin',
        role: 'superadmin',
        hashedPassword,
        emailVerified: new Date(),
      }
    }),
    // Admins
    prisma.user.create({
      data: {
        email: 'admin@church.org',
        name: 'Admin User',
        role: 'admin',
        hashedPassword,
        emailVerified: new Date(),
      }
    }),
    prisma.user.create({
      data: {
        email: 'admin2@church.org',
        name: 'Jane Admin',
        role: 'admin',
        hashedPassword,
        emailVerified: new Date(),
      }
    }),
    // Department Leads
    prisma.user.create({
      data: {
        email: 'youth.lead@church.org',
        name: 'Sarah Johnson',
        role: 'lead',
        departmentId: 'dept-youth',
        hashedPassword,
        emailVerified: new Date(),
      }
    }),
    prisma.user.create({
      data: {
        email: 'worship.lead@church.org',
        name: 'Michael Chen',
        role: 'lead',
        departmentId: 'dept-worship',
        hashedPassword,
        emailVerified: new Date(),
      }
    }),
    prisma.user.create({
      data: {
        email: 'children.lead@church.org',
        name: 'Emily Davis',
        role: 'lead',
        departmentId: 'dept-children',
        hashedPassword,
        emailVerified: new Date(),
      }
    }),
    prisma.user.create({
      data: {
        email: 'outreach.lead@church.org',
        name: 'James Wilson',
        role: 'lead',
        departmentId: 'dept-outreach',
        hashedPassword,
        emailVerified: new Date(),
      }
    }),
    // Regular Members
    prisma.user.create({
      data: {
        email: 'member@church.org',
        name: 'John Member',
        role: 'member',
        departmentId: 'dept-youth',
        hashedPassword,
        emailVerified: new Date(),
      }
    }),
    prisma.user.create({
      data: {
        email: 'member2@church.org',
        name: 'Mary Member',
        role: 'member',
        departmentId: 'dept-worship',
        hashedPassword,
        emailVerified: new Date(),
      }
    }),
    prisma.user.create({
      data: {
        email: 'member3@church.org',
        name: 'David Member',
        role: 'member',
        departmentId: 'dept-children',
        hashedPassword,
        emailVerified: new Date(),
      }
    }),
  ])

  console.log(`✅ Created ${users.length} users`)

  // Create some sample event requests
  const eventRequests = await Promise.all([
    prisma.eventRequest.create({
      data: {
        requestNumber: 'REQ-2026-001',
        title: 'Youth Summer Camp 2026',
        description: 'Annual summer camp for teenagers aged 13-18. Activities include worship, games, and leadership training.',
        eventType: 'regional',
        eventDate: new Date('2026-07-15'),
        startTime: new Date('1970-01-01T09:00:00'),
        endTime: new Date('1970-01-01T17:00:00'),
        location: 'Mountain Retreat Center',
        expectedAttendance: 150,
        status: 'approved',
        creatorId: users.find(u => u.email === 'youth.lead@church.org')!.id,
        departmentId: 'dept-youth',
        adminId: users.find(u => u.email === 'admin@church.org')!.id,
        submittedAt: new Date('2026-01-01'),
        reviewedAt: new Date('2026-01-02'),
        approvedAt: new Date('2026-01-03'),
      }
    }),
    prisma.eventRequest.create({
      data: {
        requestNumber: 'REQ-2026-002',
        title: 'Women\'s Prayer Breakfast',
        description: 'Monthly prayer breakfast for women of all ages. Fellowship, worship, and prayer time.',
        eventType: 'local',
        eventDate: new Date('2026-02-07'),
        startTime: new Date('1970-01-01T08:00:00'),
        endTime: new Date('1970-01-01T10:00:00'),
        location: 'Church Hall',
        expectedAttendance: 50,
        status: 'submitted',
        creatorId: users.find(u => u.email === 'member2@church.org')!.id,
        departmentId: 'dept-women',
        submittedAt: new Date('2026-01-02'),
      }
    }),
    prisma.eventRequest.create({
      data: {
        requestNumber: 'REQ-2026-003',
        title: 'Community Food Drive',
        description: 'Collecting non-perishable food items for local food bank.',
        eventType: 'local',
        eventDate: new Date('2026-02-14'),
        startTime: new Date('1970-01-01T10:00:00'),
        endTime: new Date('1970-01-01T14:00:00'),
        location: 'Church Parking Lot',
        expectedAttendance: 100,
        status: 'submitted',
        creatorId: users.find(u => u.email === 'outreach.lead@church.org')!.id,
        departmentId: 'dept-outreach',
        submittedAt: new Date('2026-01-03'),
      }
    }),
    prisma.eventRequest.create({
      data: {
        requestNumber: 'REQ-2026-004',
        title: 'Children\'s Easter Celebration',
        description: 'Easter egg hunt, games, and Bible story time for children.',
        eventType: 'sunday',
        eventDate: new Date('2026-04-12'),
        startTime: new Date('1970-01-01T14:00:00'),
        endTime: new Date('1970-01-01T16:00:00'),
        location: 'Church Grounds',
        expectedAttendance: 75,
        status: 'draft',
        creatorId: users.find(u => u.email === 'children.lead@church.org')!.id,
        departmentId: 'dept-children',
      }
    }),
  ])

  console.log(`✅ Created ${eventRequests.length} event requests`)

  // Create approved event from the first request
  const approvedEvent = await prisma.event.create({
    data: {
      requestId: eventRequests[0].id,
      title: eventRequests[0].title,
      description: eventRequests[0].description,
      eventType: eventRequests[0].eventType,
      eventDate: eventRequests[0].eventDate,
      startTime: eventRequests[0].startTime,
      endTime: eventRequests[0].endTime,
      location: eventRequests[0].location,
      expectedAttendance: eventRequests[0].expectedAttendance,
      departmentId: eventRequests[0].departmentId,
      publishedAt: new Date(),
    }
  })

  console.log(`✅ Created 1 published event`)

  console.log('🎉 Seed completed successfully!')
  console.log('\n📝 Login Credentials:')
  console.log('─────────────────────────────────────────')
  console.log('All passwords: PassWord2021')
  console.log('')
  console.log('🔑 Super Admin:')
  console.log('   Email: superadmin@church.org')
  console.log('')
  console.log('🔑 Admin:')
  console.log('   Email: admin@church.org')
  console.log('   Email: admin2@church.org')
  console.log('')
  console.log('🔑 Department Leads:')
  console.log('   Youth Lead: youth.lead@church.org')
  console.log('   Worship Lead: worship.lead@church.org')
  console.log('   Children Lead: children.lead@church.org')
  console.log('   Outreach Lead: outreach.lead@church.org')
  console.log('')
  console.log('🔑 Regular Members:')
  console.log('   Email: member@church.org')
  console.log('   Email: member2@church.org')
  console.log('   Email: member3@church.org')
  console.log('─────────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })