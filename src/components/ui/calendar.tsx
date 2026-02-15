import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { cn } from "../../lib/utils"

export interface CalendarProps {
    mode: "single" | "multiple" | "range"
    selected: Date | undefined
    onSelect: (date: Date | undefined) => void
    initialFocus?: boolean
}

export function Calendar({ mode, selected, onSelect, initialFocus }: CalendarProps) {
    return (
        <DayPicker
            mode={mode}
            selected={selected}
            onSelect={onSelect}
            initialFocus={initialFocus}
            className={cn("rounded-md border bg-white p-3 shadow dark:bg-slate-900")}
            components={{
                IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" {...props} />,
                IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" {...props} />,
            }}
            locale={undefined}
        />
    )
}
