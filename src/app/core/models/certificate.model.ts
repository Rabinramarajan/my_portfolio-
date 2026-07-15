import type { IsoDate } from '../types/common.types';

/** Certificate / credential entry. */
export interface Certificate {
  readonly id: string;
  readonly title: string;
  readonly issuer: string;
  readonly date: IsoDate;
  readonly credentialUrl?: string;
  readonly image?: string;
}

/** certificates.json payload. */
export interface CertificatesConfig {
  readonly items: readonly Certificate[];
}
