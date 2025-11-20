import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';

import Home from './pages/Home';
import Estoque from './pages/Estoque';
import Estatisticas from './pages/Estatisticas';

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/estoque" element={<Estoque />} />
        <Route path="/estatisticas" element={<Estatisticas />} />
      </Routes>
    </Router>
  );
}

export default App;
