import { NestFactory } from '@nestjs/core';
import { AppModule } from './api/src/app/app.module';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const jwtService = app.get(JwtService);
  
  try {
    const payload = { sub: 'system', email: 'admin@system.local', roles: ['SUPER_ADMIN'] };
    const token = jwtService.sign(payload);
    console.log('Token generated');

    const res = await axios.get('http://127.0.0.1:3000/api/maps/config', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('API Response:', res.data);
  } catch (e: any) {
    console.error('API Error:', e.response?.data || e.message);
  }
  
  await app.close();
}
bootstrap();
