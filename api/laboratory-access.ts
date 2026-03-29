import { handleLaboratoryAccessRequest } from './laboratory-access-shared.js'

export default async function handler(
    req: { method: string; body: unknown; headers?: Record<string, string | string[]> },
    res: {
        status: (code: number) => { json: (data: unknown) => unknown }
        json: (data: unknown) => unknown
    },
) {
    return handleLaboratoryAccessRequest(req, res)
}