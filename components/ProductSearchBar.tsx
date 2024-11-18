"use client"
import React from 'react'
import {useState,useEffect }from 'react'
import {scrapeProductTitle} from "@/lib/scraper/flipkart";
import stringSimilarity from "string-similarity";

interface Props {
    title: string;
    productId:  string;
  }

export default function ProductSearchBar({ title,  productId }: Props) {

    const [competitorUrl, setCompetitorUrl] = useState('');
    const [competitorData, setCompetitorData] = useState<{
      title: string;
      price: number;
      url: string;
    } | null>(null);
    const [isMatch, setIsMatch] = useState<boolean>(false);


    console.log("product with ID:",  productId)


    // const handleSearch = async (competitorData:any) => {
    //     try {
    //       const response = await fetch('/api/productdata', {
    //         method: 'POST',
    //         headers: {
    //           'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ title: competitorData.title , price:competitorData.price,url:competitorData.url}),
    //       });
    //       const data = await response.json();
    //       console.log('Server response:', data);
    //     } catch (error) {
    //       console.error('Error sending data:', error);
    //     }
    //   };

    const updateProductInDatabase = async ( id: string | undefined,
      competitorData: { title: string; price: number; url: string }) => {
      try {
        console.log("Updating product with ID:", id, "Competitor Data:", competitorData);

        const response = await fetch('http://localhost:3000/api/productdata', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, competitorData }),
        });
    
        if (!response.ok) {
          console.error(`Failed to update product: ${response.status}`);
          throw new Error(`Failed to update product: ${response.status}`);
        }
    
        const result = await response.json();
        console.log('Product updated successfully:', result);
      } catch (error) {
        console.error('Error updating product:', error);
      }
    };
    

     // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => setCompetitorUrl(e.target.value);
  // Compare competitor product with current product
  const compareProduct = async () => {
    try {
      if (competitorUrl.includes("amazon") || competitorUrl.includes("flipkart")) {
        const data = await scrapeProductTitle(competitorUrl);
        setCompetitorData(data);

        console.log("Competitor Data:", data);

        // Perform title comparison
        const similarity = stringSimilarity.compareTwoStrings(title, data.title);
        const match = similarity >= 0.7; // Adjust threshold if necessary
        setIsMatch(match);

        console.log("Title similarity:", similarity, "isMatch:", match);
      } else {
        alert("Please enter a valid Amazon or Flipkart URL.");
      }
    } catch (error) {
      console.error("Error fetching competitor data:", error);
    }
  };

  // Call updateProductInDatabase when isMatch becomes true
  useEffect(() => {
    if (isMatch && competitorData) {
      console.log("Calling updateProductInDatabase...");
      updateProductInDatabase(productId, competitorData);
    }
  }, [isMatch, competitorData, productId]);

  console.log(isMatch,"isMatch");

  return (
    <div>

         {/* Competitor Comparison Input */}
         <div className="competitor-comparison">
            <input
              type="text"
              value={competitorUrl}
              onChange={handleUrlChange}
              placeholder="Enter Amazon or Flipkart product URL"
              className="input"
            />
            <button onClick={compareProduct} className="btn">Compare</button>
          </div>
          {isMatch !== null && (
            <p>{isMatch ? "The products match!" : "The products do not match."}</p>
          )}
      
    </div>
  )
}
