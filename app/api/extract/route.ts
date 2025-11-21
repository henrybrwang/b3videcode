import { NextRequest, NextResponse } from 'next/server';
import { extractReceiptData } from '@/lib/gemini';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window === 'undefined') {
  // Server-side only
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function convertPdfToImage(pdfBuffer: ArrayBuffer): Promise<{ data: string; mimeType: string }> {
  try {
    const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
    const page = await pdf.getPage(1); // Get first page
    
    const viewport = page.getViewport({ scale: 2.0 });
    
    // Create a canvas
    const canvas = {
      width: viewport.width,
      height: viewport.height,
      getContext: () => null,
    };
    
    // For server-side, we need to use node-canvas or similar
    // For simplicity, we'll render to base64
    const { createCanvas } = await import('canvas' as any).catch(() => null);
    
    if (!createCanvas) {
      // Fallback: just use the PDF data directly
      // Gemini can handle PDF format
      const base64 = Buffer.from(pdfBuffer).toString('base64');
      return {
        data: base64,
        mimeType: 'application/pdf',
      };
    }
    
    const nodeCanvas = createCanvas(viewport.width, viewport.height);
    const context = nodeCanvas.getContext('2d');
    
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;
    
    // Convert to base64
    const imageData = nodeCanvas.toDataURL('image/png').split(',')[1];
    
    return {
      data: imageData,
      mimeType: 'image/png',
    };
  } catch (error) {
    console.error('PDF conversion error:', error);
    // Fallback: return PDF as-is
    const base64 = Buffer.from(pdfBuffer).toString('base64');
    return {
      data: base64,
      mimeType: 'application/pdf',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, JPG, and PNG are supported.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    
    let imageData: string;
    let mimeType: string;

    if (file.type === 'application/pdf') {
      // Convert PDF to image
      const converted = await convertPdfToImage(arrayBuffer);
      imageData = converted.data;
      mimeType = converted.mimeType;
    } else {
      // For images, just convert to base64
      imageData = Buffer.from(arrayBuffer).toString('base64');
      mimeType = file.type;
    }

    // Extract data using Gemini
    const result = await extractReceiptData(imageData, mimeType);

    return NextResponse.json(result);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process receipt' },
      { status: 500 }
    );
  }
}

