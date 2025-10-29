# Database Setup Guide

## Prerequisites
- PostgreSQL installed and running
- Node.js and pnpm installed

## Step 1: Create a PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE fitness_tracker;

# Exit
\q
```

Or using the command line:
```bash
createdb fitness_tracker
```

## Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example (if it exists)
cp .env.example .env

# Or create manually
touch .env
```

Add your database URL to `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/fitness_tracker?schema=public"
NODE_ENV=development
```

**Important:** Replace:
- `postgres` with your PostgreSQL username
- `password` with your PostgreSQL password
- `localhost:5432` with your database host and port
- `fitness_tracker` with your database name

## Step 3: Run Database Migrations

```bash
# This will create the tables with indexes
npx prisma migrate dev --name init

# Or push the schema directly (for development)
npx prisma db push
```

## Step 4: Seed the Database

```bash
# Run the seed script to populate with sample data
pnpm db:seed

# Or directly with Prisma
npx prisma db seed
```

## Step 5: Verify Setup

```bash
# Open Prisma Studio to view the data
npx prisma studio
```

This will open a web interface at `http://localhost:5555` where you can:
- Browse tables
- View sample data
- Verify indexes are created
- Test queries

## Troubleshooting

### Issue: "Can't reach database server"

**Solution:**
1. Verify PostgreSQL is running:
   ```bash
   # Windows
   Get-Service postgresql*
   
   # Linux/Mac
   sudo systemctl status postgresql
   ```

2. Check your connection string in `.env`

### Issue: "Authentication failed"

**Solution:**
1. Check your username and password
2. For PostgreSQL, you may need to update `pg_hba.conf`
3. Or use password authentication

### Issue: "Database does not exist"

**Solution:**
```bash
# Create the database
createdb fitness_tracker
```

## Indexes Created

The following indexes are automatically created by Prisma:

**Workout Table:**
- Index on `userId`
- Index on `createdAt`
- Composite index on `(userId, createdAt)`

**Goal Table:**
- Index on `userId`
- Composite index on `(userId, status)`
- Composite index on `(userId, deadline)`

**WorkoutPlan Table:**
- Index on `userId`

**PersonalRecord Table:**
- Index on `userId`
- Composite index on `(userId, exercise)`
- Composite index on `(userId, achievedAt)`

These indexes significantly improve query performance!

## Sample Data

The seed script creates:
- 1 demo user (`demo@example.com`)
- 2 sample workouts
- 2 sample goals
- 1 workout plan
- 2 personal records

## Next Steps

Once your database is set up, you can:
1. Start developing locally
2. Run tests against the seeded data
3. Test API endpoints
4. Verify performance improvements from indexes

