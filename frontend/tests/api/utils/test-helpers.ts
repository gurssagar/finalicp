// Utility helpers for testing

export interface TestTiming {
  start: number;
  end?: number;
  duration?: number;
}

export class TestHelpers {
  // Timing utilities
  static startTimer(): TestTiming {
    return { start: Date.now() };
  }

  static endTimer(timer: TestTiming): TestTiming {
    timer.end = Date.now();
    timer.duration = timer.end - timer.start;
    return timer;
  }

  static async measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const timer = this.startTimer();
    const result = await fn();
    this.endTimer(timer);
    return { result, duration: timer.duration! };
  }

  // Random data utilities
  static randomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static randomEmail(): string {
    const domains = ['example.com', 'test.com', 'demo.com', 'mock.com'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `test-${this.randomString(8)}@${domain}`;
  }

  static randomPhone(): string {
    return `+1${Math.random().toString().substr(2, 10)}`;
  }

  static randomId(prefix: string = 'TEST'): string {
    return `${prefix}-${this.randomString(8).toUpperCase()}`;
  }

  static randomUrl(): string {
    return `https://example.com/${this.randomString(8)}`;
  }

  // Array utilities
  static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static pickRandom<T>(array: T[]): T | undefined {
    return array[Math.floor(Math.random() * array.length)];
  }

  static pickMultiple<T>(array: T[], count: number): T[] {
    const shuffled = this.shuffleArray(array);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  // Date utilities
  static randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  static randomFutureDays(maxDays: number = 30): number {
    return Math.floor(Math.random() * maxDays) + 1;
  }

  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // String utilities
  static truncateString(str: string, maxLength: number): string {
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  }

  static generateLoremIpsum(sentences: number = 3): string {
    const words = [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
      'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
      'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
      'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
      'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
      'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint'
    ];

    let result = '';
    for (let i = 0; i < sentences; i++) {
      const sentenceLength = Math.floor(Math.random() * 10) + 5;
      const sentence = [];
      for (let j = 0; j < sentenceLength; j++) {
        sentence.push(words[Math.floor(Math.random() * words.length)]);
      }
      result += sentence.join(' ') + '. ';
    }

    return result.trim();
  }

  // Numeric utilities
  static randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static randomFloat(min: number, max: number, decimals: number = 2): number {
    const num = Math.random() * (max - min) + min;
    return Number(num.toFixed(decimals));
  }

  static randomBoolean(): boolean {
    return Math.random() < 0.5;
  }

  // File utilities
  static randomFileSize(maxSizeMB: number = 10): number {
    return Math.floor(Math.random() * maxSizeMB * 1024 * 1024);
  }

  static randomFileName(extension: string = 'jpg'): string {
    return `test-${this.randomString(8)}.${extension}`;
  }

  // Validation utilities
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isValidId(id: string, prefix: string = ''): boolean {
    if (prefix && !id.startsWith(prefix)) {
      return false;
    }
    return id.length >= 5 && /^[A-Za-z0-9-]+$/.test(id);
  }

  // Delay utilities
  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async retry<T>(fn: () => Promise<T>, maxAttempts: number = 3, delayMs: number = 1000): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxAttempts) {
          await this.delay(delayMs * attempt);
        }
      }
    }

    throw lastError!;
  }

  // Data generation utilities
  static generateTestUsers(count: number): Array<{ id: string; email: string; name: string }> {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push({
        id: this.randomId('USER'),
        email: this.randomEmail(),
        name: `Test User ${i + 1}`
      });
    }
    return users;
  }

  static generateTestCategories(): string[] {
    return [
      'Technology', 'Design', 'Marketing', 'Business', 'Writing',
      'Video', 'Audio', 'Photography', 'Consulting', 'Education'
    ];
  }

  static generateTestTags(count: number = 5): string[] {
    const baseTags = [
      'professional', 'expert', 'quality', 'fast', 'reliable',
      'affordable', 'creative', 'modern', 'custom', 'premium'
    ];
    return this.pickMultiple(baseTags, count);
  }

  // HTTP response utilities
  static isSuccessResponse(status: number): boolean {
    return status >= 200 && status < 300;
  }

  static isErrorResponse(status: number): boolean {
    return status >= 400;
  }

  static isClientError(status: number): boolean {
    return status >= 400 && status < 500;
  }

  static isServerError(status: number): boolean {
    return status >= 500;
  }

  // Test data cleanup utilities
  static async cleanupCreated<T>(
    createdItems: T[],
    cleanupFn: (item: T) => Promise<void>
  ): Promise<void> {
    const cleanupPromises = createdItems.map(item =>
      cleanupFn(item).catch(error =>
        console.warn('Cleanup failed for item:', item, error)
      )
    );
    await Promise.all(cleanupPromises);
  }

  // Environment utilities
  static isTestEnvironment(): boolean {
    return process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
  }

  static isProductionEnvironment(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  // Memory and performance utilities
  static getMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }

  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Console utilities for better test output
  static logTestStart(testName: string): void {
    console.log(`\n🧪 Starting: ${testName}`);
    console.log('─'.repeat(50));
  }

  static logTestEnd(testName: string, success: boolean, duration?: number): void {
    const status = success ? '✅ PASSED' : '❌ FAILED';
    const durationText = duration ? ` (${duration}ms)` : '';
    console.log(`${status}: ${testName}${durationText}`);
    console.log('─'.repeat(50));
  }

  static logStep(stepName: string): void {
    console.log(`  📋 ${stepName}`);
  }

  static logError(error: string | Error): void {
    const message = error instanceof Error ? error.message : error;
    console.log(`  ❌ Error: ${message}`);
  }

  static logSuccess(message: string): void {
    console.log(`  ✅ ${message}`);
  }
}