import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { join } from 'path';

const dbPath = join(process.cwd(), 'dev.db');
const url = `file:${dbPath}`;
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding tasks...');

  // 1. Ensure we have at least one User for assignee/reporter
  let user = await prisma.user.findFirst({
    where: { role: { name: 'ADMIN' } }
  });

  if (!user) {
    user = await prisma.user.findFirst();
  }

  // 2. Create a Project and Module
  const project = await prisma.taskProject.create({
    data: {
      name: 'Kitchen Operations System v2.0',
      description: 'Major overhaul of the kitchen display and order routing system.',
    }
  });

  const frontendModule = await prisma.taskModule.create({
    data: {
      name: 'Frontend UI',
      projectId: project.id
    }
  });

  const backendModule = await prisma.taskModule.create({
    data: {
      name: 'Backend API',
      projectId: project.id
    }
  });

  // 3. Create 10 diverse tasks
  const tasksToCreate = [
    {
      taskId: 'TSK-1001',
      title: 'Design new Kitchen Display Dashboard',
      description: 'Create wireframes and high-fidelity mockups for the new KDS.',
      taskType: 'UI/UX',
      priority: 'High',
      status: 'Completed',
      projectId: project.id,
      moduleId: frontendModule.id,
      assigneeId: user?.id,
      estimatedHours: 15,
      actualHours: 14.5,
      dueDate: new Date(new Date().setDate(new Date().getDate() - 5)), // Past due date
    },
    {
      taskId: 'TSK-1002',
      title: 'Implement WebSockets for live order updates',
      description: 'Ensure orders appear on the KDS immediately without polling.',
      taskType: 'Enhancement',
      priority: 'Critical',
      status: 'In Progress',
      projectId: project.id,
      moduleId: backendModule.id,
      assigneeId: user?.id,
      estimatedHours: 24,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 2)), // Due soon
    },
    {
      taskId: 'TSK-1003',
      title: 'Fix issue with delayed SMS notifications',
      description: 'Customers are reporting that delivery SMS arrives after food is delivered.',
      taskType: 'Bug',
      priority: 'High',
      status: 'To Do',
      projectId: project.id,
      moduleId: backendModule.id,
      assigneeId: user?.id,
      estimatedHours: 8,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    },
    {
      taskId: 'TSK-1004',
      title: 'Investigate missing surge pricing in some zones',
      description: 'Zone C is not applying the 1.5x surge pricing multiplier during peak hours.',
      taskType: 'Bug',
      priority: 'Critical',
      status: 'Blocked',
      projectId: project.id,
      moduleId: backendModule.id,
      assigneeId: user?.id,
      estimatedHours: 5,
      dueDate: new Date(new Date().setDate(new Date().getDate() - 1)), // Overdue
    },
    {
      taskId: 'TSK-1005',
      title: 'Add Drag and Drop to Kanban Board',
      description: 'Use @hello-pangea/dnd to allow moving tasks between statuses.',
      taskType: 'Feature',
      priority: 'Medium',
      status: 'UAT',
      projectId: project.id,
      moduleId: frontendModule.id,
      assigneeId: user?.id,
      estimatedHours: 10,
      dueDate: new Date(),
    },
    {
      taskId: 'TSK-1006',
      title: 'Write Unit Tests for Delivery Service',
      description: 'Coverage needs to be increased from 60% to 85% for the Delivery Service.',
      taskType: 'Enhancement',
      priority: 'Medium',
      status: 'Testing',
      projectId: project.id,
      moduleId: backendModule.id,
      assigneeId: user?.id,
      estimatedHours: 12,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    },
    {
      taskId: 'TSK-1007',
      title: 'Update Privacy Policy Page content',
      description: 'Legal team requested updates regarding new data retention policies.',
      taskType: 'Support',
      priority: 'Low',
      status: 'Backlog',
      projectId: project.id,
      moduleId: frontendModule.id,
      assigneeId: user?.id,
      estimatedHours: 2,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 14)),
    },
    {
      taskId: 'TSK-1008',
      title: 'Review PR for New Payment Gateway Integration',
      description: 'Review the Stripe API integration changes.',
      taskType: 'Feature',
      priority: 'High',
      status: 'Code Review',
      projectId: project.id,
      moduleId: backendModule.id,
      assigneeId: user?.id,
      estimatedHours: 4,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    },
    {
      taskId: 'TSK-1009',
      title: 'Wait on new Server hardware provisioning',
      description: 'Cannot proceed with load testing until new AWS instances are provisioned.',
      taskType: 'Support',
      priority: 'Medium',
      status: 'On Hold',
      projectId: project.id,
      moduleId: backendModule.id,
      assigneeId: user?.id,
      estimatedHours: 40,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    },
    {
      taskId: 'TSK-1010',
      title: 'Optimize Database Queries for Dashboard Stats',
      description: 'The admin dashboard is loading slowly due to unoptimized JOIN operations.',
      taskType: 'Enhancement',
      priority: 'High',
      status: 'To Do',
      projectId: project.id,
      moduleId: backendModule.id,
      assigneeId: user?.id,
      estimatedHours: 16,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
    }
  ];

  for (const t of tasksToCreate) {
    await prisma.task.upsert({
      where: { taskId: t.taskId },
      update: t,
      create: t,
    });
  }

  console.log('Successfully seeded 10 tasks, a project, and modules!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
