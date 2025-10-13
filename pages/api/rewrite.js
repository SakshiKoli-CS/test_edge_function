export default async function handler(req, res) {
    try {
    
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, User-Agent, Cache-Control"
      );
  
      if (req.method === "OPTIONS") {
        return res.status(200).end();
      }
  
      const rewrites = [
        {
          source: "/test-old",
          destination: "/test-rewrite",
          permanent: false,
        },
      
      ];
  
  
      res.setHeader("Cache-Control", "public, s-maxage=3600");
      res.setHeader("X-Checked-At", new Date().toISOString());
  
      return res.status(200).json(rewrites);
    } catch (err) {
      console.error("Rewrite API error:", err);
      return res.status(500).json({
        error: "Failed to process rewrite",
        message: err.message,
        checkedAt: new Date().toISOString(),
      });
    }
  }
  