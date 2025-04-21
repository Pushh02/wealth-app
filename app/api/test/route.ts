// pages/api/plaid/refresh-transactions.ts

import { NextApiRequest, NextApiResponse } from 'next';
import plaidClient from '@/lib/plaid';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const accessToken = "access-sandbox-1e860252-0908-40a1-bea0-00cdb5b20bf0"
    
    // Add a delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await plaidClient.transactionsRefresh({ access_token: accessToken });
    console.log(response.data)
    return NextResponse.json({ message: 'Refresh request sent' });
  } catch (error: any) {
    console.error('Plaid refresh error:', error);
    
    if (error.response?.status === 429) {
      return NextResponse.json({ 
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: error.response?.headers?.['retry-after'] || 60
      }, { status: 429 });
    }
    
    return NextResponse.json({ 
      message: 'Error refreshing transactions',
      error: error.message 
    }, { status: 500 });
  }
}