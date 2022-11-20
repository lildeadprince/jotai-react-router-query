import { Route, Routes } from 'react-router-dom';

export const TestApp = ({ rootRouteElement }) => (
  <Routes>
    <Route index={true} element={rootRouteElement} />
  </Routes>
);
