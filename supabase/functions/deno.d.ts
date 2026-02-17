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

export { }
