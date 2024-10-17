"use server"

// import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice } from '../utils';
const puppeteer = require('puppeteer');
const chromium = require('@sparticuz/chromium');

export async function scrapeAmazonProduct(url: string) {
  if(!url) return;

  // // BrightData proxy configuration
  // const username = String(process.env.BRIGHT_DATA_USERNAME);
  // const password = String(process.env.BRIGHT_DATA_PASSWORD);
  // const port = 22225;
  // const session_id = (1000000 * Math.random()) | 0;

  // const options = {
  //   auth: {
  //     username: `${username}-session-${session_id}`,
  //     password,
  //   },
  //   host: 'brd.superproxy.io',
  //   port,
  //   rejectUnauthorized: false,
  // }

  try {

    
    // if (!(await canScrape(url))) {
    //     console.log('Exiting: Scraping not allowed.');
    //     return;
    //   }
    // Launch a headless browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-setuid-sandbox"],
      ignoreDefaultArgs: ["--disable-extensions"],

      executablePath: await chromium.executablePath(),
});
const page = await browser.newPage();

// Set a custom User-Agent string for your scraper
const userAgent = 'MyScraperBot/1.0 (+https://webastonish.com/; please-allow-for-Learning-purpose-only)';
await page.setUserAgent(userAgent);

// Navigate to the website
await page.goto(url,{ waitUntil: 'networkidle2' });
const response = await page.content();
    // Fetch the product page

    const $ = cheerio.load(response);

    // Extract the product title
    const title = $('#productTitle').text().trim();
    const currentPrice = extractPrice(
      $('.priceToPay span.a-price-whole'),
      $('.a.size.base.a-color-price'),
      $('.a-button-selected .a-color-base'),
    );

    const originalPrice = extractPrice(
      $('#priceblock_ourprice'),
      $('.a-price.a-text-price span.a-offscreen'),
      $('#listPrice'),
      $('#priceblock_dealprice'),
      $('.a-size-base.a-color-price')
    );

    const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

    const images = 
      $('#imgBlkFront').attr('data-a-dynamic-image') || 
      $('#landingImage').attr('data-a-dynamic-image') ||
      '{}'

    const imageUrls = Object.keys(JSON.parse(images));

    const currency = extractCurrency($('.a-price-symbol'))
    const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");

    const description = extractDescription($)

    // Construct data object with scraped information
    const data = {
      url,
      currency: currency || '$',
      image: imageUrls[0],
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      category: 'category',
      reviewsCount:100,
      stars: 4.5,
      isOutOfStock: outOfStock,
      description,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
    }
    await browser.close();
    return data;
  } catch (error: any) {
    console.log(error);
  }
}