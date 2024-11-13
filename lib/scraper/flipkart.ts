// // npm install puppeteer
// // Use Custom Request Headers
// "use server"

// import axios from 'axios';
// import { scrapeAmazon,scrapeFlipkart} from './amazonScraper';
// const puppeteer = require('puppeteer');

// // define your custom headers
// const requestHeaders = {
//     'user-agent':
//         'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
//     Referer: 'https://www.google.com/',
// };

// (async () => {
//     // set up browser environment
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     // intercept the request with the custom headers
//     await page.setExtraHTTPHeaders({ ...requestHeaders });

//     // continue navigating to a URL
//     await page.goto('https://www.flipkart.com/woxen-men-solid-casual-dark-green-shirt/p/itm77c1d9045523b?pid=SHTGYER9JXHZESDF&lid=LSTSHTGYER9JXHZESDFO9MPIX&marketplace=FLIPKART&store=clo&srno=b_1_1&otracker=browse&fm=organic&iid=en__pPqNneolXT51M1QQdsskiixz0Ldgc7a28isMqA7vo_JSOTy-vKRP1b0Kalgbxv_HAwerOUuxEzNetCczSD1iQ%3D%3D&ppt=hp&ppn=homepage&ssid=en4c3trya80000001731306293944', {
//         waitUntil: 'load',
//     });

//     const product = await page.evaluate(() => {
//         const title = document.querySelector('span.VU-ZEz')?.textContent?.trim() || 'Title not found';
//         const price = document.querySelector('div._30jeq3._16Jk6d')?.textContent?.trim() || 'Price not found';
//         const rating = document.querySelector('div._3LWZlK')?.textContent?.trim() || 'Rating not found';
//         const reviewCount = document.querySelector('span._2_R_DZ span')?.textContent?.trim() || 'Review count not found';
//         const description = document.querySelector('div._1mXcCf')?.textContent?.trim() || 'Description not found';
    
//         return { title, price, rating, reviewCount, description };
//       });

//       console.log(product);


//     // close the browser instance
//     await browser.close();
// })();