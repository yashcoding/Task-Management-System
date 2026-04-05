import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up
  await prisma.refreshToken.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('Password1', 12);

  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@taskflow.io',
      password: hashedPassword,
      tasks: {
        create: [
          {
            title: 'Design system tokens',
            description: 'Define all color, spacing, and typography tokens.',
            status: 'DONE',
            priority: 'HIGH',
          },
          {
            title: 'Implement JWT refresh logic',
            description: 'Handle access token expiry and silent refresh.',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
          },
          {
            title: 'Write unit tests for auth module',
            description: 'Cover register, login, and logout flows.',
            status: 'PENDING',
            priority: 'MEDIUM',
          },
          {
            title: 'Setup CI/CD pipeline',
            description: 'Configure GitHub Actions for lint, test, deploy.',
            status: 'PENDING',
            priority: 'LOW',
          },
          {
            title: 'Build task filter component',
            description: 'Dropdown with multi-select filters for status and priority.',
            status: 'IN_PROGRESS',
            priority: 'MEDIUM',
          },
        ],
      },
    },
  });

  console.log(`✅ Created user: ${user.email} (password: Password1)`);
  console.log('✅ Seeded 5 sample tasks');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
