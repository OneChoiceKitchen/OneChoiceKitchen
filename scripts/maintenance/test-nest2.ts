import { NestFactory } from '@nestjs/core';
import { AppModule } from './api/src/app/app.module';
import { MapsService } from './api/src/maps/maps.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const mapsService = app.get(MapsService);
  
  try {
    console.log('Testing upsert...');
    const result = await mapsService.upsertConfig({
      providerName: 'GOOGLE_MAPS',
      apiKey: 'test',
      mapId: 'test2'
    });
    console.log('Upsert Success:', result);
    
    console.log('Testing setActiveProvider...');
    const result2 = await mapsService.setActiveProvider(result.id);
    console.log('SetActive Success:', result2);

  } catch (e) {
    console.error('Test Failed:', e);
  }
  
  await app.close();
}
bootstrap();
