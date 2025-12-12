import * as React from "react"
import { Button } from "./button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

export interface TablePaginationProps {
  currentPage: number
  totalPages: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange?: (rows: number) => void
  rowsPerPageOptions?: number[]
}

export function TablePagination({
  currentPage,
  totalPages,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [ 5, 10, 15, 25, 50, 100],
}: TablePaginationProps) {
  return (
    <div className="bg-white px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-700">Rows</span>
        <select
          className="text-sm border border-neutral-300 rounded px-2 py-1 text-neutral-700"
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange?.(Number(e.target.value))}
        >
          {rowsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="border-neutral-300 text-neutral-700"
        >
          First
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="border-neutral-300"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className={
              currentPage === page
                ? "bg-sky-500 hover:bg-sky-600 text-white rounded-full w-8 h-8 p-0"
                : "border-neutral-300"
            }
          >
            {page}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="border-neutral-300"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="border-neutral-300 text-neutral-700"
        >
          Last
        </Button>
      </div>
    </div>
  )
}

