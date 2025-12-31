export default function Contact() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <div>
        <h1 style={{ margin: '0', color: '#333', fontSize: '24px' }}>
          Contact Us
        </h1>
        <p style={{ margin: '20px 0', color: '#666', fontSize: '16px' }}>
          Get in touch with us via email
        </p>
        <a 
          href="mailto:example@example.com" 
          style={{ 
            color: '#0070f3', 
            textDecoration: 'none', 
            fontSize: '16px' 
          }}
        >
          example@example.com
        </a>
      </div>
    </div>
  )
}

