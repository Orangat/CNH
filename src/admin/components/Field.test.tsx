import React from 'react';
import { render, screen } from '@testing-library/react';
import { Field } from './Field';

test('renders label, required marker and help text', () => {
  render(<Field label="Web address" help="Appears in the URL" required><input /></Field>);
  expect(screen.getByText('Web address')).toBeInTheDocument();
  expect(screen.getByText('*')).toBeInTheDocument();
  expect(screen.getByText('Appears in the URL')).toBeInTheDocument();
});
