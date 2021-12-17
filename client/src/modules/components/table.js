import { useMemo, forwardRef, useRef, useEffect } from "react";
import BootstrapTable from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Pagination from "react-bootstrap/Pagination";
import {
  useTable,
  useFilters,
  usePagination,
  useSortBy,
  useRowSelect,
} from "react-table";
import { ChevronUp, ChevronDown, ChevronExpand } from "react-bootstrap-icons";

export function TextFilter({
  column: { filterValue, setFilter, placeholder, aria },
}) {
  return (
    <Form.Control
      value={filterValue || ""}
      onChange={(e) => setFilter(e.target.value || undefined)}
      placeholder={placeholder || `Search...`}
      aria-label={aria}
    />
  );
}

export function RangeFilter({
  column: { filterValue = [], setFilter, minPlaceholder, maxPlaceholder, aria },
}) {
  const getInputValue = (ev) =>
    ev.target.value ? parseInt(ev.target.value, 10) : undefined;

  return (
    <InputGroup className="flex-nowrap">
      <Form.Control
        placeholder={minPlaceholder || "Min value"}
        type="number"
        value={filterValue[0] || ""}
        onChange={(e) => setFilter((old = []) => [getInputValue(e), old[1]])}
        aria-label={aria + " Min"}
      />
      <Form.Control
        placeholder={maxPlaceholder || "Max value"}
        type="number"
        value={filterValue[1] || ""}
        onChange={(e) => setFilter((old = []) => [old[0], getInputValue(e)])}
        aria-label={aria + " Max"}
      />
    </InputGroup>
  );
}

const IndeterminateCheckbox = forwardRef(({ indeterminate, ...rest }, ref) => {
  const defaultRef = useRef();
  const resolvedRef = ref || defaultRef;

  useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);

  return <input type="radio" ref={resolvedRef} {...rest} />;
});

export default function Table({ columns, data, options, useHooks = {} }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    rows,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns: useMemo((_) => columns, [columns]),
      data: useMemo((_) => data, [data]),
      defaultColumn: useMemo(
        (_) => ({
          Filter: TextFilter,
        }),
        [],
      ),

      ...options,
    },
    useFilters,
    useSortBy,
    usePagination,
    useRowSelect,

    (hooks) => {
      if (useHooks.rowSelect) {
        hooks.visibleColumns.push((columns) => [
          {
            id: "selection",
            disableSortBy: true,
            Cell: ({ row }) => (
              <div className="d-flex justify-content-center">
                <IndeterminateCheckbox
                  {...row.getToggleRowSelectedProps()}
                  title={Object.values(row.values)[0]}
                />
              </div>
            ),
          },
          ...columns,
        ]);
      }
    },
  );

  return (
    <>
      <div className="table-responsive">
        <BootstrapTable {...getTableProps()} hover bordered size="sm">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render("Header")}
                    {column.isSorted ? (
                      column.isSortedDesc ? (
                        <ChevronDown />
                      ) : (
                        <ChevronUp />
                      )
                    ) : (
                      !column.disableSortBy && (
                        <ChevronExpand className="ms-1" />
                      )
                    )}
                  </th>
                ))}
              </tr>
            ))}
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <td {...column.getHeaderProps()}>
                    <div>
                      {column.canFilter ? column.render("Filter") : null}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </thead>

          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr
                  {...row.getRowProps()}
                  onClick={() => {
                    if (useHooks.rowSelect) {
                      const { toggleRowSelected } = row;
                      toggleRowSelected(row.id, true);
                    }
                  }}>
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </BootstrapTable>
      </div>

      <div className="d-flex flex-wrap align-items-center justify-content-between p-3">
        <div>
          Showing rows {(1 + pageIndex * pageSize).toLocaleString()}-
          {Math.min(rows.length, (pageIndex + 1) * pageSize).toLocaleString()}{" "}
          of {rows.length.toLocaleString()}
        </div>

        <div className="d-flex">
          <Form.Control
            as="select"
            className="mr-2"
            name="select-page-size"
            aria-label="Select page size"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}>
            {[10, 25, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </Form.Control>

          <Pagination className="mb-0">
            <Pagination.First
              onClick={() => gotoPage(0)}
              disabled={!canPreviousPage}>
              First
            </Pagination.First>
            <Pagination.Prev
              onClick={() => previousPage()}
              disabled={!canPreviousPage}>
              Previous
            </Pagination.Prev>
            <Pagination.Next onClick={() => nextPage()} disabled={!canNextPage}>
              Next
            </Pagination.Next>
            <Pagination.Last
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}>
              Last
            </Pagination.Last>
          </Pagination>
        </div>
      </div>
    </>
  );
}
