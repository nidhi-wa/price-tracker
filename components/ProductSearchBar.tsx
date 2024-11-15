"use client"
import React from 'react'
import {useState }from 'react'
import {scrapeProductTitle} from "@/lib/scraper/flipkart";
import stringSimilarity from "string-similarity";

interface Props {
    title: string;
  }

export default function ProductSearchBar({ title }: Props) {

    const [competitorUrl, setCompetitorUrl] = useState('');
    const [isMatch, setIsMatch] = useState<boolean>(false);


    const handleSearch = async (competitorData:any) => {
        try {
          const response = await fetch('/api/productdata', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title: competitorData.title , price:competitorData.price}),
          });
          const data = await response.json();
          console.log('Server response:', data);
        } catch (error) {
          console.error('Error sending data:', error);
        }
      };
    

     // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => setCompetitorUrl(e.target.value);
  // Compare competitor product with current product
  const compareProduct = async () => {
    let competitorData;
    try {
        if (competitorUrl.includes('amazon') || competitorUrl.includes('flipkart')) {
            competitorData = await scrapeProductTitle(competitorUrl);
          } else {
            alert("Please enter a valid Amazon or Flipkart URL.");
            return;
          }

      // Perform title comparison
      const similarity = stringSimilarity.compareTwoStrings(title, competitorData.title);
      setIsMatch(similarity >= 0.7); // Adjust threshold if necessary
      if(isMatch){
        handleSearch(competitorData);
      }
    } catch (error) {
      console.error("Error fetching competitor data:", error);
    }
  };

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
