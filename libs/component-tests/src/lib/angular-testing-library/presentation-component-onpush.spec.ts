import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';
import { render, screen } from '@testing-library/angular';

@Component({
  selector: 'presentation',
  template: `<p>{{ text }}</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PresentationComponent {
  @Input() text = 'default';
}

describe('PresentationComponent', () => {
  it('should render correct text (force componentView state hack)', async () => {
    const { queryByText, rerender, fixture } = await render(
      PresentationComponent
    );

    expect(queryByText('default')).toBeTruthy();

    // see https://github.com/angular/angular/issues/12313
    // tslint:disable-next-line: no-bitwise
    fixture.changeDetectorRef['_view'].nodes[0].componentView.state |= 1 << 3;
    rerender({ text: 'test text' });
    // Note, that ngOnChanges will not be called!
    // If the component depends on it being called, you have to do it manually:
    // fixture.componentInstance.ngOnChanges({
    //   text: new SimpleChange('', 'test text', false),
    // });

    expect(queryByText('test text')).toBeTruthy();
  });

  it('should render correct text (ChangeDetectorRef hack)', async () => {
    const { queryByText, rerender, fixture } = await render(
      PresentationComponent
    );

    expect(queryByText('default')).toBeTruthy();

    rerender({ text: 'test text' });
    fixture.componentRef.injector.get(ChangeDetectorRef).detectChanges();
    // same ngOnChanges problem like the componentView state hack

    expect(queryByText('test text')).toBeTruthy();
  });

  it('should render correct text (using host component)', async () => {
    @Component({
      selector: 'test-host',
      template: `<presentation [text]="text"></presentation>`,
    })
    class TestHostComponent {
      @Input() text: string;
    }

    const { rerender } = await render(TestHostComponent, {
      declarations: [PresentationComponent],
      componentProperties: { text: 'initial text' },
    });

    expect(screen.queryByText('initial text')).toBeTruthy();

    rerender({ text: 'test text' });

    expect(screen.queryByText('test text')).toBeTruthy();
  });
});
