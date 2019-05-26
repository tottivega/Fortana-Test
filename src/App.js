import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import Map from './components/Map'
import Home from './components/Home'

function App() {
  return (
    <Router>
      <Route path="/" exact component={Home} />
      <Route path="/:id" component={Map} />
    </Router>
  );
}

export default App;
