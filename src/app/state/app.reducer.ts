// src/app/state/app.reducer.ts
import { createReducer, on } from '@ngrx/store'; // Make sure to create an action
import { increment } from './app.actions';

export interface AppState {
  counter: number;
}

export const initialState: AppState = {
  counter: 0,
};

export const appReducer = createReducer(
  initialState,
  on(increment, (state) => ({ ...state, counter: state.counter + 1 }))
);
