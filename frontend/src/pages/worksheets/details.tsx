import React from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import { useParams, Link } from 'react-router-dom';
import './details.css';
import { CellValue, get, Worksheet } from '../../api/worksheets';

enum Keys {
  A = 65,
  ENTER = 13,
  ESC = 27
}

const ROW_INDEX_PATTERN = /[0-9]+/;
const CELL_INDEX_PATTERN = /[A-Z]+/;
const CELL_REFERENCE_PATTERN = /^[A-Z]+[0-9]+$/;

const clone = (items: any) => items.map((item: any) => Array.isArray(item) ? clone(item) : item);

// We could add some memoization here I guess
const isLikeFormula = (value: CellValue): value is string => typeof value === 'string' && value.startsWith('=');
const displayValue = (rowIndex: number, columnIndex: number, worksheetContents: CellValue[][]): CellValue => {
  const value = worksheetContents[rowIndex][columnIndex];

  try {
    if (isLikeFormula(value)) {
      // Simplified approach to support addition only
      return value.replace('=', '').split('+').reduce((sum: number, currentCell: string) => {
        let cellValue: number | string;

        if (currentCell.match(CELL_REFERENCE_PATTERN)) {
          const cellColumnIndex = currentCell.match(CELL_INDEX_PATTERN)![0].charCodeAt(0) - Keys.A;
          const cellRowIndex = parseInt(currentCell.match(ROW_INDEX_PATTERN)![0]) - 1;
          const result = worksheetContents[cellRowIndex][cellColumnIndex];

          if (cellColumnIndex === columnIndex && cellRowIndex === rowIndex) {
            throw Error('Cannot reference itself');
          }

          cellValue = isLikeFormula(result) ? displayValue(cellRowIndex, cellColumnIndex, worksheetContents) : result;
        } else {
          cellValue = parseFloat(currentCell);
        }

        if (typeof cellValue !== 'number' || isNaN(cellValue)) {
          throw Error('Not a number');
        }

        return sum + cellValue;
      }, 0);
    }
  } catch (error) {
    return '#REF!';
  }

  return value;
};

type WorksheetState = { worksheet?: Worksheet };

type CellProps = {
  rowIndex: number;
  columnIndex: number;
  value: CellValue;
  displayValue: CellValue;
  onChange: (rowIndex: number, cellIndex: number, value: CellValue) => any
}

const Cell = React.memo(({ rowIndex, columnIndex, value, displayValue, onChange }: CellProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [editing, setEditing] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const quitEditing = () => {
    setEditing(false);
    setActive(false);
  };
  const handleChange = (event: React.FocusEvent<HTMLInputElement>) => {
    const { value } = event.target;
    let cellValue = isLikeFormula(value) ? value : parseFloat(value);

    if (typeof cellValue === 'number' && isNaN(cellValue)) {
      cellValue = value;
    }

    onChange(rowIndex, columnIndex, cellValue);
    quitEditing();
  };
  const handleKeyUp = ({ keyCode }: React.KeyboardEvent<HTMLInputElement>) => {
    if (keyCode === Keys.ENTER && inputRef.current) {
      inputRef.current.blur();
    }

    if (keyCode === Keys.ESC) {
      quitEditing();
    }
  };

  const cellMarkup = editing ? (
    <input
      ref={inputRef}
      type="text"
      defaultValue={value}
      onBlur={handleChange}
      onKeyUp={handleKeyUp}
    />
  ) : displayValue !== null ? displayValue.toString() : '';

  React.useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  return (
    <td
      className={`${active ? 'active' : ''}`}
      onClick={() => setActive(true)}
      onDoubleClick={() => setEditing(true)}
    >
      <OutsideClickHandler onOutsideClick={() => setActive(false)} disabled={!active}>
        {cellMarkup}
      </OutsideClickHandler>
    </td>
  );
});

function worksheetReducer(
  state: WorksheetState,
  action:
    | { type: 'updateSheetContents'; payload: { rowIndex: number; columnIndex: number; value: CellValue } }
    | { type: 'initialize'; payload: { worksheet: Worksheet } },
): WorksheetState {
  switch (action.type) {
    case 'updateSheetContents':
      if (!state.worksheet) {
        return state;
      }

      const { payload: { rowIndex, columnIndex, value } } = action;
      const worksheetContentsCopy = clone(state.worksheet.contents);

      worksheetContentsCopy[rowIndex][columnIndex] = value;

      return { ...state, worksheet: { ...state.worksheet, contents: worksheetContentsCopy } };
    case 'initialize':
      return { ...state, worksheet: action.payload.worksheet };
  }
}

export const Details = () => {
  const { id } = useParams<{ id: string }>();
  const [worksheetState, dispatch] = React.useReducer(worksheetReducer, {});
  const { worksheet } = worksheetState;
  const handleChange = React.useCallback((rowIndex: number, columnIndex: number, value: CellValue) => {
    dispatch({ type: 'updateSheetContents', payload: { rowIndex, columnIndex, value } });
  }, [dispatch]);

  React.useEffect(() => {
    get(id).then((worksheet) => {
      dispatch({ type: 'initialize', payload: { worksheet } });
    });
  }, [id]);

  if (!worksheet) {
    return (
      <div className="text-center">
        <div className="spinner-border mt-5" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  const { contents: sheetContents, sheetName } = worksheet;
  const columnsCount = sheetContents[0].length;
  const columns = Array.from({ length: columnsCount });
  const rowsCount = sheetContents.length;
  const rows = Array.from({ length: rowsCount });

  return (
    <>
      <div className="row mt-2">
        <div className="col">
          <h3>Worksheet: {sheetName}</h3>
          <Link to="/worksheets">
            &laquo; Go back to list
          </Link>
        </div>
      </div>
      <div className="row mt-2">
        <table className="table worksheet">
          <thead>
          <tr>
            <th style={{ width: 40 }} />
            {columns.map((_, columnIndex) => (
              <th
                scope="col"
                key={`heading-${columnIndex}`}
                className="text-center"
              >
                {String.fromCharCode(Keys.A + columnIndex)}
              </th>
            ))}
          </tr>
          </thead>
          <tbody>
          {rows.map((_, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              <th scope="row" className="text-left">{rowIndex + 1}</th>
              {columns.map((_, columnIndex) => {
                const value = sheetContents[rowIndex][columnIndex];

                return (
                  <Cell
                    key={`cell-${rowIndex}-${columnIndex}`}
                    columnIndex={columnIndex}
                    rowIndex={rowIndex}
                    value={value}
                    displayValue={displayValue(rowIndex, columnIndex, sheetContents)}
                    onChange={handleChange}
                  />
                );
              })}
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
