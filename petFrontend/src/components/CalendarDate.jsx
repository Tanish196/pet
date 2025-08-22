import * as React from "react"

import { Calendar } from "@/components/ui/calendar"

export function CalendarDate({date, setDate}) {
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border bg-lg text-black fixed z-9999"
      captionLayout="dropdown"
    />
  )
}