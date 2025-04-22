"use client"

import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface DateRangePickerProps {
  value?: { start: Date; end: Date }
  onChange?: (value: { start: Date; end: Date } | undefined) => void
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal pl-8",
            !value && "text-muted-foreground"
          )}
        >
          <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          {value?.start ? (
            value.end ? (
              <>
                {format(value.start, "LLL dd, y")} -{" "}
                {format(value.end, "LLL dd, y")}
              </>
            ) : (
              format(value.start, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent
          initialFocus
          mode="range"
          defaultMonth={value?.start}
          selected={value ? { from: value.start, to: value.end } : undefined}
          onSelect={(range) => {
            if (range?.from && range?.to) {
              onChange?.({ start: range.from, end: range.to })
            } else {
              onChange?.(undefined)
            }
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
} 