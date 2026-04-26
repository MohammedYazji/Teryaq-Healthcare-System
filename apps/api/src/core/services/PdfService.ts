import puppeteer from "puppeteer-core";
import ejs from "ejs";
import { AppError } from "../errors/AppError";

export class PdfService {
  /**
   * Generates a PDF buffer from an EJS template and data
   * We use puppeteer-core to use the local Chrome and avoid heavy downloads
   */
  static async generatePdf(templatePath: string, data: any): Promise<Buffer> {
    try {
      // Render HTML from EJS template
      const html = await ejs.renderFile(templatePath, data);

      // Launch using local Chrome
      const browser = await puppeteer.launch({
        // Point to the local Chrome installation on Windows
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      // Create page and set content
      const page = await browser.newPage();
      await page.setContent(html as string, { waitUntil: "networkidle0" });

      // Generate the PDF
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          right: "10mm",
          bottom: "20mm",
          left: "10mm",
        },
      });

      // 5. Cleanup
      await browser.close();
      return Buffer.from(pdfBuffer);
    } catch (error: any) {
      console.error("PDF Generation Error:", error);
      throw new AppError(`Failed to generate PDF: ${error.message}`, 500);
    }
  }
}
