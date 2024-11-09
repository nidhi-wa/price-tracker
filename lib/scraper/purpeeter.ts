// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// const { TwoCaptcha } = require('2captcha');

// // Initialize Puppeteer with the Stealth Plugin
// puppeteer.use(StealthPlugin());

// const apiKey = 'YOUR_2CAPTCHA_API_KEY'; // Replace with your 2Captcha API key
// const proxyList = ['proxy1:port', 'proxy2:port']; // Replace with your proxy list

// // Function to fetch random proxy from proxy list
// function getRandomProxy() {
//   const randomIndex = Math.floor(Math.random() * proxyList.length);
//   return proxyList[randomIndex];
// }

// // Initialize CAPTCHA solver
// const solver = new TwoCaptcha(apiKey);

// async function scrapeFlipkartProduct(url) {
//   const proxy = getRandomProxy();
//   const browser = await puppeteer.launch({
//     headless: false,
//     args: [
//       `--proxy-server=${proxy}`, // Use proxy rotation
//       '--no-sandbox',
//       '--disable-setuid-sandbox',
//       '--disable-blink-features=AutomationControlled',
//     ],
//   });
//   const page = await browser.newPage();

//   // Set a realistic viewport and user-agent
//   await page.setViewport({ width: 1280, height: 800 });
//   await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36");

//   try {
//     await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
//     // CAPTCHA Detection and Handling
//     if (await page.$('iframe[title="reCAPTCHA"]')) {
//       console.log('CAPTCHA detected, solving with 2Captcha...');
//       const siteKey = 'YOUR_CAPTCHA_SITE_KEY'; // Flipkart's reCAPTCHA site key, replace as needed
//       const captchaSolution = await solver.solveRecaptchaV2({
//         sitekey: siteKey,
//         url: url,
//       });
      
//       // Insert CAPTCHA response and submit form
//       await page.evaluate((captchaSolution) => {
//         document.getElementById('g-recaptcha-response').innerHTML = captchaSolution;
//       }, captchaSolution);

//       // Wait for CAPTCHA to be processed
//       await page.waitForTimeout(3000);
//     }

//     // Wait for the product title (ensures page loaded correctly)
//     await page.waitForSelector('span.B_NuCI', { timeout: 30000 });

//     // Emulate scrolling to load lazy elements
//     await autoScroll(page);

//     // Extract product information
//     const product = await page.evaluate(() => {
//       const title = document.querySelector('span.B_NuCI')?.innerText || 'Title not found';
//       const price = document.querySelector('._30jeq3._16Jk6d')?.innerText || 'Price not found';
//       const description = document.querySelector('div._1mXcCf.RmoJUa')?.innerText || 'Description not found';

//       return { title, price, description };
//     });

//     console.log("Scraped Product Details:", product);
//     await browser.close();
//     return product;

//   } catch (error) {
//     console.error('Error scraping product:', error);
//     await browser.close();
//     throw error;
//   }
// }

// // Helper function for auto-scrolling
// async function autoScroll(page) {
//   await page.evaluate(async () => {
//     await new Promise((resolve) => {
//       let totalHeight = 0;
//       const distance = 100;
//       const timer = setInterval(() => {
//         window.scrollBy(0, distance);
//         totalHeight += distance;

//         if (totalHeight >= document.body.scrollHeight) {
//           clearInterval(timer);
//           resolve();
//         }
//       }, 200); // Slow scrolling for human-like behavior
//     });
//   });
// }

// // Example Usage
// (async () => {
//   const url = 'https://www.flipkart.com/product-url';
//   const product = await scrapeFlipkartProduct(url);
//   console.log("Scraped Product:", product);
// })();
