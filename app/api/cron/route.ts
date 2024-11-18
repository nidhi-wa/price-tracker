import { NextResponse } from "next/server";
import cron from 'node-cron';

import { getLowestPrice, getHighestPrice, getAveragePrice, getEmailNotifType } from "@/lib/utils";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import {scrapeProductTitle} from "@/lib/scraper/flipkart";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";

export const maxDuration = 55; // This function can run for a maximum of 300 seconds
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    connectToDB();

    const products = await Product.find({});

    if (!products) throw new Error("No product fetched");

    // ======================== 1 SCRAPE LATEST PRODUCT DETAILS & UPDATE DB
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        // Scrape product
        const scrapedProduct = await scrapeAmazonProduct(currentProduct.url); 

        if (!scrapedProduct) return;

       // Initialize updated price histories
    let updatedCompetitorHistory = currentProduct.competitorPriceHistory || [];
    if (
      currentProduct.competitorPriceHistory &&
      currentProduct.competitorPriceHistory.length > 0
    ) {
      const competitorUrl = currentProduct.competitorPriceHistory[0]?.url;
      if (competitorUrl) {
        // Scrape competitor product
        const scrapedCompetitorData = await scrapeProductTitle(competitorUrl);
        if (scrapedCompetitorData) {
          updatedCompetitorHistory = [
            ...currentProduct.competitorPriceHistory,
            {
              price: scrapedCompetitorData.price,
            },
          ];
        }
      }
    }

        const updatedPriceHistory = [
          ...currentProduct.priceHistory,
          {
            price: scrapedProduct.currentPrice,
          },
        ];

        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          competitorPriceHistory: updatedCompetitorHistory ,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        // Update Products in DB
        const updatedProduct = await Product.findOneAndUpdate(
          {
            url: product.url,
          },
          product
        );

        // ======================== 2 CHECK EACH PRODUCT'S STATUS & SEND EMAIL ACCORDINGLY
        const emailNotifType = getEmailNotifType(
          scrapedProduct,
          currentProduct
        );

        if (emailNotifType && updatedProduct.users.length > 0) {
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
          };
          // Construct emailContent
          const emailContent = await generateEmailBody(productInfo, emailNotifType);
          // Get array of user emails
          const userEmails = updatedProduct.users.map((user: any) => user.email);
          // Send email notification
          await sendEmail(emailContent, userEmails);
        }

        return updatedProduct;
      })
    );

    return NextResponse.json({
      message: "Ok",
      data: updatedProducts,
    });
  } catch (error: any) {
    throw new Error(`Failed to get all products: ${error.message}`);
  }
}


cron.schedule("*/5 * * * *", async () => {
  console.log('Running cron job: Scraping products...');
  
  try {
    // Call the GET function directly to scrape products
    const request = new Request('http://localhost:3001/api/cron');  // Mock Request object
    const response = await GET(request);
    
    console.log('Cron job completed:', await response.json());
  } catch (error:any) {
    console.error('Cron job failed:', error.message);
  }
});
