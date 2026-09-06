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
  const serviceName = service?.nom ?? 'Prestation';
  const serviceDescription = service?.description ?? '';
  const filePath = path.join(invoicesDir, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    // ===== Constantes de mise en page =====
    const dateFacture = new Date().toLocaleDateString('fr-FR');
    const datePrestation = booking.date_prestation
      ? new Date(booking.date_prestation).toLocaleDateString('fr-FR')
      : '—';
    const heurePrestation = booking.date_prestation
      ? new Date(booking.date_prestation).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';

    const primaryColor = '#111827';
    const accentColor = '#2563eb';
    const mutedColor = '#6b7280';
    const borderColor = '#e5e7eb';
    const pageWidth = 550;
    const marginLeft = 50;

    // ===== Bandeau d'en-tête =====
    doc.rect(0, 0, 612, 100).fill(primaryColor);

    doc.fontSize(20).font('Helvetica-Bold').fillColor('#ffffff')
       .text('PARIS JANITOR', marginLeft, 35);
    doc.fontSize(9).font('Helvetica').fillColor('#d1d5db')
       .text('Conciergerie & Services Immobiliers', marginLeft, 60)
       .text('Paris, France  •  contact@paris-janitor.fr', marginLeft, 73);

    doc.fontSize(16).font('Helvetica-Bold').fillColor('#ffffff')
       .text('FACTURE', 380, 32, { width: pageWidth - 380, align: 'right' });
    doc.fontSize(9).font('Helvetica').fillColor('#d1d5db')
       .text(`N° ${numeroFacture}`, 380, 55, { width: pageWidth - 380, align: 'right' })
       .text(`Émise le ${dateFacture}`, 380, 68, { width: pageWidth - 380, align: 'right' });

    doc.roundedRect(480, 80, 70, 16, 3).fill('#16a34a');
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#ffffff')
       .text('PAYÉ', 480, 84, { width: 70, align: 'center' });

    // ===== Détails de la prestation =====
    let y = 135;

    doc.fontSize(11).font('Helvetica-Bold').fillColor(primaryColor)
       .text('Détails de la prestation', marginLeft, y);
    y += 22;

    const detailRow = (label: string, value: string, rowY: number) => {
      doc.fontSize(9).font('Helvetica').fillColor(mutedColor).text(label, marginLeft, rowY);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text(value, marginLeft + 150, rowY);
    };

    detailRow('Identifiant réservation', String(booking._id), y);
    y += 18;
    detailRow('Date de la prestation', datePrestation, y);
    y += 18;
    detailRow('Heure de la prestation', heurePrestation, y);
    y += 30;

    doc.strokeColor(borderColor).lineWidth(1).moveTo(marginLeft, y).lineTo(pageWidth, y).stroke();
    y += 25;

    // ===== Tableau =====
    doc.rect(marginLeft, y, pageWidth - marginLeft, 26).fill('#f9fafb');
    doc.fontSize(9).font('Helvetica-Bold').fillColor(mutedColor)
       .text('DESCRIPTION', marginLeft + 12, y + 8)
       .text('MONTANT', 480, y + 8, { width: 60, align: 'right' });
    y += 26;

    doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor)
       .text(serviceName, marginLeft + 12, y + 14, { width: 350 });
    doc.fontSize(9).font('Helvetica').fillColor(mutedColor)
       .text(serviceDescription, marginLeft + 12, y + 30, { width: 350 });
    doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor)
       .text(`${booking.prix_final.toFixed(2)} €`, 480, y + 14, { width: 60, align: 'right' });
    y += 60;

    doc.strokeColor(borderColor).lineWidth(1).moveTo(marginLeft, y).lineTo(pageWidth, y).stroke();
    y += 20;

    // ===== Total =====
    doc.rect(350, y, pageWidth - 350, 40).fill('#eff6ff');
    doc.fontSize(11).font('Helvetica-Bold').fillColor(primaryColor)
       .text('Total réglé', 365, y + 13);
    doc.fontSize(13).font('Helvetica-Bold').fillColor(accentColor)
       .text(`${booking.prix_final.toFixed(2)} €`, 350, y + 12, { width: pageWidth - 350 - 15, align: 'right' });

    // ===== Pied de page =====
    doc.strokeColor(borderColor).lineWidth(1).moveTo(marginLeft, 700).lineTo(pageWidth, 700).stroke();
    doc.fontSize(8).font('Helvetica').fillColor(mutedColor)
       .text(
         'Merci pour votre confiance. Prestation dispensée par Paris Janitor SAS.',
         marginLeft, 712, { width: pageWidth - marginLeft, align: 'center' }
       )
       .text(
         'Paris Janitor SAS — SIRET en cours — contact@paris-janitor.fr',
         marginLeft, 724, { width: pageWidth - marginLeft, align: 'center' }
       );

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