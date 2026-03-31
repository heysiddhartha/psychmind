/**
 * Session Notes PDF Generator
 * Generates professional clinical PDF documents for session notes
 * Uses jsPDF for PDF generation and ImageKit for storage
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { uploadToImageKit, blobToBase64 } from './imagekitService';
import { supabase } from '@/lib/supabase';

interface SessionNotePDFData {
    patientName: string;
    therapistName: string;
    sessionDate: string;
    serviceType: string;
    durationMinutes: number;
    noteType: 'soap' | 'simple';
    soapNotes?: {
        subjective: string;
        objective: string;
        assessment: string;
        plan: string;
    };
    simpleNotes?: string;
    sessionGoals?: string;
    interventions?: string[];
    homeworkAssigned?: string;
    riskAssessment?: string;
    isSigned?: boolean;
    signedAt?: string;
}

/**
 * Generate a professional PDF for session notes
 */
export function generateSessionNotesPDF(data: SessionNotePDFData): jsPDF {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = 20;

    // --- Header with branding ---
    doc.setFillColor(6, 182, 212); // cyan-500
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Logo text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('The 3 Tree Counseling', margin, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Clinical Session Notes', margin, 26);

    // Confidential badge
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth - margin - 45, 10, 45, 12, 2, 2, 'F');
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('🔒 CONFIDENTIAL', pageWidth - margin - 42, 18);

    // Date on header
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth - margin - 45, 34);

    yPos = 50;

    // --- Patient & Session Info Section ---
    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information', margin + 5, yPos + 8);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105); // slate-500

    const col1X = margin + 5;
    const col2X = margin + contentWidth / 2;

    doc.text(`Patient: ${data.patientName}`, col1X, yPos + 16);
    doc.text(`Therapist: ${data.therapistName}`, col2X, yPos + 16);
    doc.text(`Session Date: ${data.sessionDate}`, col1X, yPos + 23);
    doc.text(`Service Type: ${data.serviceType.replace(/_/g, ' ')}`, col2X, yPos + 23);
    doc.text(`Duration: ${data.durationMinutes} minutes`, col1X, yPos + 30);

    if (data.isSigned) {
        doc.setTextColor(22, 163, 74); // green-600
        doc.text(`✓ Signed: ${data.signedAt ? new Date(data.signedAt).toLocaleString() : 'Yes'}`, col2X, yPos + 30);
    }

    yPos += 42;

    // --- Divider ---
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    // --- Notes Content ---
    if (data.noteType === 'soap' && data.soapNotes) {
        const sections = [
            { key: 'subjective', label: 'S — Subjective', content: data.soapNotes.subjective, color: [59, 130, 246] as [number, number, number] }, // blue
            { key: 'objective', label: 'O — Objective', content: data.soapNotes.objective, color: [34, 197, 94] as [number, number, number] },    // green
            { key: 'assessment', label: 'A — Assessment', content: data.soapNotes.assessment, color: [245, 158, 11] as [number, number, number] }, // amber
            { key: 'plan', label: 'P — Plan', content: data.soapNotes.plan, color: [168, 85, 247] as [number, number, number] },                   // purple
        ];

        for (const section of sections) {
            // Check if we need a new page
            if (yPos > 260) {
                doc.addPage();
                yPos = 20;
            }

            // Section colored bar
            doc.setFillColor(section.color[0], section.color[1], section.color[2]);
            doc.rect(margin, yPos, 3, 8, 'F');

            // Section title
            doc.setTextColor(30, 41, 59);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(section.label, margin + 6, yPos + 6);
            yPos += 12;

            // Section content
            doc.setTextColor(71, 85, 105);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');

            const content = section.content || 'No notes recorded.';
            const lines = doc.splitTextToSize(content, contentWidth - 10);

            for (const line of lines) {
                if (yPos > 275) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(line, margin + 6, yPos);
                yPos += 5;
            }

            yPos += 8;
        }
    } else if (data.simpleNotes) {
        // Simple notes format
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Session Notes', margin, yPos + 6);
        yPos += 12;

        doc.setTextColor(71, 85, 105);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const lines = doc.splitTextToSize(data.simpleNotes, contentWidth - 10);
        for (const line of lines) {
            if (yPos > 275) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(line, margin + 5, yPos);
            yPos += 5;
        }
        yPos += 8;
    }

    // --- Additional Info ---
    if (data.sessionGoals || data.homeworkAssigned || data.riskAssessment) {
        if (yPos > 240) {
            doc.addPage();
            yPos = 20;
        }

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;

        if (data.sessionGoals) {
            doc.setTextColor(30, 41, 59);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Session Goals', margin, yPos + 5);
            yPos += 10;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            const goalLines = doc.splitTextToSize(data.sessionGoals, contentWidth);
            for (const line of goalLines) {
                doc.text(line, margin, yPos);
                yPos += 5;
            }
            yPos += 5;
        }

        if (data.homeworkAssigned) {
            doc.setTextColor(30, 41, 59);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Homework Assigned', margin, yPos + 5);
            yPos += 10;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            const hwLines = doc.splitTextToSize(data.homeworkAssigned, contentWidth);
            for (const line of hwLines) {
                doc.text(line, margin, yPos);
                yPos += 5;
            }
            yPos += 5;
        }

        if (data.riskAssessment) {
            doc.setTextColor(220, 38, 38);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('⚠ Risk Assessment', margin, yPos + 5);
            yPos += 10;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            const riskLines = doc.splitTextToSize(data.riskAssessment, contentWidth);
            for (const line of riskLines) {
                doc.text(line, margin, yPos);
                yPos += 5;
            }
        }
    }

    // --- Footer on all pages ---
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const footerY = doc.internal.pageSize.getHeight() - 10;

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

        doc.setTextColor(148, 163, 184);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('CONFIDENTIAL — This document contains protected health information (PHI). Unauthorized disclosure is prohibited.', margin, footerY);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, footerY);
        doc.text('The 3 Tree Counseling', pageWidth / 2 - 15, footerY);
    }

    return doc;
}

