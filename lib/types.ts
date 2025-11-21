export interface ReceiptLine {
  id: string;
  fileName: string; // Source receipt filename
  date: string;
  task: string; // Task category name
  description: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  taxCode: number; // VAT percentage (0, 6, 12, 25)
  amount: number; // Total amount
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

