/* eslint-disable @typescript-eslint/no-explicit-any */

type DenoEnv = {
    get(key: string): string | undefined
}

type DenoServeHandler = (req: Request) => Response | Promise<Response>

type DenoServe = (handler: DenoServeHandler) => void

type DenoRuntime = {
    env: DenoEnv
    serve: DenoServe
}

declare global {
    const Deno: DenoRuntime
}

declare module "npm:stripe@12.6.0" {
    const Stripe: any
    export default Stripe
}

declare module "https://deno.land/std@0.168.0/http/server.ts" {
    export const serve: any
}

export { }
