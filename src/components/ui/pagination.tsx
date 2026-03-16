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
    // Defensive: ensure page/pageSize are finite positive integers to avoid NaN when parents
    const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.max(1, Math.floor(pageSize)) : 1
    const safePage = Number.isFinite(page) && page > 0 ? Math.max(1, Math.floor(page)) : 1

    const totalPages = Math.max(1, Math.ceil(total / safePageSize))
    const currentPage = Math.min(safePage, totalPages)
    const start = total === 0 ? 0 : (currentPage - 1) * safePageSize + 1
    const end = Math.min(total, currentPage * safePageSize)

    return (
        <div className="flex w-full items-end justify-between gap-3">
            <div className="self-end text-sm leading-none text-slate-500">Mostrando {start}-{end} de {total}</div>
            <div className="flex items-end gap-1.5">
                <Button variant="ghost" size="sm" className="h-7 self-end items-end px-2 pb-0" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} aria-label="Página anterior">
                    <ChevronLeft className="relative top-px h-3.5 w-3.5" />
                </Button>

                <div className="self-end text-sm leading-none text-slate-700">Página {currentPage} / {totalPages}</div>

                <Button variant="ghost" size="sm" className="h-7 self-end items-end px-2 pb-0" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages} aria-label="Página siguiente">
                    <ChevronRight className="relative top-px h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    )
}

Pagination.displayName = "Pagination"
