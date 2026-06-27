import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT || 6379),
      lazyConnect: true,
      enableOfflineQueue: false,
      connectTimeout: 500,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });

    this.redis.on('error', () => undefined);
  }

  async get(key: string): Promise<string | null> {
    try {
      if (this.redis.status === 'wait') {
        await this.redis.connect();
      }

      return await this.redis.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlInSeconds: number): Promise<void> {
    try {
      if (this.redis.status === 'wait') {
        await this.redis.connect();
      }

      await this.redis.set(key, value, 'EX', ttlInSeconds);
    } catch {
      // Redis é cache auxiliar. Se falhar, a API continua usando PostgreSQL.
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (this.redis.status === 'wait') {
        await this.redis.connect();
      }

      await this.redis.del(key);
    } catch {
      // Falha no Redis não deve bloquear operações críticas do estoque.
    }
  }

  async onModuleDestroy() {
    try {
      await this.redis.quit();
    } catch {
      // Redis pode estar indisponivel; encerramento da API nao deve falhar por isso.
    }
  }
}
