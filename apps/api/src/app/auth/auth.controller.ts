import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() body: Record<string, any>) {
    return this.authService.login(body.email, body.password);
  }

  @Post('request-otp')
  requestOtp(@Body() body: { phone?: string; email?: string; channel?: 'EMAIL' | 'SMS' | 'WHATSAPP' }) {
    return this.authService.requestOtp(body.phone || body.email || '', !!body.phone, body.channel || 'EMAIL');
  }

  @Post('verify-otp')
  verifyOtp(@Body() body: { phone?: string; email?: string; otp: string }) {
    return this.authService.verifyOtp(body.phone || body.email || '', body.otp, !!body.phone);
  }

  @Post('register')
  register(@Body() body: Record<string, any>) {
    return this.authService.register(body.name, body.email, body.password, body.mobile);
  }

  @Get('verify-email')
  verifyEmail(@Query('email') email: string, @Query('token') token: string) {
    return this.authService.verifyEmail(email, token);
  }

  @Post('forgot-password')
  requestPasswordReset(@Body() body: { email: string }) {
    return this.authService.requestPasswordReset(body.email);
  }

  @Post('reset-password')
  resetPassword(@Body() body: { email: string; otp: string; newPassword: string }) {
    return this.authService.resetPassword(body.email, body.otp, body.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: any) {
    return req.user;
  }

  @Post('social-login')
  socialLogin(@Body() body: Record<string, any>) {
    return this.authService.socialLogin(body.provider, body.token, body.email, body.name);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/setup')
  setupMfa(@Req() req: any) {
    return this.authService.generateMfaSecret(req.user.userId, req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/verify')
  verifyMfaSetup(@Req() req: any, @Body() body: { token: string }) {
    return this.authService.verifyAndEnableMfa(req.user.userId, body.token);
  }

  @Post('mfa/login')
  mfaLogin(@Body() body: { email: string; token: string }) {
    return this.authService.mfaLogin(body.email, body.token);
  }
}
