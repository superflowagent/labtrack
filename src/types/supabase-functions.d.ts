declare module 'stripe'

declare namespace Deno {
  const env: {
    get(name: string): string | undefined
  }
}

interface FetchEvent {
  request: Request
  respondWith(response: Promise<Response> | Response): void
}

declare function addEventListener(type: 'fetch', listener: (ev: FetchEvent) => void): void
