"use server"
// npm install puppeteer
// Use Custom Request Headers
const puppeteer = require('puppeteer');

// define your custom headers
const requestHeaders = {
    'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    Referer: 'https://www.google.com/',
};


export async function scrapeProductTitle(url:string){

    // const parsedURL = new URL(url);
    // const hostname = parsedURL.hostname;
    // set up browser environment
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-setuid-sandbox"],
      ignoreDefaultArgs: ["--disable-extensions"],

      executablePath: process.env.CHROME_PATH,
     });
    const page = await browser.newPage();

    // intercept the request with the custom headers
    await page.setExtraHTTPHeaders({ ...requestHeaders });

    // continue navigating to a URL
    await page.goto(url, { waitUntil:  'load' });

    // Define selectors for title and price for Amazon and Flipkart
  const selectors = {
    amazon: {
      title: '#productTitle',
      price: '.priceToPay span.a-price-whole, .a.size.base.a-color-price, .a-button-selected .a-color-base',
    },
    flipkart: {
      title: 'span.VU-ZEz', // Flipkart title selector
      price: '.Nx9bqj.CxhGGd, ._30jeq3._16Jk6d, ._3I9_wc._27UcVY',// Flipkart price selector
    },
  };

  
  const platform = url.includes('amazon') ? 'amazon' : 'flipkart' 

  const product = await page.evaluate(
    (selectors:any) => {
      const titleElement = document.querySelector(selectors.title);
      const priceElement = document.querySelector(selectors.price);

      const title = titleElement?.textContent?.trim() || 'Title not found';
      const price = priceElement?.textContent?.trim() || 'Price not found';
      const finalPrice=  price? parseFloat(price.replace(/₹|,/g, '')) : NaN;

      return { title, finalPrice };
    },
    selectors[platform]
  );
      const data = {
        url,
        title:product.title,
        price:product.finalPrice
      }

      console.log(product);
      await browser.close();

      return data;
    // close the browser instance
   
}