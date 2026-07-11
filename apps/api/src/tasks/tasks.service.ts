import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async createProject(data: Prisma.TaskProjectCreateInput) {
    return this.prisma.taskProject.create({ data });
  }

  async getProjects() {
    return this.prisma.taskProject.findMany({ include: { tasks: true } });
  }

  async createModule(data: Prisma.TaskModuleCreateInput) {
    return this.prisma.taskModule.create({ data });
  }

  async getModules() {
    return this.prisma.taskModule.findMany();
  }

  async createTask(data: Prisma.TaskCreateInput) {
    return this.prisma.task.create({ 
      data, 
      include: { assignee: true, reporter: true, project: true, module: true } 
    });
  }

  async getTasks(filters?: any) {
    return this.prisma.task.findMany({
      where: filters,
      include: {
        project: true,
        module: true,
        assignee: true,
        reporter: true,
        subtasks: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  async getTaskStats() {
    const tasks = await this.prisma.task.findMany();
    const total = tasks.length;
    const todo = tasks.filter(t => t.status === 'To Do').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed').length;
    
    return { total, todo, inProgress, completed, overdue };
  }

  async updateTaskStatus(taskId: string, newStatus: string, userId?: string) {
    const task = await this.prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus }
    });

    if (userId) {
      await this.prisma.taskHistory.create({
        data: {
          taskId: task.id,
          userId,
          action: `Status changed to ${newStatus}`
        }
      });
    }

    return task;
  }

  async updateTask(taskId: string, data: Prisma.TaskUpdateInput) {
    return this.prisma.task.update({ 
      where: { id: taskId }, 
      data, 
      include: { assignee: true, reporter: true, project: true, module: true } 
    });
  }
  
  async deleteTask(taskId: string) {
    return this.prisma.task.delete({ where: { id: taskId } });
  }

  async addComment(taskId: string, userId: string, content: string) {
    return this.prisma.taskComment.create({
      data: {
        taskId,
        userId,
        content
      },
      include: { user: true }
    });
  }
  
  async getComments(taskId: string) {
    return this.prisma.taskComment.findMany({
      where: { taskId },
      include: { user: true },
      orderBy: { createdAt: 'asc' }
    });
  }
}
