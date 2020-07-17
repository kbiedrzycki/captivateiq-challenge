import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import { Details } from './pages/worksheets/details';
import { List } from './pages/worksheets/list';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <div className="container-fluid">
        <Switch>
          <Route path="/worksheets/:id" component={Details} />
          <Route path="/worksheets" component={List} />
          <Route path="*">
            <Redirect to="/worksheets" />
          </Route>
        </Switch>
      </div>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);
