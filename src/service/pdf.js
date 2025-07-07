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

export async function createInvoice(invoice) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer); // ← نرجع الـ PDF كـ Buffer
    });

    try {
      generateHeader(doc);
      generateCustomerInformation(doc, invoice);
      generateInvoiceTable(doc, invoice);
      generateFooter(doc);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function generateHeader(doc) {
  const imagePath = path.join(__dirname, "public", "download.jpeg");
  const imageBuffer = fs.readFileSync(imagePath);

  doc
    .image(imageBuffer, 50, 45, { width: 50 }) // استخدم buffer بدلاً من المسار النصي
    .fillColor("#444444")
    .fontSize(20)
    .text("E-commers", 110, 57)
    .fontSize(10)
    .text("Ecommers", 200, 50, { align: "right" })
    .text("123 Main Street", 200, 65, { align: "right" })
    .text("cairo, NY, 10025", 200, 80, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  doc.fillColor("#444444").fontSize(20).text("Invoice", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text("Invoice Number:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(invoice.invoice_nr, 150, customerInformationTop)
    .font("Helvetica")
    .text("Invoice Date:", 50, customerInformationTop + 15)
    .text(formatDate(invoice.Date), 150, customerInformationTop + 15)
    .text("Balance Due:", 50, customerInformationTop + 30)
    .text(formatCurrency(invoice.paid * 100), 150, customerInformationTop + 30)

    .font("Helvetica-Bold")
    .text(invoice.shipping.name, 300, customerInformationTop)
    .font("Helvetica")
    .text(invoice.shipping.address, 300, customerInformationTop + 15)
    .text(
      invoice.shipping.city +
        ", " +
        invoice.shipping.state +
        ", " +
        invoice.shipping.country,
      300,
      customerInformationTop + 30
    )
    .moveDown();

  generateHr(doc, 252);
}

function generateInvoiceTable(doc, invoice) {
  let i;
  const invoiceTableTop = 330;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Item",
    "Unit Cost",
    "Quantity",
    "Line Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  for (i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];
    const position = invoiceTableTop + (i + 1) * 30;

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

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Subtotal",
    formatCurrency(invoice.subtotal * 100)
  );

  const paidToDatePosition = subtotalPosition + 20;
  generateTableRow(
    doc,
    paidToDatePosition,
    "",
    "",
    "Paid To Date",
    formatCurrency(invoice.paid * 100)
  );

  const duePosition = paidToDatePosition + 25;
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    duePosition,
    "",
    "",
    "coupon percint",
    `${invoice.coupon}%`
  );
  doc.font("Helvetica");
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      "Payment is due within 15 days. Thank you for your business.",
      50,
      780,
      { align: "center", width: 500 }
    );
}

function generateTableRow(doc, y, item, unitCost, quantity, lineTotal) {
  doc
    .fontSize(10)
    .text(item || "", 50, y)
    .text(unitCost || "", 150, y, { width: 90, align: "right" })
    .text(quantity || "", 300, y, { width: 90, align: "right" })
    .text(lineTotal || "", 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function formatCurrency(cents) {
  return "$" + (cents / 100).toFixed(2);
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}
