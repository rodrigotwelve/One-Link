import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Test backend connection
    fetch('/')
      .then(response => response.json())
      .then(data => {
        setBackendStatus(data.message);
        setIsLoading(false);
      })
      .catch(error => {
        setBackendStatus('Backend not connected');
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 Welcome to One-Link</h1>
        <p>Your Social Bio Solution</p>
        
        <div className="status-section">
          <h3>Backend Status:</h3>
          <div className={`status ${isLoading ? 'loading' : backendStatus.includes('running') ? 'success' : 'error'}`}>
            {isLoading ? '⏳ Checking...' : backendStatus}
          </div>
        </div>

        <div className="features">
          <h3>✨ Features Coming Soon:</h3>
          <ul>
            <li>🔗 Single link for all your social media</li>
            <li>📱 Beautiful, customizable bio pages</li>
            <li>📊 Analytics and insights</li>
            <li>🎨 Themes and customization</li>
            <li>📈 Link tracking and management</li>
          </ul>
        </div>

        <div className="tech-stack">
          <h3>🛠️ Built with:</h3>
          <div className="tech-icons">
            <span>React</span>
            <span>Node.js</span>
            <span>Express</span>
            <span>SQLite</span>
            <span>Sequelize</span>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
