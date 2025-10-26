# ADR-002: Database Schema Design

## Status
Accepted

## Context
We need to design a database schema that supports:
- User management and authentication
- Workout plan creation and management
- Workout tracking and logging
- Goal setting and progress tracking
- Personal records and analytics
- Data relationships and integrity
- Scalability and performance

## Decision
We will use PostgreSQL with Prisma ORM and the following schema design:

### Core Entities

#### Users
- Primary key: `id` (CUID)
- Authentication: `email`, `name`
- Timestamps: `createdAt`, `updatedAt`

#### Workout Plans
- Primary key: `id` (CUID)
- Ownership: `createdBy` (FK to Users)
- Content: `name`, `description`, `duration`, `difficulty`, `category`
- Visibility: `isPublic`
- Timestamps: `createdAt`, `updatedAt`

#### Workout Plan Exercises
- Primary key: `id` (CUID)
- Relationship: `planId` (FK to Workout Plans)
- Content: `name`, `description`, `targetMuscles`, `equipment`
- Instructions: `instructions` (array)
- Configuration: `restTime`, `notes`

#### Workouts
- Primary key: `id` (CUID)
- Ownership: `userId` (FK to Users)
- Relationship: `planId` (FK to Workout Plans, optional)
- Status: `status` (in_progress, completed, cancelled)
- Timestamps: `startedAt`, `completedAt`, `createdAt`, `updatedAt`

#### Workout Exercises
- Primary key: `id` (CUID)
- Relationship: `workoutId` (FK to Workouts)
- Content: `name`, `description`, `targetMuscles`, `equipment`
- Instructions: `instructions` (array)
- Configuration: `restTime`, `notes`

#### Workout Sets
- Primary key: `id` (CUID)
- Relationships: `workoutId` (FK to Workouts), `exerciseId` (FK to Workout Exercises)
- Data: `reps`, `weight`, `duration`, `distance`
- Configuration: `restTime`, `notes`
- Timestamp: `createdAt`

#### Goals
- Primary key: `id` (CUID)
- Ownership: `userId` (FK to Users)
- Content: `title`, `description`, `type`
- Values: `targetValue`, `currentValue`, `unit`
- Status: `priority`, `status`, `targetDate`, `completedAt`
- Timestamps: `createdAt`, `updatedAt`

#### Personal Records
- Primary key: `id` (CUID)
- Ownership: `userId` (FK to Users)
- Relationship: `workoutId` (FK to Workouts, optional)
- Data: `exerciseName`, `type`, `value`, `unit`
- Timestamps: `achievedAt`, `createdAt`, `updatedAt`

## Consequences

### Positive
- **Normalized Design**: Reduces data redundancy and maintains consistency
- **Flexible Relationships**: Supports complex queries and analytics
- **Type Safety**: Prisma generates TypeScript types
- **Performance**: Proper indexing and query optimization
- **Scalability**: Can handle large datasets efficiently

### Negative
- **Complexity**: More tables and relationships to manage
- **Migration Overhead**: Schema changes require careful migration planning
- **Query Complexity**: Some queries may require joins

## Alternatives Considered
- **Document Database (MongoDB)**: Rejected due to lack of ACID guarantees
- **Denormalized Schema**: Rejected due to data consistency concerns
- **Graph Database**: Rejected due to complexity and team expertise

## Implementation Notes
- Use CUID for all primary keys for better distribution
- Implement proper foreign key constraints
- Add database indexes for frequently queried fields
- Use Prisma migrations for schema versioning
- Implement soft deletes where appropriate
- Consider data archiving for old records
