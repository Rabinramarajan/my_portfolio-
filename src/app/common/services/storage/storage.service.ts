import { Injectable } from '@angular/core';
import { AppSettingsService } from '../app-settings/app-settings.service';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private hasIndexedDB = false;
  private db: IDBDatabase | null = null;
  private readonly objectStoreName = "__ITG__STORE__APP__";
  private readonly encryptionKey = "ITG_ENCRYPT@1234";
  private readonly encryptionKeyIV = "ITG_ENCRYPT@1234IV";
  constructor(
    private appSetting: AppSettingsService
  ) { this.init(); }

  private init() {
    if (window.indexedDB) {
      this.hasIndexedDB = true;
      this.createDB();
    } else {
      console.error("IndexedDB not supported in this browser.");
    }
  }

  private async createDB() {
    if (this.hasIndexedDB) {
      const dbName = this.appSetting.environment.dbName;
      if (!dbName) { console.error('dbName is missing in app.settings.json'); return; }

      try {
        this.db = await this.openDB(dbName);
        if (!this.db.objectStoreNames.contains(this.objectStoreName)) {
          const version = this.db.version + 1;
          this.db.close();
          this.db = await this.upgradeDB(dbName, version);
        }
      } catch (error) {
        console.error("Error opening or upgrading database:", error);
      }
    }
  }

  private openDB(dbName: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName);
      request.onsuccess = (event: any) => resolve(event.target.result);
      request.onerror = (event: any) => reject(event.target.error);
    });
  }

  private upgradeDB(dbName: string, version: number): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, version);
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        db.createObjectStore(this.objectStoreName);
      };
      request.onsuccess = (event: any) => resolve(event.target.result);
      request.onerror = (event: any) => reject(event.target.error);
    });
  }

  private getTransaction(): IDBTransaction {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return this.db.transaction([this.objectStoreName], 'readwrite');
  }

  async set(key: any, value: any): Promise<boolean> {
    try {
      const encryptedKey = await this.encrypt(key);
      const encryptedValue = await this.encrypt(value);
      if (this.hasIndexedDB && this.db) {
        const transaction = this.getTransaction();
        const objectStore = transaction.objectStore(this.objectStoreName);
        await this.putData(objectStore, encryptedKey, encryptedValue);
        return true;
      } else {
        localStorage.setItem(encryptedKey, encryptedValue);
        return true;
      }
    } catch (error) {
      console.error("Error setting data:", error);
      return false;
    }
  }

  private putData(objectStore: IDBObjectStore, key: any, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = objectStore.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = (event: any) => reject(event.target.error);
    });
  }

  async get(key: any): Promise<any> {
    try {
      const encryptedKey = await this.encrypt(key);
      if (this.hasIndexedDB && this.db) {
        const transaction = this.getTransaction();
        const objectStore = transaction.objectStore(this.objectStoreName);
        const data = await this.getData(objectStore, encryptedKey);
        const value = data ? this.decrypt(data) : data;
        return value;
      } else {
        const response = localStorage.getItem(encryptedKey);
        if (!response) return null;
        const value = this.decrypt(response);
        return value;
      }
    } catch (error) {
      console.error("Error getting data:", error);
      return null;
    }
  }

  private getData(objectStore: IDBObjectStore, key: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = objectStore.get(key);
      request.onsuccess = (event: any) => resolve(event.target.result);
      request.onerror = (event: any) => reject(event.target.error);
    });
  }

  async remove(key: any): Promise<boolean> {
    try {
      const encryptedKey = await this.encrypt(key);
      if (this.hasIndexedDB && this.db) {
        const transaction = this.getTransaction();
        const objectStore = transaction.objectStore(this.objectStoreName);

        await this.removeData(objectStore, encryptedKey);
        return true;
      } else {
        localStorage.removeItem(encryptedKey);
        return true;
      }
    } catch (error) {
      console.error("Error removing data:", error);
      return false;
    }
  }

  private removeData(objectStore: IDBObjectStore, key: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = objectStore.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = (event: any) => reject(event.target.error);
    });
  }

  async clear(): Promise<boolean> {
    try {
      if (this.hasIndexedDB && this.db) {
        const transaction = this.getTransaction();
        const objectStore = transaction.objectStore(this.objectStoreName);
        await this.clearData(objectStore);
      } else {
        localStorage.clear();
      }
      return true;
    } catch (error) {
      console.error("Error clearing data:", error);
      return false;
    }
  }

  private clearData(objectStore: IDBObjectStore): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = objectStore.clear();
      request.onsuccess = () => resolve();
      request.onerror = (event: any) => reject(event.target.error);
    });
  }

  // private async encrypt(data: any): Promise<string> {
  //   let obj = await this.encodeURI(data);
  //   let encryptionKey = encodeURIComponent(btoa(this.encryptionKey));
  //   let encryptionKeyIV = encodeURIComponent(btoa(this.encryptionKeyIV));
  //   let Key = CryptoJS.enc.Utf8.parse(encryptionKey);
  //   let IV = CryptoJS.enc.Utf8.parse(encryptionKeyIV);
  //   const encryptedText = CryptoJS.AES.encrypt(obj, Key, {
  //     iv: IV,
  //     mode: CryptoJS.mode.CBC,
  //     padding: CryptoJS.pad.Pkcs7,
  //   });
  //   return encryptedText.toString();
  // }

  // private async decrypt(data: string): Promise<any> {
  //   let encryptionKey = encodeURIComponent(btoa(this.encryptionKey));
  //   let encryptionKeyIV = encodeURIComponent(btoa(this.encryptionKeyIV));
  //   let Key = CryptoJS.enc.Utf8.parse(encryptionKey);
  //   let IV = CryptoJS.enc.Utf8.parse(encryptionKeyIV);
  //   const decryptedTextBytes = CryptoJS.AES.decrypt(data, Key, {
  //     iv: IV,
  //     mode: CryptoJS.mode.CBC,
  //     padding: CryptoJS.pad.Pkcs7,
  //   });
  //   let responseString = decryptedTextBytes.toString(CryptoJS.enc.Utf8);
  //   let response = await this.decodeURI(responseString);
  //   // const response = JSON.parse(decryptedTextBytes.toString(CryptoJS.enc.Utf8));
  //   return response;
  // }

  // async encodeURI(key: any): Promise<string> {
  //   return new Promise((resolve) => {
  //     const obj = {
  //       data: key
  //     }
  //     let response = encodeURIComponent(btoa(JSON.stringify(obj)));
  //     resolve(response);
  //   });
  // }

  // async decodeURI(value: any): Promise<string> {
  //   return new Promise((resolve) => {
  //     const urlJson = atob(decodeURIComponent(value));
  //     const urlValue = JSON.parse(urlJson);
  //     resolve(urlValue.data);
  //   });
  // }

  private async encrypt(data: any): Promise<string> {
    const baseObj = {
      data: data
    }
    // let obj = await this.encodeURI(data);
    let obj = JSON.stringify(baseObj);
    let encryptionKey = encodeURIComponent(btoa(this.encryptionKey));
    let encryptionKeyIV = encodeURIComponent(btoa(this.encryptionKeyIV));
    let Key = CryptoJS.enc.Utf8.parse(encryptionKey);
    let IV = CryptoJS.enc.Utf8.parse(encryptionKeyIV);
    const encryptedText = CryptoJS.AES.encrypt(obj, Key, {
      iv: IV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encryptedText.toString();
  }

  private async decrypt(data: string): Promise<any> {
    let encryptionKey = encodeURIComponent(btoa(this.encryptionKey));
    let encryptionKeyIV = encodeURIComponent(btoa(this.encryptionKeyIV));
    let Key = CryptoJS.enc.Utf8.parse(encryptionKey);
    let IV = CryptoJS.enc.Utf8.parse(encryptionKeyIV);
    const decryptedTextBytes = CryptoJS.AES.decrypt(data, Key, {
      iv: IV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    let responseString = decryptedTextBytes.toString(CryptoJS.enc.Utf8);
    // let response = await this.decodeURI(responseString);
    let response = JSON.parse(responseString);
    // const response = JSON.parse(decryptedTextBytes.toString(CryptoJS.enc.Utf8));
    return response.data;
  }

  async encodeURI(key: any): Promise<string> {
    return new Promise((resolve) => {
      const obj = {
        data: key
      }
      // let response = encodeURIComponent(btoa(JSON.stringify(obj)));
      // resolve(response);
      // Convert object to JSON string
      const jsonString = JSON.stringify(obj);

      // Encode the JSON string as a Uint8Array
      const uint8Array = new TextEncoder().encode(jsonString);

      // Convert Uint8Array to Base64
      const base64String = btoa(String.fromCharCode(...uint8Array));

      // Encode the Base64 string for URI
      let response = encodeURIComponent(base64String);

      resolve(response);
    });
  }

  async decodeURI(value: any): Promise<string> {
    return new Promise((resolve) => {
      // const urlJson = atob(decodeURIComponent(value));
      // const urlValue = JSON.parse(urlJson);
      const decodedURIComponent = decodeURIComponent(value);
      // Decode from Base64 to binary string
      const binaryString = atob(decodedURIComponent);
      // Convert binary string to Uint8Array
      const uint8Array = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      // Convert Uint8Array back to JSON string
      const jsonString = new TextDecoder().decode(uint8Array);
      // Parse JSON string back to object
      const obj = JSON.parse(jsonString);
      resolve(obj.data);
    });
  }
}
