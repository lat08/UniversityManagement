# University Management System

A Next.js project for managing university operations including students, courses, and academic records.

## Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn

## Setup Instructions

1. **Clone the repository**
```bash
git clone [repository-url]
cd UniversityManagement
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/university_management?schema=public"
```

4. **Initialize database**
```bash
npm install @prisma/client

# Create database tables
npm run db:migrate

# Generate Prisma client
npx prisma generate

```

5. **Start development server**
```bash
npm run dev
```
