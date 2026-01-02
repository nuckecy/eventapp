# Church Event Management System

A Next.js-based web application for streamlined event planning, approval, and communication within church communities.

## Features

- Public calendar-first experience for immediate event discovery
- Structured 4-tier approval workflow (Member → Lead → Administrator → Super Admin)
- Real-time search and filtering by event type, department, and keywords
- Google Calendar-style list view for optimal mobile experience
- Complete audit trail for governance and compliance
- Role-based access with dynamic navigation

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+
- **UI Components**: Shadcn UI (Nova style, Indigo theme)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- pnpm (package manager)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd eventapp
\`\`\`

2. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and configure your database connection and other required variables.

4. Set up the database:
\`\`\`bash
pnpm db:push
\`\`\`

5. Run the development server:
\`\`\`bash
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- \`pnpm dev\` - Start development server
- \`pnpm build\` - Build for production
- \`pnpm start\` - Start production server
- \`pnpm lint\` - Run ESLint
- \`pnpm db:push\` - Push Prisma schema to database
- \`pnpm db:studio\` - Open Prisma Studio
- \`pnpm db:generate\` - Generate Prisma Client

## Project Structure

\`\`\`
eventapp/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # React components
│   ├── lib/                # Utility functions and configurations
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
└── ...config files
\`\`\`

## Documentation

All project documentation is organized in the `/docs` directory:

- **[Getting Started Guide](./docs/setup/SETUP_SUMMARY.md)** - Complete setup instructions
- **[API Documentation](./docs/api/API_ENDPOINTS_SUMMARY.md)** - All API endpoints and schemas
- **[Component Documentation](./docs/components/)** - UI component specifications
- **[Product Requirements](./docs/planning/PRD-Church-Event-Management-v2.md)** - Detailed product specifications
- **[Security Audit](./docs/audits/SECURITY_AUDIT_REPORT.md)** - Security assessment and recommendations
- **[Accessibility Report](./docs/audits/ACCESSIBILITY_AUDIT_REPORT.md)** - WCAG compliance audit

For a complete overview, see the [Documentation Index](./docs/README.md).

## License

ISC
