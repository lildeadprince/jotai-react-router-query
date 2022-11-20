import ReactDOM from 'react-dom/client';
import { TestApp } from './test-app.jsx';
import { TestRoute } from './test-route.jsx';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <TestApp rootRouteElement={<TestRoute />} />
  </BrowserRouter>,
);
