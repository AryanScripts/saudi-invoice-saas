import QRCode from 'qrcode';
import { ZatcaQrInput } from '@/types';

/**
 * Encodes a tag, length, and value into a TLV (Tag-Length-Value) Buffer according to ZATCA standards.
 */
function encodeTLV(tag: number, value: string | Buffer): Buffer {
  const valueBuffer = Buffer.isBuffer(value) ? value : Buffer.from(value, 'utf-8');
  const lengthBuffer = Buffer.from([valueBuffer.length]);
  const tagBuffer = Buffer.from([tag]);
  return Buffer.concat([tagBuffer, lengthBuffer, valueBuffer]);
}

/**
 * Computes ZATCA-compliant Base64 TLV payload for Phase 1 and Phase 2 e-invoices.
 * 
 * Tags specification:
 * Tag 1: Seller's name
 * Tag 2: Seller's VAT registration number
 * Tag 3: Time stamp of invoice (ISO 8601)
 * Tag 4: Invoice total (including VAT)
 * Tag 5: VAT total
 * Tag 6: SHA-256 Hash of invoice (Phase 2)
 * Tag 7: ECDSA signature (Phase 2)
 * Tag 8: ECDSA public key (Phase 2 Full)
 * Tag 9: Cryptographic stamp ID (Phase 2 Full)
 */
export function generateZatcaTlvPayload(input: ZatcaQrInput): string {
  const tlvBuffers: Buffer[] = [];

  // Tag 1: Seller Name
  tlvBuffers.push(encodeTLV(1, input.sellerName || 'Company'));

  // Tag 2: VAT Number
  tlvBuffers.push(encodeTLV(2, input.vatNumber || '300000000000003'));

  // Tag 3: Timestamp (ISO 8601 standard)
  const timestamp = input.timestamp ? new Date(input.timestamp).toISOString() : new Date().toISOString();
  tlvBuffers.push(encodeTLV(3, timestamp));

  // Tag 4: Invoice Total (with VAT)
  const totalStr = typeof input.invoiceTotal === 'number' 
    ? input.invoiceTotal.toFixed(2) 
    : parseFloat(input.invoiceTotal || '0').toFixed(2);
  tlvBuffers.push(encodeTLV(4, totalStr));

  // Tag 5: VAT Total
  const vatStr = typeof input.vatTotal === 'number' 
    ? input.vatTotal.toFixed(2) 
    : parseFloat(input.vatTotal || '0').toFixed(2);
  tlvBuffers.push(encodeTLV(5, vatStr));

  // Tag 6: Invoice Hash (Phase 2)
  if (input.invoiceHash) {
    tlvBuffers.push(encodeTLV(6, input.invoiceHash));
  }

  // Tag 7: ECDSA Signature (Phase 2)
  if (input.ecdsaSignature) {
    tlvBuffers.push(encodeTLV(7, input.ecdsaSignature));
  }

  // Tag 8: ECDSA Public Key (Phase 2 Full)
  if (input.ecdsaPublicKey) {
    tlvBuffers.push(encodeTLV(8, input.ecdsaPublicKey));
  }

  // Tag 9: Cryptographic Stamp Identifier (Phase 2 Full)
  if (input.cryptographicStampId) {
    tlvBuffers.push(encodeTLV(9, input.cryptographicStampId));
  }

  const concatenatedBuffer = Buffer.concat(tlvBuffers);
  return concatenatedBuffer.toString('base64');
}

/**
 * Generates a PNG Data URL from ZATCA TLV payload for web & PDF display.
 */
export async function generateZatcaQrDataUrl(input: ZatcaQrInput): Promise<string> {
  const base64Tlv = generateZatcaTlvPayload(input);
  try {
    const dataUrl = await QRCode.toDataURL(base64Tlv, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 256,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating ZATCA QR Code:', err);
    throw err;
  }
}
