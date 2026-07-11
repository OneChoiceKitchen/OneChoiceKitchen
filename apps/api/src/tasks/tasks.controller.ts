import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('stats')
  async getTaskStats() {
    return this.tasksService.getTaskStats();
  }

  @Get('projects')
  async getProjects() {
    return this.tasksService.getProjects();
  }

  @Post('projects')
  async createProject(@Body() body: any) {
    return this.tasksService.createProject(body);
  }

  @Get('modules')
  async getModules() {
    return this.tasksService.getModules();
  }

  @Post('modules')
  async createModule(@Body() body: any) {
    return this.tasksService.createModule(body);
  }

  @Get()
  async getTasks(@Query() query: any) {
    return this.tasksService.getTasks(query);
  }

  @Post()
  async createTask(@Body() body: any, @Req() req: any) {
    const { title, description, projectId, moduleId, taskType, priority, status, assigneeId, dueDate, estimatedHours } = body;
    
    // Auto-generate taskId
    const taskId = 'TSK-' + Math.floor(1000 + Math.random() * 9000);
    const reporterId = req.user?.id;
    
    return this.tasksService.createTask({
      taskId,
      title,
      description,
      taskType: taskType || 'Feature',
      priority: priority || 'Medium',
      status: status || 'To Do',
      dueDate: dueDate ? new Date(dueDate) : null,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
      project: projectId ? { connect: { id: projectId } } : undefined,
      module: moduleId ? { connect: { id: moduleId } } : undefined,
      assignee: assigneeId ? { connect: { id: assigneeId } } : undefined,
      reporter: reporterId ? { connect: { id: reporterId } } : undefined,
    });
  }

  @Put(':id')
  async updateTask(@Param('id') id: string, @Body() body: any) {
    const updateData: any = { ...body };
    if (body.projectId) {
      updateData.project = { connect: { id: body.projectId } };
      delete updateData.projectId;
    }
    if (body.moduleId) {
      updateData.module = { connect: { id: body.moduleId } };
      delete updateData.moduleId;
    }
    if (body.assigneeId) {
      updateData.assignee = { connect: { id: body.assigneeId } };
      delete updateData.assigneeId;
    }
    if (body.dueDate) {
      updateData.dueDate = new Date(body.dueDate);
    }
    if (body.estimatedHours) {
      updateData.estimatedHours = parseFloat(body.estimatedHours);
    }
    if (body.actualHours) {
      updateData.actualHours = parseFloat(body.actualHours);
    }

    return this.tasksService.updateTask(id, updateData);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const userId = req.user?.id;
    return this.tasksService.updateTaskStatus(id, body.status, userId);
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string) {
    return this.tasksService.deleteTask(id);
  }

  @Get(':id/comments')
  async getComments(@Param('id') id: string) {
    return this.tasksService.getComments(id);
  }

  @Post(':id/comments')
  async addComment(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.tasksService.addComment(id, req.user?.id, body.content);
  }
}
