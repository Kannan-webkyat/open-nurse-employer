import * as React from "react"

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> { }

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div className="w-full overflow-visible">
        <table ref={ref} className={`w-full ${className}`} {...props}>
          {children}
        </table>
      </div>
    )
  }
)
Table.displayName = "Table"

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> { }

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={`bg-neutral-50 border-b border-neutral-200 ${className}`}
        {...props}
      />
    )
  }
)
TableHeader.displayName = "TableHeader"

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> { }

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={`bg-white divide-y divide-neutral-200 ${className}`}
        {...props}
      />
    )
  }
)
TableBody.displayName = "TableBody"

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> { }

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={`hover:bg-neutral-50 ${className}`}
        {...props}
      />
    )
  }
)
TableRow.displayName = "TableRow"

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> { }

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={`px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider ${className}`}
        {...props}
      />
    )
  }
)
TableHead.displayName = "TableHead"

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> { }

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={`px-6 py-2 whitespace-nowrap text-sm ${className}`}
        {...props}
      />
    )
  }
)
TableCell.displayName = "TableCell"

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }

