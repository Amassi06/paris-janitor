import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { IBooking } from '../models/Booking.js';
import { Invoice } from '../models/Invoice.js';
import { Service } from '../models/Service.js';

export const generateInvoicePDF = async (booking: IBooking): Promise<string> => {
  const invoicesDir = path.resolve('public/invoices');
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const numeroFacture = `INV-${Date.now()}`;
  const fileName = `${numeroFacture}.pdf`;
  
  const service = await Service.findById(booking.id_service);
  const serviceName = service?.nom;
  const serviceDescription = service?.description
  const filePath = path.join(invoicesDir, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

  // En-tête société
doc.fontSize(18).font('Helvetica-Bold').text('PARIS JANITOR', 50, 50);
doc.fontSize(9).font('Helvetica').fillColor('#666666')
   .text('Conciergerie & Services Immobiliers', 50, 72)
   .text('Paris, France | contact@paris-janitor.fr', 50, 84);

// Numéro et date à droite
doc.fontSize(10).fillColor('#111111')
   .text(`Facture : ${numeroFacture}`, 380, 50, { align: 'right' })
   .text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 380, 65, { align: 'right' })
   .text(`Statut : Payé`, 380, 80, { align: 'right' });

// Séparateur
doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, 110).lineTo(550, 110).stroke();

// Détails réservation
doc.fontSize(11).font('Helvetica-Bold').fillColor('#111111').text('Détails de la prestation', 50, 130);
doc.fontSize(10).font('Helvetica').fillColor('#444444')
   .text(`Identifiant Réservation : ${booking._id}`, 50, 150);

// Ligne de tableau
doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, 180).lineTo(550, 180).stroke();
doc.font('Helvetica-Bold').fillColor('#111111')
   .text('Description', 50, 190)
   .text('Total', 480, 190, { align: 'right' });
doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, 205).lineTo(550, 205).stroke();

doc.font('Helvetica').fillColor('#333333')
   .text(`${serviceName} : ${serviceDescription}`, 50, 215)
   .text(`${booking.prix_final.toFixed(2)} €`, 480, 215, { align: 'right' });

doc.strokeColor('#111111').lineWidth(1).moveTo(350, 240).lineTo(550, 240).stroke();
doc.font('Helvetica-Bold').fontSize(12).fillColor('#111111')
   .text('Total réglé :', 350, 250)
   .text(`${booking.prix_final.toFixed(2)} €`, 480, 250, { align: 'right' });

// Pied de page
doc.fontSize(9).font('Helvetica').fillColor('#888888')
   .text('Merci pour votre confiance. Prestation dispensée par Paris Janitor SAS.', 50, 720, { align: 'center' });
    doc.end();

    writeStream.on('finish', async () => {
      try {
        const publicUrl = `/invoices/${fileName}`;
        await Invoice.create({
          id_booking: booking._id,
          montant: booking.prix_final,
          numero_facture: numeroFacture,
          url_pdf: publicUrl,
        });
        resolve(publicUrl);
      } catch (err) {
        reject(err);
      }
    });

    writeStream.on('error', (err) => reject(err));
  });
};