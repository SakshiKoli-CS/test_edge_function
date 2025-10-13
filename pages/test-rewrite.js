import React from 'react';

export default function TestRewrite() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test Rewrite Page</h1>
      <p>This is the target page for rewrite testing.</p>
      <p>If you can see this content when visiting a different URL, the rewrite is working!</p>
      <div style={{ 
        background: '#f0f0f0', 
        padding: '15px', 
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <h3>Rewrite Test Info:</h3>
        <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.pathname : 'Loading...'}</p>
        <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
