import assert from 'node:assert/strict';
import test from 'node:test';
import { isValidResumeContent } from './resumeValidation.js';

const pdfMime = 'application/pdf';
const docxMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

test('accepts a PDF with a PDF signature', () => {
  assert.equal(isValidResumeContent(pdfMime, Buffer.from('%PDF-1.7 sample')), true);
});

test('rejects a PDF MIME type without a PDF signature', () => {
  assert.equal(isValidResumeContent(pdfMime, Buffer.from('not a PDF')), false);
});

test('accepts a DOCX package with its required OOXML entries', () => {
  const data = Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x03, 0x04]),
    Buffer.from('[Content_Types].xml word/document.xml'),
  ]);
  assert.equal(isValidResumeContent(docxMime, data), true);
});

test('rejects a generic ZIP file presented as DOCX', () => {
  assert.equal(isValidResumeContent(docxMime, Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00])), false);
});

test('rejects unsupported MIME types', () => {
  assert.equal(isValidResumeContent('text/plain', Buffer.from('%PDF-1.7 sample')), false);
});
