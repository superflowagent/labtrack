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
    const dpProps: any = {
        mode,
        selected,
        onSelect,
        initialFocus,
        required: false,
        className: cn("rounded-md border bg-white p-3 shadow dark:bg-slate-900"),
        components: {
            IconLeft: ({ ...props }: any) => <ChevronLeft className="h-4 w-4 text-teal-600" {...props} />,
            IconRight: ({ ...props }: any) => <ChevronRight className="h-4 w-4 text-teal-600" {...props} />,
        },
        locale: undefined,
    };

    return (
        <DayPicker {...dpProps} />
    )
}
