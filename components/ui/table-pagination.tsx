import * as React from "react"
import { Button } from "./button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

export interface TablePaginationProps {
  currentPage: number
  totalPages: number
  rowsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void
  onRowsPerPageChange?: (rows: number) => void
  rowsPerPageOptions?: number[]
}

export function TablePagination({
  currentPage,
  totalPages,
  rowsPerPage,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [ 5, 10, 15, 25, 50, 100],
}: TablePaginationProps) {
  return (
    <div className="bg-white px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
      <div className="flex items-center gap-4">
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
        <span className="text-sm text-neutral-500">
          Showing {Math.min((currentPage - 1) * rowsPerPage + 1, totalItems)} - {Math.min(currentPage * rowsPerPage, totalItems)} of {totalItems}
        </span>
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
        
        {(() => {
          const pageNumbers = [];
          const siblingCount = 1;
          
          // Always show first page
          pageNumbers.push(1);
          
          if (currentPage > siblingCount + 2) {
            pageNumbers.push('...');
          }
          
          let startPage = Math.max(2, currentPage - siblingCount);
          let endPage = Math.min(totalPages - 1, currentPage + siblingCount);
          
          for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
          }
          
          if (currentPage < totalPages - siblingCount - 1) {
            pageNumbers.push('...');
          }
          
          // Always show last page if visible and not already added
          if (totalPages > 1) {
            pageNumbers.push(totalPages);
          }
          
          return pageNumbers.map((page, index) => {
             if (page === '...') {
                return (
                  <span key={`ellipsis-${index}`} className="px-2 text-neutral-400">...</span>
                );
             }
             
             return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={
                  currentPage === page
                    ? "bg-sky-500 hover:bg-sky-600 text-white rounded-full w-8 h-8 p-0"
                    : "border-neutral-300"
                }
              >
                {page}
              </Button>
             );
          });
        })()}

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

