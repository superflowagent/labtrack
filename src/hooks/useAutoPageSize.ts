import { useEffect, useState } from 'react'

export interface UseAutoPageSizeOptions {
    /** Estimated/default row height in pixels (used if rows are not yet rendered) */
    rowHeight?: number
    /** Estimated/default header height in pixels */
    headerHeight?: number
    /** Minimum number of rows to show */
    minRows?: number
    /** Maximum number of rows to show */
    maxRows?: number
    /** Fallback/default page size */
    defaultRows?: number
}

/**
 * Compute a dynamic `pageSize` for table pagination based on the available
 * height of a container element. The hook measures the container and the
 * rendered table (if present) and returns the number of rows that fit.
 *
 * Usage: pass a ref to the scrollable container that directly wraps the
 * `<table>` (the element with `overflow-auto`). The hook updates on resize.
 */
export default function useAutoPageSize(
    containerRef: React.RefObject<HTMLElement | null>,
    opts: UseAutoPageSizeOptions = {}
) {
    const {
        rowHeight = 44, // tailwind `h-11` default used in this project
        headerHeight = 40, // tailwind `h-10`
        minRows = 6,
        maxRows = 200,
        defaultRows = 50,
    } = opts

    const [pageSize, setPageSize] = useState<number>(defaultRows)

    useEffect(() => {
        const el = containerRef?.current
        if (!el) return

        const compute = () => {
            // find the table (if rendered) inside the container
            const table = el.querySelector('table') as HTMLElement | null

            // measure header height if possible
            const thead = table?.querySelector('thead') as HTMLElement | null
            const measuredHeader = thead?.offsetHeight ?? headerHeight

            // measure first body row height if possible
            const firstRow = table?.querySelector('tbody tr') as HTMLElement | null
            const measuredRow = firstRow?.offsetHeight ?? rowHeight

            const available = Math.max(0, el.clientHeight - measuredHeader)
            const rowsThatFit = Math.floor(available / Math.max(1, measuredRow))
            const clamped = Math.min(maxRows, Math.max(minRows, rowsThatFit || defaultRows))

            setPageSize((prev) => (prev === clamped ? prev : clamped))
        }

        // initial compute
        compute()

        // observe container size changes
        const ro = new ResizeObserver(() => compute())
        ro.observe(el)

        // also observe the table itself (rows may change)
        const tableEl = el.querySelector('table')
        if (tableEl) ro.observe(tableEl)

        // window resize fallback
        window.addEventListener('resize', compute)

        return () => {
            ro.disconnect()
            window.removeEventListener('resize', compute)
        }
    }, [containerRef, rowHeight, headerHeight, minRows, maxRows, defaultRows])

    return pageSize
}
