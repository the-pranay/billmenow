import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = searchParams.get('data');
    const size = searchParams.get('size') || '200';

    if (!data) {
      return NextResponse.json({
        success: false,
        error: 'Data parameter is required'
      }, { status: 400 });
    }

    // Generate QR code as data URL
    const qrDataURL = await QRCode.toDataURL(data, {
      width: parseInt(size),
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Return the QR code as an image
    const base64Data = qrDataURL.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('QR code generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate QR code'
    }, { status: 500 });
  }
}
