import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(private prisma: PrismaService) {}

  async getActiveStorageConfig() {
    const config = await this.prisma.storageConfig.findFirst({
      where: { isActive: true },
    });
    return config || ({ providerName: 'LOCAL' } as any);
  }

  async uploadFile(file: any): Promise<string> {
    const config = await this.getActiveStorageConfig();
    const ext = path.extname(file.originalname);
    const fileName = `${uuidv4()}${ext}`;

    if (config.providerName === 'AWS_S3' && config.accessKey && config.secretKey && config.bucketName && config.region) {
      this.logger.log(`Uploading file ${fileName} to AWS S3...`);
      const s3 = new S3Client({
        region: config.region as string,
        credentials: {
          accessKeyId: config.accessKey as string,
          secretAccessKey: config.secretKey as string,
        },
      });

      const command = new PutObjectCommand({
        Bucket: config.bucketName as string,
        Key: `uploads/${fileName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3.send(command);
      return `https://${config.bucketName}.s3.${config.region}.amazonaws.com/uploads/${fileName}`;
    }

    // Default to LOCAL storage
    this.logger.log(`Uploading file ${fileName} locally...`);
    const uploadDir = path.join(process.cwd(), 'apps', 'web', 'public', 'uploads');
    
    // Ensure directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, file.buffer);
    
    // Return relative URL for local serving
    return `/uploads/${fileName}`;
  }
}
