import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioHome } from './portfolio-home';

describe('PortfolioHome', () => {
  let component: PortfolioHome;
  let fixture: ComponentFixture<PortfolioHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
