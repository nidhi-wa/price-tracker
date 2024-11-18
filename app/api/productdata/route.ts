// /pages/api/updateProductData.ts
// /pages/api/updateProductData.ts
import { NextResponse ,NextRequest} from 'next/server';
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model"; // Your Mongoose model

// Temporary variable to store last query data
// let lastTitle = '';
// let lastPrice = Number;
// let lastUrl='';
// let postData={}

// export async function POST(req: Request) {
//   const { title,price,url } = await req.json();

//   postData={
//     title,
//     price,
//     url
//   }
//   // lastTitle = title;
//   // lastPrice = price;
//   // lastUrl = url;

//   return NextResponse.json({ message: 'Data received', title ,price});
// }

// export async function GET() {
//   return NextResponse.json(postData);
// }


export async function PUT(req: NextRequest) {
  try {
    const body = await req.json(); // Parse JSON body
    const { id,  competitorData } = body;
    console.log("Request Body:", body);
console.log("Product ID:", id, "Competitor Data:", competitorData);


    if (!id || ! competitorData) {
      return NextResponse.json(
        { message: 'ID and new data are required' },
        { status: 400 }
      );
    }


    await connectToDB();

    // Update the product's priceHistory array
    const updatedProduct = await Product.findByIdAndUpdate(
      id, // The ID of the product to update
      {
        $push: {
          competitorPriceHistory: {
            price:  competitorData.price,
            date: new Date(),
            ...( competitorData.url && { url: competitorData.url }),
          },
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Price history updated successfully', updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating price history:', error);
    return NextResponse.json(
      { message: 'Failed to update price history', error },
      { status: 500 }
    );
  }
}


// interface UpdateData {
//   id: string;
//   newData: Record<string, any>; // Define more specific types based on your schema
// }

// export async function PUT(req: NextRequest) {
//   try {
//     const body: UpdateData = await req.json(); // Parse the request body
//     const { id, newData } = body;

//     if (!id || !newData) {
//       return NextResponse.json(
//         { message: 'ID and newData are required' },
//         { status: 400 }
//       );
//     }

//     await connectToDB();

//     // Update the product in the database
//     const updatedProduct = await Product.findByIdAndUpdate(
//       id,            // ID of the document to update
//       newData,       // New data to update with
//       { new: true }  // Return the updated document
//     );

//     if (!updatedProduct) {
//       return NextResponse.json(
//         { message: 'Product not found' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(
//       { message: 'Product updated successfully', updatedProduct },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error updating product:', error);
//     return NextResponse.json(
//       { message: 'Failed to update product', error },
//       { status: 500 }
//     );
//   }
// }
