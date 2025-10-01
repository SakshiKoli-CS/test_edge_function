export default function handler(req, res) {
  const { method } = req;
  
  if (method === 'GET') {
    // Sample data to return
    const data = {
      message: 'Data from API route',
      timestamp: new Date().toISOString(),
      hosts: {
        mobile: 'demo-site-edge.gcpcontentstackapps.com',
        desktop: 'testedgefunction.gcpcontentstackapps.com'
      },
      config: {
        redirectEnabled: true,
        cacheTime: 300
      }
    };
    
    res.status(200).json(data);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
