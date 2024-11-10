// "use server"

// import * as cheerio from 'cheerio';
// import axios from 'axios';
// import { extractCurrency, extractDescription, extractPrice } from '../utils';
// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// const randomUseragent = require('random-useragent');

// puppeteer.use(StealthPlugin()); // Hides Puppeteer-specific properties for stealth

// // 2Captcha API Key and Proxy List
// const apiKey = process.env.CAPTCHA_API_KEY; // Replace with your 2Captcha API key
// const proxyList = [
//   'ACCOUNTNAME-zone-custom-session-xutXEumLO-sessTime-2:PASSWORD@xx.xx.xx.xx:2333', 
//   'ACCOUNTNAME-zone-custom-session-XmymvUSoF-sessTime-2:PASSWORD@xx.xx.xx.xx:2333',
//   'ACCOUNTNAME-zone-custom-session-aszTeFZO5-sessTime-2:PASSWORD@xx.xx.xx.xx:2333',
//   'ACCOUNTNAME-zone-custom-session-TuHOgebko-sessTime-2:PASSWORD@xx.xx.xx.xx:2333',
//   'ACCOUNTNAME-zone-custom-session-UrsBpHZVw-sessTime-2:PASSWORD@xx.xx.xx.xx:2333'
// ]; // Replace with your list of proxies

// // Function to rotate proxies
// const getRandomProxy = () => proxyList[Math.floor(Math.random() * proxyList.length)];

// // 2Captcha CAPTCHA solver function
// async function solveCaptcha(page:any, siteKey:any) {
//   const captchaToken = await getCaptchaToken(page.url());
//   await page.evaluate(`document.getElementById("g-recaptcha-response").innerHTML="${captchaToken}";`);
//   await page.click('button[type="submit"]');
// }

// // Function to get CAPTCHA token using 2Captcha
// async function getCaptchaToken(siteUrl:string) {
//   try {
//     const response = await axios.get(`http://2captcha.com/in.php?key=${apiKey}&method=userrecaptcha&googlekey=SITE_KEY&json=1&soft_id=1234&url=${siteUrl}`);
//     const requestId = response.data.request;
//     let token = null;

//     // Poll for CAPTCHA token
//     while (!token) {
//       const result = await axios.get(`http://2captcha.com/res.php?key=${apiKey}&action=get&id=${requestId}&json=1`);
//       if (result.data.status === 1) token = result.data.request;
//       else await new Promise(resolve => setTimeout(resolve, 5000));
//     }
//     return token;
//   } catch (error) {
//     console.error('Captcha error:', error);
//     return null;
//   }
// }

// // Scraping function with Puppeteer and anti-bot measures
// export async function scrapeAmazonProduct(url: string) {
//   const proxy = getRandomProxy();
//   const browser = await puppeteer.launch({
//     headless: true,
//     args: [
//       `--proxy-server=${proxy}`, 
//       "--no-sandbox", 
//       "--disable-dev-shm-usage"
//     ],
//   });
//   const page = await browser.newPage();

//   // Set random User-Agent
//   const userAgent = randomUseragent.getRandom();
//   await page.setUserAgent(userAgent);
//   await page.setViewport({ width: 1280, height: 800 });

//   try {
//     await page.goto(url, { waitUntil: 'networkidle2' });
     
//     // Get the reCAPTCHA site key dynamically
//     const siteKey:any = await page.evaluate(() => {
//         const recaptchaElement = document.querySelector('.g-recaptcha');
//         if (recaptchaElement) return recaptchaElement.getAttribute('data-sitekey');
        
//         const scriptTags = Array.from(document.querySelectorAll('script'));
//         for (let script of scriptTags) {
//           if (script.src.includes('recaptcha/api.js')) {
//             const urlParams = new URLSearchParams(script.src.split('?')[1]);
//             return urlParams.get('render');
//           }
//         }
//         return null;
//       });
    
//     // If CAPTCHA is detected, solve it
//     if (await page.$('#recaptcha')) await solveCaptcha(page, siteKey);

//     const content = await page.content();
//     const $ = cheerio.load(content.data);
  
//       // Extract the product title
//       const title = $('#productTitle').text().trim();
//       const currentPrice = extractPrice(
//         $('.priceToPay span.a-price-whole'),
//         $('.a.size.base.a-color-price'),
//         $('.a-button-selected .a-color-base'),
//       );
  
//       const originalPrice = extractPrice(
//         $('#priceblock_ourprice'),
//         $('.a-price.a-text-price span.a-offscreen'),
//         $('#listPrice'),
//         $('#priceblock_dealprice'),
//         $('.a-size-base.a-color-price')
//       );
  
//       const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';
  
//       const images = 
//         $('#imgBlkFront').attr('data-a-dynamic-image') || 
//         $('#landingImage').attr('data-a-dynamic-image') ||
//         '{}'
  
