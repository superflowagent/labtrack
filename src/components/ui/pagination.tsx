"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface PaginationProps {
    total: number
    page: number
    pageSize: number
    onPageChange: (p: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({
    total,
    page,
    pageSize,
    onPageChange,
}) => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const start = total === 0 ? 0 : (page - 1) * pageSize + 1
    const end = Math.min(total, page * pageSize)

    return (
        <div className="flex items-center justify-between w-full">
            <div className="text-sm text-slate-500">Mostrando {start}-{end} de {total}</div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1} aria-label="Página anterior">
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="text-sm text-slate-700">Página {page} / {totalPages}</div>

                <Button variant="ghost" size="sm" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages} aria-label="Página siguiente">
                    <ChevronRight className="h-4 w-4" />
                </Button>


            </div>
        </div>
    )
}

Pagination.displayName = "Pagination"
