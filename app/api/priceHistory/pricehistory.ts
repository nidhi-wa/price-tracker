import { connectToDB } from "@/lib/mongoose";  // Adjust path if necessary

import type { NextApiRequest, NextApiResponse } from 'next';
import Product from "@/lib/models/product.model";

interface PriceHistoryEntry {
  price: number;
  date: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Extract the product ID from the query parameters
    const { productId } = req.query;

    if (!productId || typeof productId !== 'string') {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    // Connect to MongoDB
    connectToDB();

    // Fetch the price history data for the given product
    const priceHistory: PriceHistoryEntry[] = await Product
      .find({ productId }) 
      .select('priceHistory')


    res.status(200).json(priceHistory);
  } catch (error) {
    console.error("Error fetching price history:", error);
    res.status(500).json({ error: "Failed to fetch price history" });
  }
}