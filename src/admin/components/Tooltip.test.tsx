import { render, screen, fireEvent } from '@testing-library/react';
import { Tooltip } from './Tooltip';

test('shows bubble on click and hides on Escape', () => {
  render(<Tooltip text="Helpful detail" />);
  const trigger = screen.getByRole('button', { name: /more info/i });
  expect(screen.queryByText('Helpful detail')).not.toBeVisible();
  fireEvent.click(trigger);
  expect(screen.getByText('Helpful detail')).toBeVisible();
  fireEvent.keyDown(trigger, { key: 'Escape' });
  expect(screen.queryByText('Helpful detail')).not.toBeVisible();
});
