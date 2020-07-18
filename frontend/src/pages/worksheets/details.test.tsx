import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Details } from './details';
import { get, updateContents } from '../../api/worksheets';

jest.mock('../../api/worksheets');

const clone = (items: any) => items.map((item: any) => Array.isArray(item) ? clone(item) : item);

it('persists worksheet changes', async () => {
  const worksheetId = '47c87190-c857-11ea-ab5e-7338003d548e';
  const initialWorksheet = {
    id: worksheetId,
    sheetName: 'Test worksheet',
    contents: Array(10).fill(Array(10).fill(null)),
  };

  get.mockResolvedValueOnce(initialWorksheet);

  render(
    <MemoryRouter initialIndex={0} initialEntries={[`/worksheets/${worksheetId}`]}>
      <Route path="/worksheets/:id">
        <Details />
      </Route>
    </MemoryRouter>,
  );

  await waitFor(() => expect(get).toHaveBeenCalledWith(worksheetId));

  expect(screen.getByText('Test worksheet')).toBeInTheDocument();

  let contentsCopy = clone(initialWorksheet.contents);
  contentsCopy[0][0] = 5;
  let nextWorksheet = { ...initialWorksheet, contents: contentsCopy };

  updateContents.mockResolvedValueOnce(nextWorksheet);

  userEvent.dblClick(screen.getByTestId('cell-0-0'));
  userEvent.type(screen.getByTestId('input-0-0'), '5{enter}');

  await waitFor(() => expect(updateContents).toHaveBeenCalledWith(
    worksheetId,
    { 'columnIndex': 0, 'rowIndex': 0, 'value': 5 },
  ));

  contentsCopy = clone(nextWorksheet.contents);
  contentsCopy[0][1] = 10;
  nextWorksheet = { ...nextWorksheet, contents: contentsCopy };

  updateContents.mockResolvedValueOnce(nextWorksheet);

  userEvent.dblClick(screen.getByTestId('cell-0-1'));
  userEvent.type(screen.getByTestId('input-0-1'), '10{enter}');

  await waitFor(() => expect(updateContents).toHaveBeenCalledWith(
    worksheetId,
    { 'columnIndex': 1, 'rowIndex': 0, 'value': 10 },
  ));

  contentsCopy = clone(nextWorksheet.contents);
  contentsCopy[0][2] = '=A1+B1';
  nextWorksheet = { ...nextWorksheet, contents: contentsCopy };

  updateContents.mockResolvedValueOnce(nextWorksheet);

  userEvent.dblClick(screen.getByTestId('cell-0-2'));
  userEvent.type(screen.getByTestId('input-0-2'), '=A1+B1{enter}');

  await waitFor(() => expect(updateContents).toHaveBeenCalledWith(
    worksheetId,
    { 'columnIndex': 2, 'rowIndex': 0, 'value': '=A1+B1' },
  ));

  expect(screen.getByTestId('cell-0-2').textContent).toEqual('15');
});
