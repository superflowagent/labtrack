import { createContext, useContext } from 'react'
import type { AppActor } from '@/types/domain'

export const ActorContext = createContext<AppActor | null>(null)

export const useActor = () => {
    const actor = useContext(ActorContext)
    if (!actor) {
        throw new Error('ActorContext is not available')
    }
    return actor
}