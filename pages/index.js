export default function Home() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      textAlign: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <div>
        <h1 style={{ margin: '0', color: '#333' }}>
          Edge Device Adaptation
        </h1>
        <p style={{ margin: '20px 0', color: '#666', fontSize: '16px' }}>
          Redirecting based on device type using Edge Runtime
        </p>
      </div>
    </div>
  )
}
