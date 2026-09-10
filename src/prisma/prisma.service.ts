import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
    
    // Extend Prisma Client globally to automatically supply updatedAt if missing
    return this.$extends({
      query: {
        $allModels: {
          async create({ args, query }) {
            if (args.data && typeof args.data === 'object') {
              // Automatically set updatedAt to now if it's omitted or undefined
              if ('updatedAt' in args.data && !args.data.updatedAt) {
                args.data.updatedAt = new Date();
              }
            }
            return query(args);
          },
          async update({ args, query }) {
            if (args.data && typeof args.data === 'object') {
              if ('updatedAt' in args.data && !args.data.updatedAt) {
                args.data.updatedAt = new Date();
              }
            }
            return query(args);
          },
        },
      },
    }) as unknown as PrismaService;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}