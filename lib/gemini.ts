import { GoogleGenerativeAI } from '@google/generative-ai';
import { MACONOMY_CATEGORIES } from './categories';
import { ExtractionResult, ReceiptLine } from './types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function extractReceiptData(
  imageData: string,
  mimeType: string
): Promise<ExtractionResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const categoriesText = MACONOMY_CATEGORIES.map(
    cat => `${cat.code} - ${cat.name}`
  ).join('\n');

  const prompt = `Du är en expert på att extrahera information från kvitton för redovisningssystem.

Analysera detta kvitto och extrahera följande information för varje rad/artikel:

1. Datum (format: YYYY-MM-DD)
2. Leverantör/företagsnamn
3. Belopp inklusive moms
4. Valuta (SEK, EUR, USD, etc.)
5. Momssats (procent, t.ex. 25, 12, 6, 0)
6. Belopp exklusive moms (beräkna detta)
7. Om transaktionen är inrikes (Sverige) eller utrikes
8. En kort beskrivning av vad som köpts

Kategorisera varje rad enligt följande Maconomy-kategorier:
${categoriesText}

VIKTIGT:
- Om kvittot har flera olika momssatser, dela upp i separata rader
- Om flera artiklar har samma momssats, kan de kombineras till en rad
- Beräkna belopp exklusive moms korrekt: belopp_inkl_moms / (1 + momssats/100)
- Välj den mest passande kategorin baserat på vad som köpts
- Om osäker, använd kategori 9998

Svara ENDAST med giltig JSON i följande format (ingen annan text):
{
  "lines": [
    {
      "date": "YYYY-MM-DD",
      "supplier": "Företagsnamn",
      "amount": 1000.00,
      "currency": "SEK",
      "category": "5410",
      "vatRate": 25,
      "amountExclVat": 800.00,
      "isDomestic": true,
      "description": "Beskrivning"
    }
  ]
}`;

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          data: imageData,
          mimeType: mimeType,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();

    // Extract JSON from response (remove any markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const parsed = JSON.parse(jsonText);

    // Add unique IDs to each line
    const lines: ReceiptLine[] = parsed.lines.map((line: any, index: number) => ({
      id: `line-${Date.now()}-${index}`,
      date: line.date || new Date().toISOString().split('T')[0],
      supplier: line.supplier || 'Okänd leverantör',
      amount: parseFloat(line.amount) || 0,
      currency: line.currency || 'SEK',
      category: line.category || '9998',
      vatRate: parseFloat(line.vatRate) || 0,
      amountExclVat: parseFloat(line.amountExclVat) || 0,
      isDomestic: line.isDomestic !== undefined ? line.isDomestic : true,
      description: line.description || '',
    }));

    return {
      lines,
      rawText: text,
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to extract receipt data. Please try again.');
  }
}

export async function convertPdfPageToImage(
  pdfData: ArrayBuffer,
  pageNumber: number = 1
): Promise<{ data: string; mimeType: string }> {
  // This will be imported dynamically in the API route
  // to avoid browser/server compatibility issues
  throw new Error('This function should be called server-side only');
}

