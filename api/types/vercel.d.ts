declare module '@vercel/node' {
  export interface VercelRequest {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    query?: Record<string, string>;
    body?: any;
  }

  export interface VercelResponse {
    status(code: number): VercelResponse;
    json(data: any): void;
    end(): void;
    setHeader(name: string, value: string): void;
  }
} 