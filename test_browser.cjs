const { chromium } = require('playwright');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Listen to all console events
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[BROWSER CONSOLE - ${type.toUpperCase()}] ${text}`);
  });

  page.on('pageerror', err => {
    console.log(`[BROWSER EXCEPTION] ${err.message}\nStack:\n${err.stack}`);
  });

  const url = 'https://dist-vert-six-86.vercel.app';
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });

  console.log('Page loaded. Waiting for 3 seconds...');
  await page.waitForTimeout(3000);

  console.log('Closing browser...');
  await browser.close();
  console.log('Done!');
})();
