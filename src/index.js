export default {
  async fetch(request, env, ctx) {
    const { DB } = env;
    try {
      const url = new URL(request.url);
      const quote = await getRandomQuote(DB);
      
      // Only increment counter for actual page visits, not favicon requests
      const count = url.pathname === "/" 
        ? await incrementVisitorCount(DB)
        : await getCurrentCount(DB);
        
      return new Response(renderHTML(quote, count), {
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
    } catch (error) {
      return new Response("Error fetching quote: " + error.message, { status: 500 });
    }
  },
};

async function getRandomQuote(db) {
  const quoteRes = await db.prepare(
    "SELECT quote_text, author FROM quotes ORDER BY RANDOM() LIMIT 1"
  ).first();
  
  if (!quoteRes) {
    return "No quotes available";
  }
  return `${quoteRes.quote_text} – ${quoteRes.author}`;
}

async function incrementVisitorCount(db) {
  await db.prepare('UPDATE visitors SET count = count + 1 WHERE id = 1').run();
  const result = await db.prepare('SELECT count FROM visitors WHERE id = 1').first();
  return result.count;
}

async function getCurrentCount(db) {
  const result = await db.prepare('SELECT count FROM visitors WHERE id = 1').first();
  return result.count;
}

function renderHTML(quote, visitorCount) {
  // Split the quote into text and author (assuming format "Quote text - Author")
  const [text, author] = quote.split('–').map(str => str.trim());
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Finish One Thing Today</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;600&family=DM+Serif+Display&display=swap" rel="stylesheet">
      <style>
        :root {
          --primary: #2D3436;
          --secondary: #636E72;
          --accent: #00B894;
          --background: #F8F9FA;
          --card: #FFFFFF;
        }
        
        body {
          font-family: 'Space Grotesk', sans-serif;
          margin: 0;
          padding: 0;
          min-height: 100vh;
          background: var(--background);
          display: grid;
          place-items: center;
          color: var(--primary);
        }
        
        .container {
          width: min(90%, 800px);
          margin: 2rem auto;
          padding: 3rem;
          background: var(--card);
          border-radius: 24px;
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -2px rgba(0, 0, 0, 0.05);
        }
        
        .intro {
          text-align: center;
          margin-bottom: 4rem;
        }
        
        h1 {
          font-family: 'DM Serif Display', serif;
          font-size: 3em;
          margin: 0;
          color: var(--primary);
          line-height: 1.2;
        }
        
        .subtitle {
          font-size: 1.1em;
          color: var(--secondary);
          margin-top: 1rem;
          line-height: 1.6;
          font-weight: 300;
        }
        
        .quote-section {
          background: linear-gradient(to right, rgba(0, 184, 148, 0.1), transparent);
          padding: 3rem;
          border-radius: 16px;
          position: relative;
          margin: 2rem 0;
        }
        
        .quote-icon {
          position: absolute;
          top: 1rem;
          left: 1rem;
          font-size: 5em;
          color: rgba(0, 184, 148, 0.2);
          font-family: 'DM Serif Display', serif;
          line-height: 1;
        }
        
        .quote-icon.end {
          left: auto;
          right: 1rem;
          top: auto;
          bottom: 1rem;
        }
        
        .quote-text {
          font-size: 1.5em;
          line-height: 1.6;
          margin: 0 0 1.5rem 0;
          padding-left: 1rem;
          position: relative;
          z-index: 1;
          font-weight: 300;
        }
        
        .quote-author {
          font-size: 1.2em;
          color: var(--secondary);
          text-align: left;
          padding-left: 1rem;
          font-style: italic;
        }
        
        .button {
          display: inline-block;
          padding: 1rem 2.5rem;
          background: var(--accent);
          color: white;
          text-decoration: none;
          border-radius: 100px;
          font-weight: 600;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        
        .button:hover {
          background: transparent;
          color: var(--accent);
          border-color: var(--accent);
        }
        
        .actions {
          text-align: center;
          margin-top: 3rem;
        }
        
        .footer {
          text-align: center;
          margin-top: 3rem;
          color: var(--secondary);
          font-size: 0.9em;
          font-weight: 300;
        }
        
        .visitor-count {
          margin-top: 1rem;
          font-size: 0.8em;
          opacity: 0.7;
        }
        
        .built-with {
          margin-top: 1rem;
          font-size: 0.7em;
          opacity: 0.6;
          font-style: italic;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 2rem;
          }
          
          h1 {
            font-size: 2.5em;
          }
          
          .quote-section {
            padding: 2rem;
          }
          
          .quote-text {
            font-size: 1.2em;
          }
          
          .quote-author {
            font-size: 1em;
            padding-right: 2rem;
          }
          
          .quote-icon {
            font-size: 4em;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="intro">
          <h1>Finish One Thing Today</h1>
          <div class="subtitle">
            Focus on progress, not perfection. Take one small step forward.
          </div>
        </div>
        
        <div class="quote-section">
          <div class="quote-icon">"</div>
          <p class="quote-text">${text}</p>
          <p class="quote-author">– ${author}</p>
          <div class="quote-icon end">"</div>
        </div>
        
        <div class="actions">
          <a href="/" class="button">New Quote</a>
        </div>
        
        <div class="footer">
          Remember: Small progress is still progress.
          <div class="visitor-count">Visitors: ${visitorCount}</div>
          <div class="built-with">
            Built on Cloudflare Workers and D1 with the help of ChatGPT o1 and Cursor AI
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