//       const imageUrls = Object.keys(JSON.parse(images));
  
//       const currency = extractCurrency($('.a-price-symbol'))
//       const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");
  
//       const description = extractDescription($)
  
//       // Construct data object with scraped information
//       const data = {
//         url,
//         currency: currency || '$',
//         image: imageUrls[0],
//         title,
//         currentPrice: Number(currentPrice) || Number(originalPrice),
//         originalPrice: Number(originalPrice) || Number(currentPrice),
//         amazonPriceHistory: [],
//         flipkartPriceHistory: [],
//         priceHistory: [],
//         discountRate: Number(discountRate),
//         category: 'category',
//         reviewsCount:100,
//         stars: 4.5,
//         isOutOfStock: outOfStock,
//         description,
//         lowestPrice: Number(currentPrice) || Number(originalPrice),
//         highestPrice: Number(originalPrice) || Number(currentPrice),
//         averagePrice: Number(currentPrice) || Number(originalPrice),
//       }
//       await browser.close();
//       console.log(data,'data');
//       return data;
//     } catch (error: any) {
//       console.log(error);
//     }
//   }

// "use server"

// // import axios from 'axios';
// import * as cheerio from 'cheerio';
// import axios from 'axios';

// import { extractCurrency, extractDescription, extractPrice } from '../utils';
// const puppeteer = require('puppeteer');

// export async function scrapeAmazonProduct(url: string) {
//   if(!url) return;

//   // // BrightData proxy configuration
//   // const username = String(process.env.BRIGHT_DATA_USERNAME);
//   // const password = String(process.env.BRIGHT_DATA_PASSWORD);
//   // const port = 22225;
//   // const session_id = (1000000 * Math.random()) | 0;

//   // const options = {
//   //   auth: {
//   //     username: `${username}-session-${session_id}`,
//   //     password,
//   //   },
//   //   host: 'brd.superproxy.io',
//   //   port,
//   //   rejectUnauthorized: false,
//   // }

//   try {

    
//     // if (!(await canScrape(url))) {
//     //     console.log('Exiting: Scraping not allowed.');
//     //     return;
//     //   }
//     // Launch a headless browser
//     const browser = await puppeteer.launch({
//       headless: true,
//       args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-setuid-sandbox"],
//       ignoreDefaultArgs: ["--disable-extensions"],

//       executablePath: process.env.CHROME_PATH,
// });
// const page = await browser.newPage();

// // Set a custom User-Agent string for your scraper
// const userAgent = 'MyScraperBot/1.0 (+https://webastonish.com/; please-allow-for-Learning-purpose-only)';
// await page.setUserAgent(userAgent);

// // Navigate to the website
// await page.goto(url,{ waitUntil: 'networkidle2' });
// const response = await axios.get(url);
//     // Fetch the product page

//     const $ = cheerio.load(response.data);

//     // Extract the product title
//     const title = $('#productTitle').text().trim();
//     const currentPrice = extractPrice(
//       $('.priceToPay span.a-price-whole'),
//       $('.a.size.base.a-color-price'),
//       $('.a-button-selected .a-color-base'),
//     );

//     const originalPrice = extractPrice(
//       $('#priceblock_ourprice'),
//       $('.a-price.a-text-price span.a-offscreen'),
//       $('#listPrice'),
//       $('#priceblock_dealprice'),
//       $('.a-size-base.a-color-price')
//     );

//     const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

//     const images = 
//       $('#imgBlkFront').attr('data-a-dynamic-image') || 
//       $('#landingImage').attr('data-a-dynamic-image') ||
//       '{}'

//     const imageUrls = Object.keys(JSON.parse(images));

//     const currency = extractCurrency($('.a-price-symbol'))
//     const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");

//     const description = extractDescription($)

//     // Construct data object with scraped information
//     const data = {
//       url,
//       currency: currency || '$',
//       image: imageUrls[0],
//       title,
//       currentPrice: Number(currentPrice) || Number(originalPrice),
//       originalPrice: Number(originalPrice) || Number(currentPrice),
//       amazonPriceHistory: [],
//       flipkartPriceHistory: [],
//       priceHistory: [],
//       discountRate: Number(discountRate),
//       category: 'category',
//       reviewsCount:100,
//       stars: 4.5,
//       isOutOfStock: outOfStock,
//       description,
//       lowestPrice: Number(currentPrice) || Number(originalPrice),
//       highestPrice: Number(originalPrice) || Number(currentPrice),
//       averagePrice: Number(currentPrice) || Number(originalPrice),
//     }
//     await browser.close();
//     console.log(data,'data');
//     return data;
//   } catch (error: any) {
//     console.log(error);
//   }
// }
