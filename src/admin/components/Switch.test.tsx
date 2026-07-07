import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from './Switch';

test('Switch toggles and reflects checked state', () => {
  const onChange = jest.fn();
  const { rerender } = render(<Switch checked={false} onChange={onChange} title="Active" />);
  const btn = screen.getByRole('switch');
  expect(btn).toHaveAttribute('aria-checked', 'false');
  fireEvent.click(btn);
  expect(onChange).toHaveBeenCalledWith(true);
  rerender(<Switch checked onChange={onChange} title="Active" />);
  expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
});
