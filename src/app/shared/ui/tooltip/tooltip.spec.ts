import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tooltip } from './tooltip';

describe('Tooltip', () => {
  let component: Tooltip;
  let fixture: ComponentFixture<Tooltip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tooltip],
    }).compileComponents();

    fixture = TestBed.createComponent(Tooltip);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('text', 'Mensagem de ajuda');
    fixture.detectChanges();
  });

  it('should show tooltip when clicked', () => {
    const trigger = fixture.nativeElement.querySelector('span');

    trigger.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="tooltip"]')).not.toBeNull();
  });

  it('should hide tooltip when clicking outside', () => {
    component.show();
    fixture.detectChanges();

    document.body.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('should not show tooltip when disabled', () => {
    fixture.componentRef.setInput('enabled', false);
    component.show();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="tooltip"]')).toBeNull();
  });
});
