// /pages/api/updateProductData.ts
// /pages/api/updateProductData.ts
import { NextResponse } from 'next/server';

// Temporary variable to store last query data
let lastTitle = '';
let lastPrice;

export async function POST(req: Request) {
  const { title,price } = await req.json();
  lastTitle = title;
  lastPrice = price;

  return NextResponse.json({ message: 'Data received', title });
}

export async function GET() {
  return NextResponse.json({ title: lastTitle });
}