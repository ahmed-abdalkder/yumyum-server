// "use strict";
// import fs from "fs";
// import PDFDocument from "pdfkit";
 

// export async function createInvoice(invoice, filename = "invoice.pdf") {
//   return new Promise((resolve, reject) => {
//     const invoicePath = "./public/" + filename;

//     const doc = new PDFDocument({ size: "A4", margin: 50 });
//     const writeStream = fs.createWriteStream(invoicePath);
//     doc.pipe(writeStream);

//     generateHeader(doc);
//     generateCustomerInformation(doc, invoice);
//     generateInvoiceTable(doc, invoice);
//     generateFooter(doc);
//     doc.end();

//     writeStream.on("finish", () => resolve(invoicePath));
//     writeStream.on("error", (err) => reject(err));
//   });
// }
 
// function generateHeader(doc) {
   
//   doc
//     .image(imagePath, 50, 45, { width: 50 })
//     .fillColor("#444444")
//     .fontSize(20)
//     .text("YummuyYumm", 110, 57)
//     .fontSize(10)
//     .text("YummuyYumm", 200, 50, { align: "right" })
//     .text("123 Main Street", 200, 65, { align: "right" })
//     .text("cairo, NY, 10025", 200, 80, { align: "right" })
//     .moveDown();
// }

// function generateCustomerInformation(doc, invoice) {
//   doc.fillColor("#444444").fontSize(20).text("Invoice", 50, 160);

//   generateHr(doc, 185);

//   const customerInformationTop = 200;

//   doc
//     .fontSize(10)
//     .text("Invoice Number:", 50, customerInformationTop)
//     .font("Helvetica-Bold")
//     .text(invoice.invoice_nr, 150, customerInformationTop)
//     .font("Helvetica")
//     .text("Invoice Date:", 50, customerInformationTop + 15)
//     .text(formatDate(invoice.Date), 150, customerInformationTop + 15)
//     .text("Balance Due:", 50, customerInformationTop + 30)
//     .text(formatCurrency(invoice.paid * 100), 150, customerInformationTop + 30)

//     .font("Helvetica-Bold")
//     .text(invoice.shipping.name, 300, customerInformationTop)
//     .font("Helvetica")
//     .text(invoice.shipping.address, 300, customerInformationTop + 15)
//     .text(
//       invoice.shipping.city +
//         ", " +
//         invoice.shipping.state +
//         ", " +
//         invoice.shipping.country,
//       300,
//       customerInformationTop + 30,
//     )
//     .moveDown();

//   generateHr(doc, 252);
// }

// function generateInvoiceTable(doc, invoice) {
//   let i;
//   const invoiceTableTop = 330;

//   doc.font("Helvetica-Bold");
//   generateTableRow(
//     doc,
//     invoiceTableTop,
//     "Item",
//     "Unit Cost",
//     "Quantity",
//     "Line Total",
//   );
//   generateHr(doc, invoiceTableTop + 20);
//   doc.font("Helvetica");

//   for (i = 0; i < invoice.items.length; i++) {
//     const item = invoice.items[i];
//     const position = invoiceTableTop + (i + 1) * 30;

//     generateTableRow(
//       doc,
//       position,
//       item.title,
//       formatCurrency(item.price * 100),
//       item.quantity,
//       formatCurrency(item.finalprice * 100),
//     );

//     generateHr(doc, position + 20);
//   }

//   const subtotalPosition = invoiceTableTop + (i + 1) * 30;
//   generateTableRow(
//     doc,
//     subtotalPosition,
//     "",
//     "",
//     "Subtotal",
//     "",
//     formatCurrency(invoice.subtotal * 100),
//   );

//   const paidToDatePosition = subtotalPosition + 20;
//   generateTableRow(
//     doc,
//     paidToDatePosition,
//     "",
//     "",
//     "Paid To Date",
//     "",
//     formatCurrency(invoice.paid * 100),
//   );

//   const duePosition = paidToDatePosition + 25;
//   doc.font("Helvetica-Bold");
//   generateTableRow(
//     doc,
//     duePosition,
//     "",
//     "",
//     "coupon percint",
//     "",
//     `${invoice.coupon}%`,
//   );
//   doc.font("Helvetica");
// }

// function generateFooter(doc) {
//   doc
//     .fontSize(10)
//     .text(
//       "Payment is due within 15 days. Thank you for your business.",
//       50,
//       780,
//       { align: "center", width: 500 },
//     );
// }

