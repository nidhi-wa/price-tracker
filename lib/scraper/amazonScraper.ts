
import * as cheerio from 'cheerio';
import axios from 'axios';
import { extractCurrency, extractDescription, extractPrice } from '../utils';

export async function scrapeAmazon(url:string) {
  try {  
  const response = await axios.get(url);
      // Fetch the product page
  
      const $ = cheerio.load(response.data);
  
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
        amazonPriceHistory: [],
        flipkartPriceHistory: [],
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
      console.log(data,'amazon data');
      return data;
    } catch (error: any) {
      console.log(error);
    }
  }


  export async function scrapeFlipkart( url:string,page:any) {
    try {
      // const response = await axios.get(url);
      // const $ = cheerio.load(response.data);
  
      // // Flipkart-specific selectors
      // const title = $('span.VU-ZEz').text().trim()|| 'Title not found';;
      // const currentPrice = $('div._30jeq3._16Jk6d').text().replace(/₹|,/g, '').trim()|| 'Title not found';;
      // const originalPrice = $('div._3I9_wc._2p6lqe').text().replace(/₹|,/g, '').trim()|| 'Title not found';;
      // const description = $('div._2418kt').text().trim()|| 'Title not found';;
  
      // const data = { title, currentPrice, originalPrice, description };
      // console.log(data);
      // return data;
      await page.waitForSelector('body');

      // Try to select the price element with multiple selectors
      const currentPrice = await page.evaluate(() => {
        // Define potential selectors for the price
        const selectors = [
          '.Nx9bqj.CxhGGd',  // Primary known selector
          '._30jeq3._16Jk6d', // Another common price selector
          '._3I9_wc._27UcVY', // Discounted original price
        ];
    
        // Loop through selectors to find the first non-empty result
        let priceText = null;
        for (let selector of selectors) {
          const priceElement = document.querySelector(selector);
          if (priceElement && priceElement.textContent) {
            priceText = priceElement.textContent.trim();
            break;
          }
        }
    
        // Parse the price if found; otherwise return NaN
        return priceText ? parseFloat(priceText.replace(/₹|,/g, '')) : NaN;
      });
    
      console.log(`Current Price: ₹${currentPrice}`);
      const product = await page.evaluate(() => {
        const priceSelectors = [
          '.Nx9bqj.CxhGGd',       // Primary known selector
          '._30jeq3._16Jk6d',     // Another common price selector
          '._3I9_wc._27UcVY',     // Discounted original price
        ];

        const originalPriceSelectors = [
          '#text.yRaY8j.A6+E6v'     // Selector for the original pric     // Another selector that may show original price
        ];
    
        // Function to dynamically find and extract price from selectors
        function extractPrice(selectors:any) {
          let priceText = null;
          for (let selector of selectors) {
            const priceElement = document.querySelector(selector);
            if (priceElement && priceElement.textContent) {
              priceText = priceElement.textContent.trim();
              break;
            }
          }
          return priceText ? parseFloat(priceText.replace(/₹|,/g, '')) : NaN;
        }

        function orignalExtractPrice(selectors:any) {
          let combinedText= null;
          for (let selector of selectors) {
            const priceElement = document.querySelectorAll(selector);
            if (priceElement.length > 0) {
              // Join text nodes to handle cases like "₹" "2,099"
              combinedText = Array.from(priceElement)
              .map((node) => (node as ChildNode).textContent?.trim() || "")
              .join(" ");
    
            // return combinedText.replace(/₹|,|"|\s/g, ''); // Remove ₹, commas, quotes, and spaces
            }
          }
          return  combinedText ? parseFloat( combinedText.replace(/₹|[^\d,]/g, '').replace(/,/g, '')) : NaN; 
        }

        const discountElement = document.querySelector('.UkUFwK.WW8yVX.dB67CR > span');
        function extractDiscount(discountElement:any){
          if (discountElement && discountElement.textContent) {
            // Extract only the number part (e.g., "81" from "81% off")
            const discountText = discountElement.textContent.trim();
            const match = discountText.match(/\d+/);
            return match ? parseInt(match[0], 10) : NaN; // Convert to number
          }
          return NaN;

        }

        
        

        const title = document.querySelector('span.VU-ZEz')?.textContent?.trim() || 'Title not found';
        const imageSelectors = [
          'div._4WELSP._6lpKCl img',
           'div.gqcSqV.YGE0gZ img',
          'div._1r7vXj img',  // Another example selector
          'img._2rXOwJ'       // Another example selector
        ];
        
        const image = imageSelectors
          .map(selector => 
            Array.from(document.querySelectorAll(selector))
              .map(img => (img as HTMLImageElement).src)
          )
          .flat() || 'Image not found';
        
        console.log(image);
        // const image = Array.from(document.querySelectorAll('div.gqcSqV.YGE0gZ img')).map(img => (img as HTMLImageElement).src) || 'image not found';
        // const price = document.querySelector('div.Nx9bqj.CxhGGd')?.textContent?.trim() || 'Price not found';
        // const discountRate = document.querySelector('div.UkUFwK.WW8yVX.dB67CR span')?.textContent?.trim().replace(/[-%]/g, "") || 'discount not found';
        const currency = '₹';
        const descriptionSelectors = [
          'div._4aGEkW',
          'div.yN\+eNk.w9jEaj',
          'meta[name="Description"]',
          'div.product-description',  // Another fallback selector
          'span.product-summary'      // Another fallback
        ];
        
        const description = descriptionSelectors.map(selector => {
          const el = document.querySelector(selector);
          return el ? el.textContent?.trim() : null;
        }).find(text => text) || 'Description not found';
        // const description = document.querySelector('div._4aGEkW')?.textContent?.trim() || 'Description not found';
        // const originalPrice = document.querySelector('div.yRaY8j.A6+E6v')?.textContent?.trim() || 'Price not found';
        const originalPrice = orignalExtractPrice(originalPriceSelectors);
    
        const currentPrice = extractPrice(priceSelectors);
        const discountRate = extractDiscount(discountElement);
    
        return { title, image, currentPrice, originalPrice, discountRate,currency, description };
      });


    const data = {
      url,
      currency: product.currency,
      image: product.image[0],
      title: product.title,
      currentPrice: Number(product.currentPrice),
      originalPrice: Number(product.originalPrice),
      amazonPriceHistory: [],
      flipkartPriceHistory: [],
      priceHistory: [],
      discountRate: Number(product.discountRate),
      category: 'category',
      reviewsCount:100,
      stars: 4.5,
      isOutOfStock: false,
      description: product.description,
      lowestPrice: Number(product.currentPrice) || Number(product.originalPrice),
      highestPrice: Number(product.currentPrice) || Number(product.originalPrice),
      averagePrice: Number(product.currentPrice) || Number(product.originalPrice),
      // Add other fields as needed
    };

    console.log(data, 'Flipkart product data');
    return data;

    } catch (error) {
      console.error("Flipkart scraping error:", error);
    }
  }
  


  