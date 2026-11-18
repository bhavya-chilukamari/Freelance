import prisma from '../src/config/db.js';
import { hashPassword } from '../src/utils/password.js';

async function main() {
  console.log('🌱 Starting database demo seeder...');

  // 1. Clean existing demo user if exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'demo@freelance.dev' },
  });

  if (existingUser) {
    console.log('Cleaning existing demo data...');
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  // 2. Create Demo Freelancer User
  const passwordHash = await hashPassword('Password123!');
  const user = await prisma.user.create({
    data: {
      email: 'demo@freelance.dev',
      passwordHash,
      fullName: 'Alex Morgan',
      businessName: 'Morgan Software & Design Labs',
      professionalTitle: 'Senior Full Stack Software Architect',
      hourlyRate: 95.0,
      currency: 'USD',
      phone: '+1 (555) 345-6789',
      address: '100 Innovation Way, Suite 400, San Francisco, CA 94105',
      taxId: 'US-TAX-8923412',
    },
  });

  console.log(`✅ Demo user created: ${user.email} (Password: Password123!)`);

  // 3. Create Clients
  const acmeClient = await prisma.client.create({
    data: {
      userId: user.id,
      name: 'Sarah Jenkins',
      company: 'Acme Enterprise Solutions',
      email: 'sarah.jenkins@acme.com',
      phone: '+1 (555) 789-0123',
      address: '500 Market Street, San Francisco, CA',
      status: 'ACTIVE',
      notes: 'Key enterprise account. Net-30 payment terms.',
    },
  });

  const nexusClient = await prisma.client.create({
    data: {
      userId: user.id,
      name: 'Marcus Vance',
      company: 'Nexus FinTech Technologies',
      email: 'marcus@nexusfin.io',
      phone: '+1 (555) 456-7890',
      address: '250 Wall Street, New York, NY',
      status: 'ACTIVE',
      notes: 'Fast-paced series-B fintech startup. High priority delivery.',
    },
  });

  const horizonClient = await prisma.client.create({
    data: {
      userId: user.id,
      name: 'Elena Rostova',
      company: 'Horizon Venture Studio',
      email: 'elena@horizonvc.co',
      phone: '+1 (555) 123-4567',
      address: '101 University Ave, Palo Alto, CA',
      status: 'LEAD',
      notes: 'In discussion for upcoming AI portfolio project redesign.',
    },
  });

  console.log('✅ Created 3 demo clients.');

  // 4. Create Projects
  const now = new Date();
  const pastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const futureTwoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const futureThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const project1 = await prisma.project.create({
    data: {
      userId: user.id,
      clientId: nexusClient.id,
      title: 'Cloud Core Microservices Migration',
      description: 'Architecting scalable serverless microservices and PostgreSQL migration pipeline.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      budget: 14500.0,
      currency: 'USD',
      startDate: pastMonth,
      deadline: futureThreeDays,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      userId: user.id,
      clientId: acmeClient.id,
      title: 'NextGen Customer Billing Portal',
      description: 'Modern React SPA with Stripe integration and PDF invoice generation engine.',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      budget: 8200.0,
      currency: 'USD',
      startDate: now,
      deadline: futureTwoWeeks,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      userId: user.id,
      clientId: nexusClient.id,
      title: 'Executive Analytics Dashboard',
      description: 'High performance real-time telemetry dashboard for executive stakeholders.',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      budget: 6500.0,
      currency: 'USD',
      startDate: pastMonth,
      deadline: now,
      completedAt: now,
    },
  });

  console.log('✅ Created 3 demo projects.');

  // 5. Create Milestones
  const m1 = await prisma.milestone.create({
    data: {
      projectId: project1.id,
      title: 'Phase 1: Architecture Blueprint & DB Schemas',
      description: 'System design documents and normalized 3NF relational models.',
      status: 'COMPLETED',
      amount: 4500.0,
      orderIndex: 1,
    },
  });

  const m2 = await prisma.milestone.create({
    data: {
      projectId: project1.id,
      title: 'Phase 2: API Endpoints & Auth Hardening',
      description: 'REST API, JWT verification, and service business logic layer.',
      status: 'IN_PROGRESS',
      amount: 5000.0,
      orderIndex: 2,
    },
  });

  const m3 = await prisma.milestone.create({
    data: {
      projectId: project1.id,
      title: 'Phase 3: Production Deployment & QA Audit',
      description: 'Load testing, security headers, and live production cutover.',
      status: 'PENDING',
      amount: 5000.0,
      orderIndex: 3,
    },
  });

  // 6. Create Tasks
  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        projectId: project1.id,
        milestoneId: m1.id,
        title: 'Draft Prisma 3NF Schema & Migrations',
        description: 'Define relational models for users, clients, projects, tasks, and payments.',
        status: 'DONE',
        priority: 'HIGH',
        estimatedHours: 6.0,
        actualHours: 5.5,
      },
      {
        userId: user.id,
        projectId: project1.id,
        milestoneId: m2.id,
        title: 'Implement JWT Auth & Row-Level Data Isolation',
        description: 'Verify token middleware and user tenant scoping across all service methods.',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        dueDate: futureThreeDays,
        estimatedHours: 8.0,
        actualHours: 4.0,
      },
      {
        userId: user.id,
        projectId: project2.id,
        title: 'Design Tailwind CSS Billing Table & Modals',
        description: 'Clean responsive UI components with invoice status chips.',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: futureTwoWeeks,
        estimatedHours: 10.0,
      },
      {
        userId: user.id,
        projectId: project2.id,
        title: 'Hook Axios Client to Express REST Endpoints',
        description: 'Create API services with interceptors for seamless token injection.',
        status: 'REVIEW',
        priority: 'HIGH',
        dueDate: futureTwoWeeks,
        estimatedHours: 4.0,
        actualHours: 3.5,
      },
      {
        userId: user.id,
        projectId: project3.id,
        title: 'Executive KPI Visual Charts with Recharts',
        description: 'Implement monthly gross and status distribution visual reports.',
        status: 'DONE',
        priority: 'MEDIUM',
        estimatedHours: 12.0,
        actualHours: 11.0,
      },
    ],
  });

  console.log('✅ Created demo milestones and tasks.');

  // 7. Create Invoices / Payments
  await prisma.payment.createMany({
    data: [
      {
        userId: user.id,
        clientId: nexusClient.id,
        projectId: project3.id,
        invoiceNumber: 'INV-0001',
        title: 'Executive Analytics Dashboard – Final Delivery',
        amount: 6500.0,
        currency: 'USD',
        status: 'PAID',
        paymentMethod: 'BANK_TRANSFER',
        issueDate: pastMonth,
        dueDate: pastMonth,
        paidAt: pastMonth,
        notes: 'Wire transfer confirmed. Thank you!',
      },
      {
        userId: user.id,
        clientId: nexusClient.id,
        projectId: project1.id,
        invoiceNumber: 'INV-0002',
        title: 'Phase 1: Architecture Blueprint & DB Schemas',
        amount: 4500.0,
        currency: 'USD',
        status: 'PAID',
        paymentMethod: 'STRIPE',
        issueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        dueDate: now,
        paidAt: now,
        notes: 'Paid via Stripe invoice.',
      },
      {
        userId: user.id,
        clientId: acmeClient.id,
        projectId: project2.id,
        invoiceNumber: 'INV-0003',
        title: 'NextGen Customer Billing Portal – 50% Deposit',
        amount: 4100.0,
        currency: 'USD',
        status: 'SENT',
        paymentMethod: 'BANK_TRANSFER',
        issueDate: now,
        dueDate: futureTwoWeeks,
        notes: '50% initial kickoff payment.',
      },
      {
        userId: user.id,
        clientId: acmeClient.id,
        invoiceNumber: 'INV-0004',
        title: 'Legacy API Maintenance Retainer (Overdue)',
        amount: 1500.0,
        currency: 'USD',
        status: 'OVERDUE',
        paymentMethod: 'BANK_TRANSFER',
        issueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        notes: 'Reminder sent on due date.',
      },
    ],
  });

  console.log('✅ Created demo payments ($11,000 paid, $4,100 sent, $1,500 overdue).');

  // 8. Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        title: 'Deadline Approaching: Cloud Core Microservices Migration',
        message: 'Project is due in 3 days. Complete Phase 2 deliverables.',
        type: 'DEADLINE_WARNING',
        isRead: false,
        linkUrl: '/projects',
      },
      {
        userId: user.id,
        title: 'Payment Overdue: Invoice INV-0004',
        message: 'Invoice INV-0004 for Acme Enterprise Solutions ($1,500) is past due.',
        type: 'PAYMENT_DUE',
        isRead: false,
        linkUrl: '/payments',
      },
      {
        userId: user.id,
        title: 'Payment Received: Invoice INV-0002',
        message: 'Nexus FinTech Technologies paid $4,500 via Stripe.',
        type: 'SYSTEM',
        isRead: true,
        linkUrl: '/payments',
      },
    ],
  });

  console.log('✅ Created sample notifications.');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeder failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

