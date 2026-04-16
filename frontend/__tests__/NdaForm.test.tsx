import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NdaForm from '@/components/NdaForm';
import { defaultFormData } from '@/lib/ndaUtils';
import type { NdaFormData } from '@/lib/types';

function setup(overrides: Partial<NdaFormData> = {}, onChange = jest.fn()) {
  const data: NdaFormData = { ...defaultFormData, ...overrides };
  render(<NdaForm data={data} onChange={onChange} />);
  return { onChange, data };
}

describe('NdaForm', () => {
  describe('section rendering', () => {
    it('renders Purpose section heading', () => {
      setup();
      expect(screen.getByRole('heading', { name: /^Purpose$/i })).toBeInTheDocument();
    });

    it('renders Party 1 section', () => {
      setup();
      expect(screen.getByRole('heading', { name: /Party 1/i })).toBeInTheDocument();
    });

    it('renders Party 2 section', () => {
      setup();
      expect(screen.getByRole('heading', { name: /Party 2/i })).toBeInTheDocument();
    });

    it('renders Modifications section', () => {
      setup();
      expect(screen.getByRole('heading', { name: /Modifications/i })).toBeInTheDocument();
    });

    it('renders all labeled inputs', () => {
      setup();
      expect(screen.getByLabelText(/How Confidential Information may be used/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Governing State/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Jurisdiction \(city\/county and state\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/List any modifications/i)).toBeInTheDocument();
    });
  });

  describe('purpose field', () => {
    it('shows current purpose value', () => {
      setup({ purpose: 'My custom purpose.' });
      const ta = screen.getByLabelText(/How Confidential Information may be used/i);
      expect(ta).toHaveValue('My custom purpose.');
    });

    it('calls onChange with new purpose on each keystroke', async () => {
      const { onChange } = setup({ purpose: '' });
      const ta = screen.getByLabelText(/How Confidential Information may be used/i);
      await userEvent.type(ta, 'A');
      expect(onChange).toHaveBeenCalledWith({ purpose: 'A' });
    });
  });

  describe('effective date field', () => {
    it('renders the date input with the current value', () => {
      setup({ effectiveDate: '2026-04-15' });
      const input = screen.getByDisplayValue('2026-04-15');
      expect(input).toBeInTheDocument();
    });
  });

  describe('MNDA term radio group', () => {
    it('renders expires radio as checked by default', () => {
      setup();
      expect(screen.getByDisplayValue('expires')).toBeChecked();
    });

    it('renders until-terminated radio as unchecked by default', () => {
      setup();
      expect(screen.getByDisplayValue('until-terminated')).not.toBeChecked();
    });

    it('calls onChange with until-terminated when that radio is clicked', async () => {
      const { onChange } = setup();
      await userEvent.click(screen.getByDisplayValue('until-terminated'));
      expect(onChange).toHaveBeenCalledWith({ mndaTermType: 'until-terminated' });
    });

    it('calls onChange with expires when expires radio is clicked', async () => {
      const { onChange } = setup({ mndaTermType: 'until-terminated' });
      await userEvent.click(screen.getByDisplayValue('expires'));
      expect(onChange).toHaveBeenCalledWith({ mndaTermType: 'expires' });
    });

    it('disables mndaTermYears input when until-terminated is selected', () => {
      setup({ mndaTermType: 'until-terminated' });
      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs[0]).toBeDisabled(); // first spinner = mndaTermYears
    });

    it('enables mndaTermYears input when expires is selected', () => {
      setup({ mndaTermType: 'expires' });
      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs[0]).not.toBeDisabled();
    });
  });

  describe('confidentiality term radio group', () => {
    it('renders years radio as checked by default', () => {
      setup();
      expect(screen.getByDisplayValue('years')).toBeChecked();
    });

    it('calls onChange with perpetuity when that radio is clicked', async () => {
      const { onChange } = setup();
      await userEvent.click(screen.getByDisplayValue('perpetuity'));
      expect(onChange).toHaveBeenCalledWith({ confTermType: 'perpetuity' });
    });

    it('disables confTermYears input when perpetuity is selected', () => {
      setup({ confTermType: 'perpetuity' });
      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs[1]).toBeDisabled(); // second spinner = confTermYears
    });
  });

  describe('governing law and jurisdiction', () => {
    it('calls onChange when governing law is typed', async () => {
      const { onChange } = setup({ governingLaw: '' });
      await userEvent.type(screen.getByLabelText(/Governing State/i), 'D');
      expect(onChange).toHaveBeenCalledWith({ governingLaw: 'D' });
    });

    it('calls onChange when jurisdiction is typed', async () => {
      const { onChange } = setup({ jurisdiction: '' });
      await userEvent.type(screen.getByLabelText(/Jurisdiction \(city\/county and state\)/i), 'N');
      expect(onChange).toHaveBeenCalledWith({ jurisdiction: 'N' });
    });
  });

  describe('party fields', () => {
    it('renders two Company label inputs', () => {
      setup();
      expect(screen.getAllByLabelText(/^Company$/i)).toHaveLength(2);
    });

    it('calls onChange with p1Company when Party 1 company is typed', async () => {
      const { onChange } = setup();
      const companyInputs = screen.getAllByLabelText(/^Company$/i);
      await userEvent.type(companyInputs[0], 'A');
      expect(onChange).toHaveBeenCalledWith({ p1Company: 'A' });
    });

    it('calls onChange with p2Company when Party 2 company is typed', async () => {
      const { onChange } = setup();
      const companyInputs = screen.getAllByLabelText(/^Company$/i);
      await userEvent.type(companyInputs[1], 'B');
      expect(onChange).toHaveBeenCalledWith({ p2Company: 'B' });
    });

    it('renders two Signatory Name inputs', () => {
      setup();
      expect(screen.getAllByLabelText(/Signatory Name/i)).toHaveLength(2);
    });

    it('renders two Notice Address inputs', () => {
      setup();
      expect(screen.getAllByLabelText(/Notice Address/i)).toHaveLength(2);
    });
  });
});
