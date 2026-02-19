import type { PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'

type LegalPageLayoutProps = PropsWithChildren<{
    title: string
}>

export const LegalPageLayout = ({ title, children }: LegalPageLayoutProps) => {
    return (
        <div className="min-h-screen bg-background text-slate-900 dark:text-foreground">
            <header className="border-b border-slate-200/80 bg-background/95 backdrop-blur">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
                    <Logo />
                    <Button asChild variant="ghost" size="sm" className="text-slate-600 dark:text-slate-300">
                        <Link to="/#footer" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" /> Volver
                        </Link>
                    </Button>
                </div>
            </header>

            <main className="px-6 py-10 sm:py-14">
                <article className="mx-auto max-w-4xl rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-10">
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
                    <div className="mt-8 space-y-8 text-slate-700">{children}</div>
                </article>
            </main>
        </div>
    )
}
