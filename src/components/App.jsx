import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { BotsPage } from 'components/BotsPage';
import { HomePage } from 'components/HomePage';
import { LoadingScreen } from 'components/LoadingScreen';

export const App = () => {
  const [appReady, setAppReady] = useState(false);

  return (
    <>
      {!appReady ? <LoadingScreen onComplete={() => setAppReady(true)} /> : null}
      {appReady ? (
        <div
          style={{
            animation: 'appReveal 280ms cubic-bezier(0.22, 1, 0.36, 1) both'
          }}
        >
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/bots" element={<BotsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </div>
      ) : null}
    </>
  );
};
