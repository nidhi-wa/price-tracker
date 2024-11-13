"use server"

// import axios from 'axios';
import { scrapeAmazon,scrapeFlipkart} from './amazonScraper';

const puppeteer = require('puppeteer');


// define your custom headers
const requestHeaders = {
  'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  Referer: 'https://www.google.com/',
};
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// const randomUseragent = require('random-useragent');

// puppeteer.use(StealthPlugin()); // Hides Puppeteer-specific properties for stealth

// 2Captcha API Key and Proxy List
// const apiKey = process.env.CAPTCHA_API_KEY; // Replace with your 2Captcha API key
// const proxyList = [
//   "103.12.246.65:4145",
//   "103.86.1.255:4145",
//   "103.112.234.113:5678"
// ]// Replace with your list of proxies

// // Function to rotate proxies
// const getRandomProxy = () => proxyList[Math.floor(Math.random() * proxyList.length)];

// 2Captcha CAPTCHA solver function
// async function solveCaptcha(page:any, siteKey:any): Promise<string | null> {
//   const captchaToken = await getCaptchaToken(page.url(),siteKey);
//   await page.evaluate(`document.getElementById("g-recaptcha-response").innerHTML="${captchaToken}";`);
//   await page.click('button[type="submit"]');
//   return captchaToken;
// }

// // Function to get CAPTCHA token using 2Captcha
// async function getCaptchaToken(siteUrl:string,siteKey:any) {
//   try {
//     const response = await axios.get(`http://2captcha.com/in.php?key=${apiKey}&method=userrecaptcha&googlekey=${siteKey}&json=1&soft_id=1234&url=${siteUrl}`);
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

// Scraping function with Puppeteer and anti-bot measures
export async function scrapeAmazonProduct(url: string) {
  if(!url) return;
  // const proxy = getRandomProxy();
  const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-setuid-sandbox"],
          ignoreDefaultArgs: ["--disable-extensions"],
    
          executablePath: process.env.CHROME_PATH,
    });
  const page = await browser.newPage();
 // intercept the request with the custom headers
 await page.setExtraHTTPHeaders({ ...requestHeaders });

  try {
    await page.goto(url, { waitUntil:  'networkidle2' });
     
    // // Get the reCAPTCHA site key dynamically
    // const siteKey:any = await page.evaluate(() => {
    //     const recaptchaElement = document.querySelector('.g-recaptcha');
    //     if (recaptchaElement) return recaptchaElement.getAttribute('data-sitekey');
        
    //     const scriptTags = Array.from(document.querySelectorAll('script'));
    //     for (let script of scriptTags) {
    //       if (script.src.includes('recaptcha/api.js')) {
    //         const urlParams = new URLSearchParams(script.src.split('?')[1]);
    //         return urlParams.get('render');
    //       }
    //     }
    //     return null;
    //   });
    
    // // If siteKey is found, solve CAPTCHA
    // let captchaToken: string | null = null;

    // if (siteKey) {
    //   captchaToken = await solveCaptcha(siteKey, url);
  
    //   if (captchaToken) {
    //     // Simulate CAPTCHA form submission
    //     await page.evaluate((token: string) => {
    //       const captchaResponseElement = document.querySelector<HTMLInputElement>('a[rel="noopener noreferrer"] div:nth-child(2)',);
    //       if (captchaResponseElement) {
    //         captchaResponseElement.value = token;
    //       }
    //     }, captchaToken);
    //   }
    // }

    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;


  let data;

  if(
    hostname.includes('amazon.com') || 
    hostname.includes ('amazon.') || 
    hostname.endsWith('amazon')
  ) {
    data = await scrapeAmazon(url);
  }else if(
    hostname.includes('flipkart.com') || 
    hostname.includes ('flipkart.') || 
    hostname.endsWith('flipkart')
  ) {
    data = await scrapeFlipkart(url,page);
  }else {
  throw new Error('Unsupported website');
}


   
      await browser.close();
      return data;
    } catch (error: any) {
      console.log(error);
    }
  }