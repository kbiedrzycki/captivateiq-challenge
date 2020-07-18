const { REACT_APP_API_BASE } = process.env;

type WorksheetCreateDTO = {
  sheetName: string;
};

type WorksheetContentsUpdateDTO = {
  rowIndex: number;
  columnIndex: number;
  value: CellValue;
};

export type CellValue = string | number;

export type Worksheet = {
  id: string;
  sheetName: string;
  contents: CellValue[][];
  createdAt: number;
  updatedAt: number;
}

export type SimplifiedWorksheet = Pick<Worksheet, 'id' | 'sheetName' | 'createdAt' | 'updatedAt'>;

const worksheetsUrl = `${REACT_APP_API_BASE}/worksheets`;

export const create = ({ sheetName }: WorksheetCreateDTO) =>
  fetch(worksheetsUrl, { method: 'post', body: JSON.stringify({ sheetName }) })
    .then((response) => response.json())
    .then<Worksheet>(({ worksheet }) => worksheet);

export const updateContents = (id: string, payload: WorksheetContentsUpdateDTO) =>
  fetch(`${worksheetsUrl}/${id}/contents`, { method: 'put', body: JSON.stringify(payload) })
    .then((response) => response.json())
    .then<Worksheet>(({ worksheet }) => worksheet);

export const list = () =>
  fetch(worksheetsUrl)
    .then((response) => response.json())
    .then<SimplifiedWorksheet[]>(({ worksheets }) => worksheets);

export const get = (id: string) =>
  fetch(`${worksheetsUrl}/${id}`)
    .then((response) => response.json())
    .then<Worksheet>(({ worksheet }) => worksheet);
