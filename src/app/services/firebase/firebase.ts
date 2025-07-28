// // src/app/services/firebase.service.ts

// import { Injectable } from '@angular/core';
// import { initializeApp } from 'firebase/app';
// import { getFirestore, Firestore } from 'firebase/firestore';
// import { getAuth, Auth } from 'firebase/auth';
// import { getStorage, FirebaseStorage } from 'firebase/storage';
// import { firebaseConfig } from '../../../environments/firebase-config';

// @Injectable({
//   providedIn: 'root'
// })
// export class FirebaseService {
//   public db: Firestore;
//   public auth: Auth;
//   public storage: FirebaseStorage;

//   constructor() {
//     const app = initializeApp(firebaseConfig);

//     this.db = getFirestore(app);
//     this.auth = getAuth(app);
//     this.storage = getStorage(app);
//   }
// }
