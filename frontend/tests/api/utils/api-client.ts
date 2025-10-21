// Enhanced API client for testing with better error handling and utilities

import { TEST_CONFIG } from '../test-setup';
import { TestHelpers } from './test-helpers';

export interface ApiResponse<T = any> {
  response: Response;
  data: T;
  duration: number;
  headers: Record<string, string>;
}

export class ApiClient {
  private baseUrl: string;
  private apiBase: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = TEST_CONFIG.baseUrl, apiBase: string = TEST_CONFIG.apiBase) {
    this.baseUrl = baseUrl;
    this.apiBase = apiBase;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'ICPWork-Tests/1.0'
    };
  }

  // Enhanced makeApiCall with better error handling and timing
  async makeRequest<T = any>(
    endpoint: string,
    method: string = 'GET',
    body?: any,
    options: {
      headers?: Record<string, string>;
      timeout?: number;
      expectedStatus?: number;
      retries?: number;
    } = {}
  ): Promise<ApiResponse<T>> {
    const { headers = {}, timeout = 30000, expectedStatus = 200, retries = 0 } = options;

    const url = `${this.baseUrl}${this.apiBase}${endpoint}`;
    const requestHeaders = { ...this.defaultHeaders, ...headers };

    const timer = TestHelpers.startTimer();

    try {
      const response = await this.fetchWithTimeout(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        timeout
      });

      TestHelpers.endTimer(timer);

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const data = await response.json();

      // Validate expected status
      if (response.status !== expectedStatus) {
        throw new Error(`Expected status ${expectedStatus}, got ${response.status}: ${JSON.stringify(data)}`);
      }

      return {
        response,
        data,
        duration: timer.duration!,
        headers: responseHeaders
      };
    } catch (error) {
      TestHelpers.endTimer(timer);

      if (retries > 0 && this.shouldRetry(error)) {
        TestHelpers.logError(`Request failed, retrying... (${retries} retries left)`);
        await TestHelpers.delay(1000);
        return this.makeRequest<T>(endpoint, method, body, { ...options, retries: retries - 1 });
      }

      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  // HTTP method helpers
  async get<T = any>(endpoint: string, options?: Parameters<typeof this.makeRequest>[2]): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, 'GET', undefined, options);
  }

  async post<T = any>(endpoint: string, body: any, options?: Parameters<typeof this.makeRequest>[2]): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, 'POST', body, options);
  }

  async put<T = any>(endpoint: string, body: any, options?: Parameters<typeof this.makeRequest>[2]): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, 'PUT', body, options);
  }

  async delete<T = any>(endpoint: string, options?: Parameters<typeof this.makeRequest>[2]): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, 'DELETE', undefined, options);
  }

  async patch<T = any>(endpoint: string, body: any, options?: Parameters<typeof this.makeRequest>[2]): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, 'PATCH', body, options);
  }

  // Batch request utilities
  async makeBatchRequests<T = any>(
    requests: Array<{
      endpoint: string;
      method?: string;
      body?: any;
      options?: any;
    }>
  ): Promise<ApiResponse<T>[]> {
    const promises = requests.map(request =>
      this.makeRequest<T>(
        request.endpoint,
        request.method || 'GET',
        request.body,
        request.options
      )
    );

    return Promise.all(promises);
  }

  async makeSequentialRequests<T = any>(
    requests: Array<{
      endpoint: string;
      method?: string;
      body?: any;
      options?: any;
    }>
  ): Promise<ApiResponse<T>[]> {
    const results: ApiResponse<T>[] = [];

    for (const request of requests) {
      try {
        const result = await this.makeRequest<T>(
          request.endpoint,
          request.method || 'GET',
          request.body,
          request.options
        );
        results.push(result);
      } catch (error) {
        TestHelpers.logError(`Sequential request failed: ${request.endpoint}`);
        throw error;
      }
    }

    return results;
  }

  // Streaming utilities for large responses
  async getStream(endpoint: string): Promise<ReadableStream> {
    const url = `${this.baseUrl}${this.apiBase}${endpoint}`;
    const response = await fetch(url, {
      headers: this.defaultHeaders
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Response body is not available');
    }

    return response.body;
  }

  // File upload utilities
  async uploadFile(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, JSON.stringify(value));
      });
    }

    const url = `${this.baseUrl}${this.apiBase}${endpoint}`;
    const timer = TestHelpers.startTimer();

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      TestHelpers.endTimer(timer);

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const data = await response.json();

      return {
        response,
        data,
        duration: timer.duration!,
        headers: responseHeaders
      };
    } catch (error) {
      TestHelpers.endTimer(timer);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  // Health check utilities
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; latency: number; timestamp: string }> {
    const timer = TestHelpers.startTimer();

    try {
      const response = await this.get('/test', { expectedStatus: 200, timeout: 5000 });
      TestHelpers.endTimer(timer);

      return {
        status: 'healthy',
        latency: timer.duration!,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      TestHelpers.endTimer(timer);
      return {
        status: 'unhealthy',
        latency: timer.duration!,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Utilities for testing rate limiting
  async testRateLimit(endpoint: string, requestCount: number, intervalMs: number = 100): Promise<{
    successCount: number;
    errorCount: number;
    averageLatency: number;
    errors: string[];
  }> {
    const results = {
      successCount: 0,
      errorCount: 0,
      totalLatency: 0,
      errors: [] as string[]
    };

    for (let i = 0; i < requestCount; i++) {
      try {
        const response = await this.get(endpoint);
        results.successCount++;
        results.totalLatency += response.duration;
      } catch (error) {
        results.errorCount++;
        results.errors.push(error instanceof Error ? error.message : String(error));
      }

      if (i < requestCount - 1) {
        await TestHelpers.delay(intervalMs);
      }
    }

    return {
      ...results,
      averageLatency: results.successCount > 0 ? results.totalLatency / results.successCount : 0
    };
  }

  // Private helper methods
  private async fetchWithTimeout(url: string, options: RequestInit & { timeout?: number }): Promise<Response> {
    const { timeout = 30000 } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private shouldRetry(error: any): boolean {
    if (error instanceof Error) {
      // Retry on network errors and 5xx server errors
      return error.message.includes('fetch') ||
             error.message.includes('timeout') ||
             error.message.includes('Network error') ||
             error.message.includes('status 5');
    }
    return false;
  }

  // Statistics and monitoring utilities
  async measureEndpointPerformance(endpoint: string, iterations: number = 10): Promise<{
    endpoint: string;
    iterations: number;
    averageLatency: number;
    minLatency: number;
    maxLatency: number;
    p95Latency: number;
    successRate: number;
    errorCount: number;
  }> {
    const latencies: number[] = [];
    let errorCount = 0;

    for (let i = 0; i < iterations; i++) {
      try {
        const response = await this.get(endpoint);
        latencies.push(response.duration);
      } catch (error) {
        errorCount++;
      }
    }

    if (latencies.length === 0) {
      throw new Error('All requests failed');
    }

    latencies.sort((a, b) => a - b);
    const p95Index = Math.floor(latencies.length * 0.95);
    const p95Latency = latencies[p95Index];

    return {
      endpoint,
      iterations,
      averageLatency: latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length,
      minLatency: Math.min(...latencies),
      maxLatency: Math.max(...latencies),
      p95Latency,
      successRate: ((iterations - errorCount) / iterations) * 100,
      errorCount
    };
  }

  // Debug utilities
  logRequest(method: string, endpoint: string, body?: any): void {
    console.log(`🌐 ${method} ${endpoint}`);
    if (body) {
      console.log('  Body:', JSON.stringify(body, null, 2));
    }
  }

  logResponse(response: ApiResponse): void {
    console.log(`📡 Response: ${response.response.status} (${response.duration}ms)`);
    console.log('  Data:', JSON.stringify(response.data, null, 2));
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();