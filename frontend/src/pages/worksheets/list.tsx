import React from 'react';
import { useHistory } from 'react-router-dom';
import { create, list, SimplifiedWorksheet } from '../../api/worksheets';

export const List = () => {
  const history = useHistory();
  const [sheetName, setSheetName] = React.useState('');
  const [worksheets, setWorksheets] = React.useState<SimplifiedWorksheet[] | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const createNewWorksheet = async () => {
    setSubmitting(true);

    try {
      const { id } = await create({ sheetName });

      history.push(`/worksheets/${id}`);
    } catch {
      setSubmitting(false);
    }
  };

  React.useEffect(() => {
    list().then((worksheets) => setWorksheets(worksheets));
  }, []);

  return (
    <>
      <div className="row mt-2">
        <div className="col">
          <h3>Worksheets</h3>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div className="form-inline mt-2 text-right">
            <div className="form-group mr-2">
              <input
                value={sheetName}
                type="text"
                className="form-control"
                placeholder="Worksheet name"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSheetName(event.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!sheetName || submitting}
              onClick={createNewWorksheet}
            >
              Create worksheet
            </button>
          </div>
        </div>
      </div>
      <div className="row mt-2">
        <div className="col">
          <table className="table table-sm">
            <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Sheet name</th>
              <th scope="col">Created at</th>
              <th scope="col">Updated at</th>
              <th scope="col" />
            </tr>
            </thead>
            <tbody>
            {!worksheets && (
              <tr>
                <td colSpan={5} className="text-center">
                  <div className="spinner-border mt-5" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                </td>
              </tr>
            )}
            {worksheets && worksheets.map((worksheet, index) => (
              <tr key={worksheet.id}>
                <th scope="row">{index + 1}</th>
                <td>{worksheet.sheetName}</td>
                <td>{new Date(worksheet.createdAt).toLocaleString()}</td>
                <td>{new Date(worksheet.updatedAt).toLocaleString()}</td>
                <td className="text-right">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => history.push(`/worksheets/${worksheet.id}`)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
