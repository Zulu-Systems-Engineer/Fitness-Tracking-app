import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test users (password managed by Firebase Auth)
  const user1 = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
    },
  })

  console.log('✅ Created user:', user1.email)

  // Create sample workouts
  const workouts = await prisma.workout.createMany({
    data: [
      {
        userId: user1.id,
        name: 'Morning Cardio',
        exercises: [
          { name: 'Running', duration: 30, intensity: 'medium' }
        ],
        duration: 30,
      },
      {
        userId: user1.id,
        name: 'Upper Body Strength',
        exercises: [
          { name: 'Bench Press', sets: 3, reps: 10, weight: 135 },
          { name: 'Pull-ups', sets: 3, reps: 8 }
        ],
        duration: 45,
      },
    ],
  })

  console.log(`✅ Created ${workouts.count} sample workouts`)

  // Create sample goals
  const goals = await prisma.goal.createMany({
    data: [
      {
        userId: user1.id,
        title: 'Run 5K in under 25 minutes',
        target: 25,
        current: 27.5,
        deadline: new Date('2025-12-31'),
        status: 'active',
      },
      {
        userId: user1.id,
        title: 'Bench press 200 lbs',
        target: 200,
        current: 185,
        status: 'active',
      },
    ],
  })

  console.log(`✅ Created ${goals.count} sample goals`)

  // Create sample workout plans
  const workoutPlan = await prisma.workoutPlan.create({
    data: {
      userId: user1.id,
      name: 'Weekly Strength Routine',
      description: 'A balanced strength training program',
      schedule: {
        monday: ['Bench Press', 'Squats'],
        wednesday: ['Deadlifts', 'Overhead Press'],
        friday: ['Pull-ups', 'Rows']
      },
    },
  })

  console.log('✅ Created sample workout plan:', workoutPlan.name)

  // Create sample personal records
  const records = await prisma.personalRecord.createMany({
    data: [
      {
        userId: user1.id,
        exercise: 'Bench Press',
        value: 185,
        unit: 'lbs',
        recordType: 'max_weight',
      },
      {
        userId: user1.id,
        exercise: '5K Run',
        value: 27.5,
        unit: 'minutes',
        recordType: 'best_time',
      },
    ],
  })

  console.log(`✅ Created ${records.count} sample personal records`)

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

