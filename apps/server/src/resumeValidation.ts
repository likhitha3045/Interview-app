/**
 * Check both the declared upload type and the file's content. DOCX files are
 * ZIP containers, so checking only the PK header would also accept arbitrary
 * ZIP files renamed to .docx.
 */
export function isValidResumeContent(mimeType: string, data: Buffer): boolean {
  if (mimeType === 'application/pdf') {
    return data.subarray(0, 5).toString('ascii') === '%PDF-';
  }

  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const isZip = data.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
    if (!isZip) return false;

    // ZIP entry paths are stored uncompressed in the directory records.
    // Requiring the OOXML package manifest and main document rules out an
    // ordinary ZIP archive while keeping this check dependency-free.
    return data.includes(Buffer.from('[Content_Types].xml')) && data.includes(Buffer.from('word/document.xml'));
  }

  return false;
}
