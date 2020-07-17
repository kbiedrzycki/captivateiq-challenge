import React from 'react';
import { useHistory } from 'react-router-dom';

const { REACT_APP_API_BASE } = process.env;

type WorksheetCreateDTO = {
  sheetName: string;
};

const createWorksheet = ({ sheetName }: WorksheetCreateDTO) =>
  fetch(`${REACT_APP_API_BASE}/worksheets`, {
    method: 'post',
    body: JSON.stringify({ sheetName }),
  })
    .then((response) => response.json())
    .then((data) => data);

export const List = () => {
  const history = useHistory();
  const [sheetName, setSheetName] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const createNewWorksheet = async () => {
    setSubmitting(true);

    try {
      const { worksheet: { id } } = await createWorksheet({ sheetName });

      history.push(`/worksheets/${id}`);
    } catch {
      setSubmitting(false);
    }
  };

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
    </>
  );
};
