export interface ReceiptLine {
  id: string;
  date: string;
  supplier: string;
  amount: number;
  currency: string;
  category: string;
  vatRate: number;
  amountExclVat: number;
  isDomestic: boolean;
  description?: string;
}

export interface ExtractionResult {
  lines: ReceiptLine[];
  rawText?: string;
}

export interface MaconomyCategory {
  code: string;
  name: string;
}

export interface UploadedFile {
  file: File;
  preview?: string;
}

