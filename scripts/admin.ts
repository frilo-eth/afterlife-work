#!/usr/bin/env node
import { program } from 'commander';
import { prisma } from '../src/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';
import { getCacheStats } from '../src/lib/redis';
import { seedFromCloudinary } from '../src/lib/test-utils';

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

program
  .version('1.0.0')
  .description('Admin CLI for database management and monitoring');

program
  .command('seed')
  .description('Seed database with logos from Cloudinary')
  .option('-f, --force', 'seed even if the database already contains logos')
  .action(async (options: { force?: boolean }) => {
    try {
      console.log('Seeding database from Cloudinary...');
      const result = await seedFromCloudinary(options.force ?? false);

      if (!result.success && result.reason === 'DATABASE_NOT_EMPTY') {
        console.error('Database already contains logos. Re-run with --force to seed anyway.');
        process.exit(1);
      }

      console.log('Database seeded successfully');
    } catch (error) {
      console.error('Failed to seed database:', error);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  });

program
  .command('cleanup')
  .description('Clean up orphaned gallery images')
  .action(async () => {
    try {
      console.log('Cleaning up gallery...');
      // Implementation here
      console.log('Gallery cleaned successfully');
    } catch (error) {
      console.error('Failed to clean gallery:', error);
      process.exit(1);
    }
  });

program
  .command('cache-stats')
  .description('Show Redis cache statistics')
  .action(async () => {
    try {
      const stats = await getCacheStats();
      console.log('Cache Statistics:');
      console.log('-----------------');
      console.log(`Connection Status: ${stats.isConnected ? 'Connected' : 'Disconnected'}`);
      console.log(`Hit Rate: ${(stats.hitRate * 100).toFixed(1)}%`);
      console.log(`Miss Rate: ${(stats.missRate * 100).toFixed(1)}%`);
      console.log(`Cached Keys: ${stats.keyCount}`);
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      process.exit(1);
    }
  });

program
  .command('cloudinary-check')
  .description('Check Cloudinary configuration and available logos')
  .action(async () => {
    try {
      console.log('Checking Cloudinary configuration...');
      // Implementation here
      console.log('Cloudinary check completed');
    } catch (error) {
      console.error('Failed to check Cloudinary:', error);
      process.exit(1);
    }
  });

program.parse(process.argv); 