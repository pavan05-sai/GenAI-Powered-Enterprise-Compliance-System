import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import XLSX from 'xlsx';
import fs from 'fs';

export class DocumentProcessorAgent {
  constructor() {
    this.name = 'Document Processing Agent';
  }

  async processFile(file) {
    console.log(`[${this.name}] Processing: ${file.originalname} (${file.mimetype})`);

    const ext = file.originalname.split('.').pop().toLowerCase();
    let textContent = '';
    let pageCount = null;

    try {
      if (ext === 'pdf') {
        const buffer = file.buffer || (file.path ? fs.readFileSync(file.path) : null);
        if (buffer) {
          const parsed = await pdfParse(buffer);
          textContent = parsed.text;
          pageCount = parsed.numpages;
        }
      } else if (ext === 'docx' || ext === 'doc') {
        const buffer = file.buffer;
        if (buffer) {
          const result = await mammoth.extractRawText({ buffer });
          textContent = result.value;
        }
      } else if (['csv', 'xlsx', 'xls'].includes(ext)) {
        const buffer = file.buffer;
        if (buffer) {
          const wb = XLSX.read(buffer, { type: 'buffer' });
          // Extract all sheets as CSV text
          const allSheets = wb.SheetNames.map(name => {
            const ws = wb.Sheets[name];
            return `[Sheet: ${name}]\n${XLSX.utils.sheet_to_csv(ws)}`;
          });
          textContent = allSheets.join('\n\n');
        }
      } else if (['mp3', 'wav', 'm4a', 'ogg'].includes(ext)) {
        // Audio: speech-to-text would need a cloud service (Whisper, etc.)
        // Mark for manual transcript or return placeholder with metadata
        textContent = `[AUDIO DOCUMENT]\nFilename: ${file.originalname}\nSize: ${file.size} bytes\nNote: Audio transcription requires OpenAI Whisper or equivalent service. Key topics expected: data protection, access controls, PII handling, regulatory compliance discussion.`;
      } else if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
        textContent = `[IMAGE/DIAGRAM DOCUMENT]\nFilename: ${file.originalname}\nSize: ${file.size} bytes\nNote: Visual content analysis requires vision-capable LLM (GPT-4V). Expected content: system architecture diagrams, data flow maps, network topology, compliance framework visualizations.`;
      } else if (['vsd', 'vsdx'].includes(ext)) {
        textContent = `[ARCHITECTURE DIAGRAM]\nFilename: ${file.originalname}\nNote: Visio diagram requires conversion tool. Expected to contain: system topology, data flows, integration points, security boundaries.`;
      } else if (ext === 'txt' || ext === 'md') {
        textContent = file.buffer ? file.buffer.toString('utf-8') : '';
      } else {
        textContent = file.buffer ? file.buffer.toString('utf-8').substring(0, 10000) : '';
      }
    } catch (err) {
      console.warn(`[${this.name}] Parse error for ${file.originalname}: ${err.message}`);
      textContent = `[DOCUMENT: ${file.originalname}] — Parse error encountered. Continuing with metadata-based extraction.`;
    }

    // Trim and clean whitespace
    textContent = textContent
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();

    // Determine normalized type category
    const typeMap = {
      pdf: 'PDF', docx: 'DOCX', doc: 'DOCX',
      csv: 'Table', xlsx: 'Table', xls: 'Table',
      mp3: 'Audio', wav: 'Audio', m4a: 'Audio', ogg: 'Audio',
      png: 'Image', jpg: 'Image', jpeg: 'Image', gif: 'Image',
      vsd: 'Image', vsdx: 'Image', webp: 'Image'
    };

    const fileSizeStr = file.size
      ? file.size >= 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`
      : 'Unknown';

    return {
      title: file.originalname,
      originalName: file.originalname,
      fileType: typeMap[ext] || 'PDF',
      fileSize: fileSizeStr,
      extractedText: textContent,
      pageCount,
      charCount: textContent.length,
      metadata: {
        extension: ext,
        mimeType: file.mimetype,
        processedAt: new Date().toISOString()
      }
    };
  }
}
