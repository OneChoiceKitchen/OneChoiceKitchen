import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class MapsService {

  constructor(private prisma: PrismaService) {}

  getConfigs() {
    return this.prisma.mapsConfig.findMany();
  }

  async upsertConfig(data: any) {
    const { providerName, id, isActive, createdAt, updatedAt, ...rest } = data;
    return this.prisma.mapsConfig.upsert({
      where: { providerName },
      update: rest,
      create: { providerName, ...rest, isActive: false },
    });
  }

  getActiveProvider() {
    return this.prisma.mapsConfig.findFirst({ where: { isActive: true } });
  }

  async setActiveProvider(id: string) {
    return this.prisma.$transaction(async (prisma) => {
      await prisma.mapsConfig.updateMany({ data: { isActive: false } });
      return prisma.mapsConfig.update({ where: { id }, data: { isActive: true } });
    });
  }

  async getRouteDistance(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
  ): Promise<{ distance: number; duration: number; unit: string }> {
    const provider = await this.getActiveProvider();
    if (!provider) {
      throw new HttpException('No active map provider configured', HttpStatus.BAD_REQUEST);
    }
    
    // We can just use the provider details internally.
    return this.calculateRoute(provider, originLat, originLng, destLat, destLng);
  }

  async testConfig(config: any) {
    try {
      if (config.providerName === 'GOOGLE_MAPS') {
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=51.5074,-0.1278&destinations=51.5074,-0.1278&key=${config.apiKey}`;
        const res = await axios.get(url);
        if (res.data.error_message) throw new Error(res.data.error_message);
        if (res.data.status === 'REQUEST_DENIED') throw new Error('Invalid API Key or API not enabled');
        return { success: true, message: 'Connection successful' };
      } else if (config.providerName === 'OPENSTREETMAP') {
        const baseUrl = config.routingApiUrl.replace(/\/$/, '');
        const url = `${baseUrl}/route/v1/driving/-0.1278,51.5074;-0.1278,51.5074?overview=false`;
        const res = await axios.get(url);
        if (res.data.code !== 'Ok') throw new Error(`OSRM Error: ${res.data.code}`);
        return { success: true, message: 'Connection successful' };
      }
      throw new Error('Unknown provider');
    } catch (e: any) {
      throw new HttpException({
        message: e.response?.data?.message || e.message || 'Connection failed'
      }, HttpStatus.BAD_REQUEST);
    }
  }

  private async calculateRoute(provider: any, originLat: number, originLng: number, destLat: number, destLng: number) {
    if (provider.providerName === 'GOOGLE_MAPS') {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destLat},${destLng}&key=${provider.apiKey}`;
      const res = await fetch(url);
      const data: any = await res.json();
      const element = data?.rows?.[0]?.elements?.[0];
      return {
        distance: element?.distance?.value ?? 0,
        duration: element?.duration?.value ?? 0,
        unit: 'meters',
      };
    } else {
      // OpenStreetMap / OSRM
      const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=false`;
      const res = await fetch(url);
      const data: any = await res.json();
      const route = data?.routes?.[0];
      return {
        distance: route?.distance ?? 0,
        duration: route?.duration ?? 0,
        unit: 'meters',
      };
    }
  }
}
