import { InjectionToken, makeEnvironmentProviders, EnvironmentProviders, inject, NgZone } from '@angular/core';
import { FirebaseApp, initializeApp, FirebaseOptions } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Analytics, getAnalytics } from 'firebase/analytics';

export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FIREBASE_APP');
export const FIREBASE_AUTH = new InjectionToken<Auth>('FIREBASE_AUTH');
export const FIREBASE_FIRESTORE = new InjectionToken<Firestore>('FIREBASE_FIRESTORE');
export const FIREBASE_ANALYTICS = new InjectionToken<Analytics>('FIREBASE_ANALYTICS');

export function provideFirebase(config: FirebaseOptions): EnvironmentProviders {
    return makeEnvironmentProviders([
        {
            provide: FIREBASE_APP,
            useFactory: () => {
                return initializeApp(config);
            },
        },
        {
            provide: FIREBASE_AUTH,
            useFactory: () => {
                const app = inject(FIREBASE_APP);
                return getAuth(app);
            },
        },
        {
            provide: FIREBASE_FIRESTORE,
            useFactory: () => {
                const app = inject(FIREBASE_APP);
                return getFirestore(app);
            },
        },
        {
            provide: FIREBASE_ANALYTICS,
            useFactory: () => {
                const app = inject(FIREBASE_APP);
                return getAnalytics(app);
            },
        },
    ]);
}
