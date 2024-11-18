"use server"

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User } from "@/types";
import { generateEmailBody, sendEmail } from "../nodemailer";

export async function scrapeAndStoreProduct(productUrl: string) {
  if (!productUrl) return;

  try {
    await connectToDB();

    // Determine platform and scrape accordingly
    const isAmazon = productUrl.includes("amazon");
    const isFlipkart = productUrl.includes("flipkart");
    
    let scrapedProduct;
    let platform = '';

    if (isAmazon) {
      scrapedProduct = await scrapeAmazonProduct(productUrl);
      platform = 'amazon';
    } else if (isFlipkart) {
      scrapedProduct = await scrapeAmazonProduct(productUrl);
      platform = 'flipkart';
    }

    if (!scrapedProduct) return;

    // Find existing product in the central collection by a unified identifier, like product title or a common SKU
    const existingProduct = await Product.findOne({ title: scrapedProduct.title });

    let productData = scrapedProduct;
    const priceEntry = { price: scrapedProduct.currentPrice };

    if (existingProduct) {
      // Append to the price history based on platform
      const updatedPriceHistory : any = platform === 'amazon'
        ? { amazonPriceHistory: [...existingProduct.amazonPriceHistory, priceEntry] }
        : { flipkartPriceHistory: [...existingProduct.flipkartPriceHistory, priceEntry] };

      productData = {
        ...scrapedProduct,
        ...updatedPriceHistory,
        priceHistory:updatedPriceHistory.amazonPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory.amazonPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory.amazonPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory.amazonPriceHistory),
      };
    }
    //} else {
    //   // Initialize price histories if product is new
    //   productData = {
    //     ...scrapedProduct,
    //     flipkartPriceHistory: platform === 'flipkart' ? [priceEntry] : [],
    //     amazonPriceHistory: platform === 'amazon' ? [priceEntry] : [],
    //   };
    // }

    // Upsert the product document
    const newProduct = await Product.findOneAndUpdate(
      {  url: scrapedProduct.url },
      productData,
      { upsert: true, new: true }
    );

    // Revalidate path for updated product
    revalidatePath(`/products/${newProduct._id}`);
  } catch (error: any) {
    throw new Error(`Failed to create/update product: ${error.message}`);
  }
}

// export async function scrapeAndStoreProduct(productUrl: string) {
//   if(!productUrl) return;

//   try {
//     connectToDB();

//     const scrapedProduct = await scrapeAmazonProduct(productUrl);

//     if(!scrapedProduct) return;

//     let product = scrapedProduct;

//     const existingProduct = await Product.findOne({ url: scrapedProduct.url });

//     if(existingProduct) {
//       const updatedPriceHistory: any = [
//         ...existingProduct.priceHistory,
//         { price: scrapedProduct.currentPrice }
//       ]

//       product = {
//         ...scrapedProduct,
//         priceHistory: updatedPriceHistory,
//         lowestPrice: getLowestPrice(updatedPriceHistory),
//         highestPrice: getHighestPrice(updatedPriceHistory),
//         averagePrice: getAveragePrice(updatedPriceHistory),
//       }
//     }

//     const newProduct = await Product.findOneAndUpdate(
//       { url: scrapedProduct.url },
//       product,
//       { upsert: true, new: true }
//     );

//     revalidatePath(`/products/${newProduct._id}`);
//   } catch (error: any) {
//     throw new Error(`Failed to create/update product: ${error.message}`)
//   }
// }

export async function getProductById(productId: string) {
  try {
    connectToDB();

    const product = await Product.findOne({ _id: productId });

    if(!product) return null;

    return product;
  } catch (error) {
    console.log(error);
  }
}

export async function getAllProducts() {
  try {
    connectToDB();

    const products = await Product.find();

    return products;
  } catch (error) {
    console.log(error);
  }
}

export async function getSimilarProducts(productId: string) {
  try {
    connectToDB();

    const currentProduct = await Product.findById(productId);

    if(!currentProduct) return null;

    const similarProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(3);

    return similarProducts;
  } catch (error) {
    console.log(error);
  }
}

export async function addUserEmailToProduct(productId: string, userEmail: string) {
  try {
    const product = await Product.findById(productId);

    if(!product) return;

    const userExists = product.users.some((user: User) => user.email === userEmail);

    if(!userExists) {
      product.users.push({ email: userEmail });

      await product.save();

      const emailContent = await generateEmailBody(product, "WELCOME");

      await sendEmail(emailContent, [userEmail]);
      console.log("hii",emailContent);
    }
  } catch (error) {
    console.log(error);
  }
}