"use client"

import * as React from "react"
import { DepartmentCard, DepartmentCardProps } from "./DepartmentCard"

export interface DepartmentGridProps {
  departments: DepartmentCardProps[]
}

export function DepartmentGrid({ departments }: DepartmentGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {departments.map((department) => (
        <DepartmentCard
          key={department.name}
          name={department.name}
          leadName={department.leadName}
          email={department.email}
          phone={department.phone}
          icon={department.icon}
          color={department.color}
        />
      ))}
    </div>
  )
}
