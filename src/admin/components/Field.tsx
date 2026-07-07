import React from 'react';
import { Tooltip } from './Tooltip';

/**
 * One standardized form row: label (+ required/optional marker + optional
 * tooltip), a one-line help text, then the control(s) as children.
 * Every admin input should move onto this so help text is never forgotten.
 */
export const Field: React.FC<{
  label: string;
  help?: React.ReactNode;
  tooltip?: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
}> = ({ label, help, tooltip, required, optional, htmlFor, children }) => (
  <div className="field-row">
    <div className="field-lab">
      <label htmlFor={htmlFor}>{label}</label>
      {required && <span className="req">*</span>}
      {optional && <span className="opt">Optional</span>}
      {tooltip && <Tooltip text={tooltip} label={`About ${label}`} />}
    </div>
    {help && <p className="field-help">{help}</p>}
    {children}
  </div>
);

export default Field;
