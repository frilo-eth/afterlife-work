import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const template = searchParams.get('template')
  
  if (!template) {
    return new Response('Template parameter required', { status: 400 })
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background: #000;
            color: #fff;
            line-height: 1.5;
            margin: 0;
            padding: 40px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #111;
            border-radius: 12px;
            padding: 32px;
          }
          .logo {
            margin-bottom: 24px;
          }
          .button {
            display: inline-block;
            background: #fff;
            color: #000;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            margin-top: 24px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <!-- Your logo SVG here -->
            </svg>
          </div>
          <h1>${template.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}</h1>
          <p>Sample email content for ${template} template.</p>
          <a href="#" class="button">Action Button</a>
        </div>
      </body>
    </html>
  `

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' }
  })
} 