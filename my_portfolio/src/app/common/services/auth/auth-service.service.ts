import * as CryptoJS from 'crypto-js';
import { environment } from '../../../../environment/environment';

export class AuthService {
  private encryptionKey = environment.encryptionKey;

  encryptToken(token: string): string {
    return CryptoJS.AES.encrypt(token, this.encryptionKey).toString();
  }

  decryptToken(encryptedToken: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedToken, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  getEncryptedToken(): string | null {
    const token = localStorage.getItem('token');
    return token ? this.encryptToken(token) : null;
  }

  setToken(token: string): void {
    const encryptedToken = this.encryptToken(token);
    localStorage.setItem('token', encryptedToken);
  }

  getToken(): string | null {
    const encryptedToken = localStorage.getItem('token');
    return encryptedToken ? this.decryptToken(encryptedToken) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
