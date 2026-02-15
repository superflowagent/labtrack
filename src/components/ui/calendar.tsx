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
            classNames={{
                nav: "flex items-center justify-between mb-2",
                nav_button: "inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800",
                caption: "text-sm font-medium text-slate-900 dark:text-slate-100 mb-2",
                caption_label: "text-sm font-medium",
                table: "w-full",
                head_row: "text-xs",
                head_cell: "text-left text-xs font-medium text-slate-500",
                weekday: "text-xs text-slate-500",
                row: "",
                cell: "p-0",
                day: "h-9 w-9 m-0 rounded-lg hover:bg-teal-50 hover:text-teal-700 transition-colors",
                day_selected: "bg-teal-600 text-white",
                day_today: "bg-teal-50 text-teal-700",
                day_outside: "text-muted-foreground",
                day_disabled: "opacity-40 cursor-not-allowed",
            }}
            components={{
                IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4 text-teal-600" {...props} />,
                IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4 text-teal-600" {...props} />,
            }}
            locale={undefined}
        />
    )
}