// function generateTableRow(doc, y, item, unitCost, quantity, lineTotal) {
//   doc
//     .fontSize(10)
//     .text(item, 50, y)
//     .text(unitCost, 150, y, { width: 90, align: "right" })
//     .text(quantity, 300, y, { width: 90, align: "right" })
//     .text(lineTotal, 0, y, { align: "right" });
// }

// function generateHr(doc, y) {
//   doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
// }

// function formatCurrency(cents) {
//   return "$" + (cents / 100).toFixed(2);
// }

// function formatDate(date) {
//   const day = date.getDate();
//   const month = date.getMonth() + 1;
//   const year = date.getFullYear();

//   return year + "/" + month + "/" + day;
// }


"use strict";

import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// المسار الكامل لمجلد الصور والإنفويز
const logoPath = path.join(__dirname, "../assets/download.jpeg");
const invoiceDir = path.join(__dirname, "../invoices");

export async function createInvoice(invoice, filename = "invoice.pdf") {
  return new Promise((resolve, reject) => {
    // تأكد إن مجلد الفواتير موجود
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }

    const invoicePath = path.join(invoiceDir, filename);

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const writeStream = fs.createWriteStream(invoicePath);
    doc.pipe(writeStream);

    // قراءة صورة اللوجو من ملف محلي
    const imageBuffer = fs.readFileSync(logoPath);

    generateHeader(doc, imageBuffer);
    generateCustomerInformation(doc, invoice);
    generateInvoiceTable(doc, invoice);
    generateFooter(doc);
    doc.end();

    writeStream.on("finish", () => resolve(invoicePath));
    writeStream.on("error", (err) => reject(err));
  });
}

function generateHeader(doc, imageBuffer) {
  doc
    .image(imageBuffer, 50, 45, { width: 50 })
    .fillColor("#444444")
    .fontSize(20)
    .text("YummyYumm", 110, 57)
    .fontSize(10)
    .text("YummyYumm", 200, 50, { align: "right" })
    .text("123 Main Street", 200, 65, { align: "right" })
    .text("Cairo, Egypt", 200, 80, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  doc.fillColor("#444444").fontSize(20).text("Invoice", 50, 160);
  generateHr(doc, 185);

  const top = 200;
  doc
    .fontSize(10)
    .text("Invoice Number:", 50, top)
    .font("Helvetica-Bold")
    .text(invoice.invoice_nr, 150, top)
    .font("Helvetica")
    .text("Invoice Date:", 50, top + 15)
    .text(formatDate(invoice.Date), 150, top + 15)
    .text("Balance Due:", 50, top + 30)
    .text(formatCurrency(invoice.paid * 100), 150, top + 30)

    .font("Helvetica-Bold")
    .text(invoice.shipping.name, 300, top)
    .font("Helvetica")
    .text(invoice.shipping.address, 300, top + 15)
    .text(
      `${invoice.shipping.city}, ${invoice.shipping.state}, ${invoice.shipping.country}`,
      300,
      top + 30
    )
    .moveDown();

  generateHr(doc, 252);
}

function generateInvoiceTable(doc, invoice) {
  let i;
  const tableTop = 330;

  doc.font("Helvetica-Bold");
  generateTableRow(doc, tableTop, "Item", "Unit Cost", "Quantity", "Line Total");
  generateHr(doc, tableTop + 20);
  doc.font("Helvetica");

  for (i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];
    const position = tableTop + (i + 1) * 30;

    generateTableRow(
      doc,
      position,
      item.title,
      formatCurrency(item.price * 100),
      item.quantity,
      formatCurrency(item.finalprice * 100)
    );

    generateHr(doc, position + 20);
  }

  const subtotalPos = tableTop + (i + 1) * 30;
  generateTableRow(doc, subtotalPos, "", "", "Subtotal", formatCurrency(invoice.subtotal * 100));

  const paidPos = subtotalPos + 20;
  generateTableRow(doc, paidPos, "", "", "Paid To Date", formatCurrency(invoice.paid * 100));

  const duePos = paidPos + 25;
  doc.font("Helvetica-Bold");
  generateTableRow(doc, duePos, "", "", "Coupon Percent", `${invoice.coupon}%`);
  doc.font("Helvetica");
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text("Payment is due within 15 days. Thank you for your business.", 50, 780, {
      align: "center",
      width: 500,
    });
}

function generateTableRow(doc, y, item, unitCost, quantity, lineTotal) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(unitCost, 150, y, { width: 90, align: "right" })
    .text(quantity, 300, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function formatCurrency(cents) {
  return "$" + (cents / 100).toFixed(2);
}

function formatDate(date) {
  const d = new Date(date);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}