/**
 * Download the PDF locally
 */
export function downloadSessionNotesPDF(data: SessionNotePDFData): void {
    const doc = generateSessionNotesPDF(data);
    const fileName = `session-notes-${data.patientName.replace(/\s+/g, '-').toLowerCase()}-${new Date(data.sessionDate).toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
}

/**
 * Upload the PDF to ImageKit and save the URL in session_notes
 */
export async function saveSessionNotesPDFToImageKit(
    data: SessionNotePDFData,
    bookingId: string,
    noteId?: string
): Promise<{ url: string | null; error: Error | null }> {
    try {
        const doc = generateSessionNotesPDF(data);
        const pdfBlob = doc.output('blob');

        const fileName = `session-notes-${data.patientName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;

        // Convert blob to base64 for fallback
        const base64Data = await blobToBase64(pdfBlob);

        const { data: uploadResult, error: uploadError } = await uploadToImageKit(
            pdfBlob,
            fileName,
            '/3tree/session-notes'
        );

        if (uploadError || !uploadResult) {
            // Fallback: ImageKit upload failed, save base64 data URL reference
            console.warn('ImageKit upload failed, saving base64 reference:', uploadError);

            if (noteId) {
                await supabase
                    .from('session_notes')
                    .update({
                        pdf_url: base64Data,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', noteId);
            }

            return { url: base64Data, error: null };
        }

        // Save the ImageKit URL to the session_notes record
        if (noteId) {
            await supabase
                .from('session_notes')
                .update({
                    pdf_url: uploadResult.url,
                    updated_at: new Date().toISOString()
                })
                .eq('id', noteId);
        }

        return { url: uploadResult.url, error: null };
    } catch (error) {
        console.error('Error generating/uploading PDF:', error);
        return { url: null, error: error as Error };
    }
}

/**
 * Get PDF blob for preview in browser
 */
export function getSessionNotesPDFBlob(data: SessionNotePDFData): Blob {
    const doc = generateSessionNotesPDF(data);
    return doc.output('blob');
}

/**
 * Open PDF in a new browser tab for viewing
 */
export function viewSessionNotesPDF(data: SessionNotePDFData): void {
    const doc = generateSessionNotesPDF(data);
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
    // Clean up after a delay
    setTimeout(() => URL.revokeObjectURL(url), 30000);
}
