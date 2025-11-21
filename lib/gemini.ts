import { GoogleGenerativeAI } from '@google/generative-ai';
import { MACONOMY_CATEGORIES } from './categories';
import { ExtractionResult, ReceiptLine } from './types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function extractReceiptData(
  imageData: string,
  mimeType: string,
  fileName: string
): Promise<ExtractionResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const categoriesText = MACONOMY_CATEGORIES.map(
    cat => `${cat.code} - ${cat.name}`
  ).join('\n');

  const prompt = `Du är en expert på att extrahera information från kvitton för redovisningssystem.

Analysera detta kvitto och extrahera följande information för varje rad/artikel:

1. Datum (format: YYYY-MM-DD)
2. Task - välj EN av följande kategorier baserat på vad som köpts:
${categoriesText}

3. Beskrivning av vad som köpts
4. Antal (quantity) - hur många enheter av denna artikel (ofta 1, men läs av från kvittot om det finns)
5. Styckpris (unit price) - pris per enhet INKLUSIVE moms
6. Valuta (SEK, EUR, USD, etc.)
7. Momssats (taxCode) - vanliga värden: 0, 6, 12, 25 procent
8. Totalt belopp (amount) - quantity × unit price

VIKTIGA REGLER:
- Om kvittot är utländskt/från utlandet: sätt ALLTID taxCode till 0
- Om kvittot är från Sverige: använd korrekt momssats (vanligast 25%, mat ofta 12%, vissa varor 6%)
- Om kvittot har flera olika momssatser, dela upp i separata rader
- Om flera artiklar har samma momssats och kategori, kan de kombineras till en rad
- Beräkna totalt belopp = quantity × unitPrice
- Välj mest passande Task-kategori, om osäker använd "Inget av ovanstående - övrigt"

Svara ENDAST med giltig JSON i följande format (ingen annan text):
{
  "lines": [
    {
      "date": "YYYY-MM-DD",
      "task": "Kategorinamn från listan",
      "description": "Beskrivning av köpet",
      "quantity": 1.00,
      "unitPrice": 1000.00,
      "currency": "SEK",
      "taxCode": 25,
      "amount": 1000.00
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
      fileName: fileName,
      date: line.date || new Date().toISOString().split('T')[0],
      task: line.task || 'Inget av ovanstående - övrigt',
      description: line.description || '',
      quantity: parseFloat(line.quantity) || 1,
      unitPrice: parseFloat(line.unitPrice) || 0,
      currency: line.currency || 'SEK',
      taxCode: parseFloat(line.taxCode) || 0,
      amount: parseFloat(line.amount) || 0,
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

