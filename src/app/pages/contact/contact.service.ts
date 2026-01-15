import { Injectable, inject } from '@angular/core';
// import { collection, addDoc } from 'firebase/firestore';
// import { FIREBASE_FIRESTORE } from '../../core/firebase/firebase.di';

@Injectable({ providedIn: 'root' })
export class ContactService {
  // private firestore = inject(FIREBASE_FIRESTORE);

  // submitMessage(data: any) {
  //   const ref = collection(this.firestore, 'contact_messages');
  //   return addDoc(ref, {
  //     ...data,
  //     createdAt: new Date(),
  //     status: 'new',
  //   });
  // }
}
