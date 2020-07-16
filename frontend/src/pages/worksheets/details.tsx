import React from 'react';
import './details.css';

const clone = (items: any) => items.map((item: any) => Array.isArray(item) ? clone(item) : item);

type WorksheetState = {
  contents: (string | number)[][];
};
type CellValue = string | number;

type CellProps = {
  rowIndex: number;
  columnIndex: number;
  value: CellValue;
  displayValue: CellValue;
  onChange: (rowIndex: number, cellIndex: number, value: CellValue) => any
}

const Cell = ({ rowIndex, columnIndex, value, displayValue, onChange }: CellProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [editing, setEditing] = React.useState(false);
  const handleChange = (event: React.FocusEvent<HTMLInputElement>) => {
    onChange(rowIndex, columnIndex, event.target.value);
    setEditing(false);
  };
  const cellMarkup = editing ? (
    <input
      ref={inputRef}
      type="text"
      defaultValue={value}
      onBlur={handleChange}
    />
  ) : <div>{displayValue}</div>;

  React.useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  return <td onDoubleClick={() => setEditing(true)}>{cellMarkup}</td>;
};

const MemoCell = React.memo(Cell);

const initialWorksheetState: WorksheetState = {
  contents: [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    [2, 3, 2, 3, 4, 5, 6, 7, 8, 9],
    [3, 4, 2, 3, 4, 5, 6, 7, 8, 9],
    [4, 5, 2, 3, 4, 5, 6, 7, 8, 9],
    [5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    [6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    [7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    [9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
  ],
};

function worksheetReducer(
  state: WorksheetState,
  action: { type: 'update'; payload: { rowIndex: number; columnIndex: number; value: CellValue } },
) {
  switch (action.type) {
    case 'update':
      const { payload: { rowIndex, columnIndex, value } } = action;
      const contentsCopy = clone(state.contents);

      contentsCopy[rowIndex][columnIndex] = value;

      return { ...state, contents: contentsCopy };
  }
}

export const Details = () => {
  const [worksheetState, dispatch] = React.useReducer(worksheetReducer, initialWorksheetState);
  const { contents: worksheetContents } = worksheetState;
  const columnsCount = worksheetContents[0].length;
  const columns = Array.from({ length: columnsCount });
  const rowsCount = worksheetContents.length;
  const rows = Array.from({ length: rowsCount });
  const handleChange = React.useCallback((rowIndex: number, columnIndex: number, value: CellValue) => {
    dispatch({ type: 'update', payload: { rowIndex, columnIndex, value } });
  }, [dispatch]);

  return (
    <table className="table table-bordered worksheet">
      <thead>
      <tr>
        <th style={{ width: 40 }} />
        {columns.map((_, columnIndex) => (
          <th
            scope="col"
            key={`heading-${columnIndex}`}
            className="text-center"
          >
            {String.fromCharCode(65 + columnIndex)}
          </th>
        ))}
      </tr>
      </thead>
      <tbody>
      {rows.map((_, rowIndex) => (
        <tr key={`row-${rowIndex}`}>
          <th scope="row" className="text-left">{rowIndex + 1}</th>
          {columns.map((_, columnIndex) => {
            const value = worksheetContents[rowIndex][columnIndex];

            return (
              <MemoCell
                key={`cell-${rowIndex}-${columnIndex}`}
                columnIndex={columnIndex}
                rowIndex={rowIndex}
                value={value}
                displayValue={value}
                onChange={handleChange}
              />
            );
          })}
        </tr>
      ))}
      </tbody>
    </table>
  );
};
