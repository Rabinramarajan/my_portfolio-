import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderTemplatesComponent } from './header-templates.component';

describe('HeaderTemplatesComponent', () => {
  let component: HeaderTemplatesComponent;
  let fixture: ComponentFixture<HeaderTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderTemplatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
