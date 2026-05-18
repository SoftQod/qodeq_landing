import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { BotsPage } from 'components/BotsPage';
import { HomePage } from 'components/HomePage';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bots" element={<BotsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
