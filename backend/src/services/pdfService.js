const PDFDocument = require('pdfkit');

exports.generatePrescriptionPDF = (prescription, res) => {
  const doc = new PDFDocument({ margin: 50 });

  // Stream the PDF directly to the Express response
  doc.pipe(res);

  // Clinic Header
  doc
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('MedFlow AI Clinic', { align: 'center' })
    .moveDown(0.5);
  
  doc
    .fontSize(10)
    .font('Helvetica')
    .text('123 Health Ave, Medical District, NY 10001', { align: 'center' })
    .text('Phone: (555) 123-4567 | Email: contact@medflow.com', { align: 'center' })
    .moveDown(2);

  // Divider Line
  doc.moveTo(50, 130).lineTo(550, 130).stroke();
  doc.moveDown(2);

  // Patient Info
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Patient Information')
    .font('Helvetica')
    .text(`Name: ${prescription.patientId?.name || 'N/A'}`)
    .text(`Age: ${prescription.patientId?.age || 'N/A'} | Gender: ${prescription.patientId?.gender || 'N/A'}`)
    .moveDown(1);

  // Doctor Info
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Doctor Information')
    .font('Helvetica')
    .text(`Dr. ${prescription.doctorId?.name || 'N/A'}`)
    .text(`${prescription.doctorId?.specialization || 'General Physician'}`)
    .moveDown(2);

  // Diagnosis
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('Diagnosis', { underline: true })
    .fontSize(12)
    .font('Helvetica')
    .text(prescription.diagnosis || 'No specific diagnosis noted.')
    .moveDown(2);

  // Medicines
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('Medicines', { underline: true })
    .moveDown(0.5);

  if (prescription.medicines && prescription.medicines.length > 0) {
    prescription.medicines.forEach((med, index) => {
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(`${index + 1}. ${med.name}`)
        .font('Helvetica')
        .text(`   Dosage: ${med.dosage}`)
        .text(`   Duration: ${med.duration}`)
        .text(`   Instructions: ${med.instructions || 'None'}`)
        .moveDown(0.5);
    });
  } else {
    doc.font('Helvetica').text('No medicines prescribed.');
  }

  doc.moveDown(2);

  // Notes
  if (prescription.notes) {
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Additional Notes', { underline: true })
      .fontSize(12)
      .font('Helvetica')
      .text(prescription.notes)
      .moveDown(2);
  }

  // Footer Signature
  doc.moveDown(4);
  doc.moveTo(400, doc.y).lineTo(550, doc.y).stroke();
  doc.text('Doctor\'s Signature', 400, doc.y + 10, { align: 'center', width: 150 });

  // Finalize PDF
  doc.end();
};
