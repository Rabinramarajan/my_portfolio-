import { TestBed } from '@angular/core/testing';
import { Scroll } from '@angular/router';


describe('Scroll', () => {
  let service: Scroll;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Scroll);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
