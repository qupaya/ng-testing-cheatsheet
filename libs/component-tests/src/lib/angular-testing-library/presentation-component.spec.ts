import { Component, EventEmitter, Input, Output } from '@angular/core';
import { render } from '@testing-library/angular';
import { instance, mock, verify } from 'ts-mockito';

@Component({
  selector: 'presentation',
  template: `<p (click)="textClick.emit(text)">{{ text }}</p>`,
})
class PresentationComponent {
  @Input() text = 'default';
  @Output() textClick = new EventEmitter<string>();
}

describe('PresentationComponent', () => {
  it('should render correct text', async () => {
    const { queryByText, rerender } = await render(PresentationComponent);

    expect(queryByText('default')).toBeTruthy();

    rerender({ text: 'test text' });

    expect(queryByText('test text')).toBeTruthy();
  });

  it('should emit the correct text on click', async () => {
    const onTextClick = jest.fn();

    const { queryByText, click } = await render(PresentationComponent, {
      componentProperties: {
        text: 'test text',
        textClick: { emit: onTextClick } as any,
      },
    });

    click(queryByText('test text'));

    expect(onTextClick).toHaveBeenCalledWith('test text');
  });

  it('should emit the correct text on click (using ts-mockito)', async () => {
    const mockOnTextClick = mock<EventEmitter<string>>(EventEmitter);

    const { queryByText, click } = await render(PresentationComponent, {
      componentProperties: {
        text: 'test text',
        textClick: instance(mockOnTextClick),
      },
    });

    click(queryByText('test text'));

    verify(mockOnTextClick.emit('test text')).called();
  });
});
