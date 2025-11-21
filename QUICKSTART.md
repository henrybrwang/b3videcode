# MacEasy - Quick Start Guide

## Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure API Key:**
   - Get your Gemini API key from: https://aistudio.google.com/app/apikey
   - Create a `.env.local` file in the project root
   - Add your API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser:**
   Navigate to http://localhost:3000

## Project Structure

```
/app
  /api/extract/route.ts  - API endpoint for receipt processing
  /page.tsx              - Main application page
  /layout.tsx            - Root layout
  /globals.css           - Global styles
  /favicon.ico           - App icon

/components
  /UploadZone.tsx        - File upload component
  /ResultsTable.tsx      - Editable results table
  /ExportButton.tsx      - CSV export functionality

/lib
  /gemini.ts             - Gemini API client
  /categories.ts         - Maconomy categories
  /types.ts              - TypeScript type definitions
```

## Features Implemented

✅ Drag-and-drop file upload (PDF, JPG, PNG)
✅ Google Gemini AI integration for OCR
✅ Automatic categorization to Maconomy categories
✅ Editable table with inline editing
✅ Multiple VAT rate support
✅ Domestic/International transaction detection
✅ CSV export for Maconomy import
✅ Beautiful, modern UI with Tailwind CSS
✅ Real-time validation and error handling
✅ Summary statistics

## Usage Flow

1. **Upload a receipt** - Drag and drop or click to select a PDF or image file
2. **Wait for processing** - The AI analyzes the receipt (takes a few seconds)
3. **Review data** - Check and edit extracted information in the table
4. **Export** - Click "Exportera till CSV" to download the file for Maconomy

## API Configuration

The application uses:
- **Google Gemini AI**: gemini-1.5-flash model
- **PDF.js**: For PDF processing
- **PapaParse**: For CSV export

## Building for Production

```bash
npm run build
npm start
```

## Notes

- All data is processed client-side (React state)
- No data is stored on the server
- API key is kept secure server-side only
- Maximum file size: 10MB
- Supported formats: PDF, JPG, PNG

## Troubleshooting

**Issue: "No API key" error**
- Make sure you created the `.env.local` file
- Verify the API key is correct
- Restart the development server after adding the key

**Issue: PDF processing fails**
- Try converting the PDF to an image first
- Check the PDF file isn't corrupted
- Ensure the file is under 10MB

**Issue: Extraction quality is poor**
- Ensure the receipt image is clear and well-lit
- Try a higher resolution scan/photo
- The AI works best with standard receipt formats

