import React from 'react';
import Home from './home.jsx'; // Make sure to use .jsx if that's your file extension
import './App.css';

/*
================================================================================
| FILE: src/App.js                                                             |
|------------------------------------------------------------------------------|
| This is the main entry point for your React app. Its only job is to render   |
| the Home component, keeping this file clean and simple.                      |
================================================================================
*/
function App() {
  return (
    <div className="App">
      <Home />
    </div>
  );
}

export default App;
