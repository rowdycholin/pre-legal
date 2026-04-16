'use client';

import type { NdaFormData } from '@/lib/types';

interface Props {
  data: NdaFormData;
  onChange: (updated: Partial<NdaFormData>) => void;
}

const labelClass = 'block text-xs text-gray-500 mb-1 mt-3 first:mt-0';
const inputClass =
  'w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const textareaClass = `${inputClass} resize-y`;
const sectionClass = 'mb-6';
const sectionHeadingClass =
  'text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3 pb-1.5 border-b border-gray-100';

export default function NdaForm({ data, onChange }: Props) {
  return (
    <div className="space-y-1">
      {/* Purpose */}
      <div className={sectionClass}>
        <h3 className={sectionHeadingClass}>Purpose</h3>
        <label htmlFor="purpose" className={labelClass}>
          How Confidential Information may be used
        </label>
        <textarea
          id="purpose"
          className={textareaClass}
          rows={3}
          value={data.purpose}
          onChange={(e) => onChange({ purpose: e.target.value })}
          placeholder="Evaluating whether to enter into a business relationship with the other party."
        />
      </div>

      {/* Effective Date */}
      <div className={sectionClass}>
        <h3 className={sectionHeadingClass}>Effective Date</h3>
        <input
          type="date"
          id="effectiveDate"
          className={inputClass}
          value={data.effectiveDate}
          onChange={(e) => onChange({ effectiveDate: e.target.value })}
        />
      </div>

      {/* MNDA Term */}
      <div className={sectionClass}>
        <h3 className={sectionHeadingClass}>MNDA Term</h3>
        <label className="flex items-center gap-2 text-sm text-gray-700 mb-2 cursor-pointer">
          <input
            type="radio"
            name="mndaTermType"
            value="expires"
            checked={data.mndaTermType === 'expires'}
            onChange={() => onChange({ mndaTermType: 'expires' })}
            className="accent-blue-600"
          />
          Expires
          <input
            type="number"
            id="mndaTermYears"
            min={1}
            max={10}
            value={data.mndaTermYears}
            onChange={(e) => onChange({ mndaTermYears: Math.max(1, parseInt(e.target.value, 10) || 1) })}
            disabled={data.mndaTermType !== 'expires'}
            className="w-14 border border-gray-300 rounded px-2 py-1 text-sm text-center disabled:opacity-40"
          />
          year(s) from Effective Date
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="radio"
            name="mndaTermType"
            value="until-terminated"
            checked={data.mndaTermType === 'until-terminated'}
            onChange={() => onChange({ mndaTermType: 'until-terminated' })}
            className="accent-blue-600"
          />
          Continues until terminated
        </label>
      </div>

      {/* Term of Confidentiality */}
      <div className={sectionClass}>
        <h3 className={sectionHeadingClass}>Term of Confidentiality</h3>
        <label className="flex items-center gap-2 text-sm text-gray-700 mb-2 cursor-pointer">
          <input
            type="radio"
            name="confTermType"
            value="years"
            checked={data.confTermType === 'years'}
            onChange={() => onChange({ confTermType: 'years' })}
            className="accent-blue-600"
          />
          <input
            type="number"
            id="confTermYears"
            min={1}
            max={10}
            value={data.confTermYears}
            onChange={(e) => onChange({ confTermYears: Math.max(1, parseInt(e.target.value, 10) || 1) })}
            disabled={data.confTermType !== 'years'}
            className="w-14 border border-gray-300 rounded px-2 py-1 text-sm text-center disabled:opacity-40"
          />
          year(s) from Effective Date (plus trade secret carve-out)
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="radio"
            name="confTermType"
            value="perpetuity"
            checked={data.confTermType === 'perpetuity'}
            onChange={() => onChange({ confTermType: 'perpetuity' })}
            className="accent-blue-600"
          />
          In perpetuity
        </label>
      </div>

      {/* Governing Law & Jurisdiction */}
      <div className={sectionClass}>
        <h3 className={sectionHeadingClass}>Governing Law &amp; Jurisdiction</h3>
        <label htmlFor="governingLaw" className={labelClass}>
          Governing State
        </label>
        <input
          type="text"
          id="governingLaw"
          className={inputClass}
          value={data.governingLaw}
          onChange={(e) => onChange({ governingLaw: e.target.value })}
          placeholder="e.g. Delaware"
        />
        <label htmlFor="jurisdiction" className={labelClass}>
          Jurisdiction (city/county and state)
        </label>
        <input
          type="text"
          id="jurisdiction"
          className={inputClass}
          value={data.jurisdiction}
          onChange={(e) => onChange({ jurisdiction: e.target.value })}
          placeholder="e.g. New Castle, Delaware"
        />
      </div>

      {/* Modifications */}
      <div className={sectionClass}>
        <h3 className={sectionHeadingClass}>Modifications</h3>
        <label htmlFor="modifications" className={labelClass}>
          List any modifications to the MNDA (optional)
        </label>
        <textarea
          id="modifications"
          className={textareaClass}
          rows={3}
          value={data.modifications}
          onChange={(e) => onChange({ modifications: e.target.value })}
          placeholder="None."
        />
      </div>

      {/* Party 1 */}
      <div className={sectionClass}>
        <h3 className={sectionHeadingClass}>Party 1</h3>
        <label htmlFor="p1Company" className={labelClass}>Company</label>
        <input
          type="text"
          id="p1Company"
          className={inputClass}
          value={data.p1Company}
          onChange={(e) => onChange({ p1Company: e.target.value })}
          placeholder="Acme Corp."
        />
        <label htmlFor="p1Name" className={labelClass}>Signatory Name</label>
        <input
          type="text"
          id="p1Name"
          className={inputClass}
          value={data.p1Name}
          onChange={(e) => onChange({ p1Name: e.target.value })}
          placeholder="Jane Smith"
        />
        <label htmlFor="p1Title" className={labelClass}>Title</label>
        <input
          type="text"
          id="p1Title"
          className={inputClass}
          value={data.p1Title}
          onChange={(e) => onChange({ p1Title: e.target.value })}
          placeholder="CEO"
        />
        <label htmlFor="p1Address" className={labelClass}>Notice Address (email or postal)</label>
        <input
          type="text"
          id="p1Address"
          className={inputClass}
          value={data.p1Address}
          onChange={(e) => onChange({ p1Address: e.target.value })}
          placeholder="jane@acme.com"
        />
      </div>

      {/* Party 2 */}
      <div className={sectionClass}>
        <h3 className={sectionHeadingClass}>Party 2</h3>
        <label htmlFor="p2Company" className={labelClass}>Company</label>
        <input
          type="text"
          id="p2Company"
          className={inputClass}
          value={data.p2Company}
          onChange={(e) => onChange({ p2Company: e.target.value })}
          placeholder="Beta LLC"
        />
        <label htmlFor="p2Name" className={labelClass}>Signatory Name</label>
        <input
          type="text"
          id="p2Name"
          className={inputClass}
          value={data.p2Name}
          onChange={(e) => onChange({ p2Name: e.target.value })}
          placeholder="John Doe"
        />
        <label htmlFor="p2Title" className={labelClass}>Title</label>
        <input
          type="text"
          id="p2Title"
          className={inputClass}
          value={data.p2Title}
          onChange={(e) => onChange({ p2Title: e.target.value })}
          placeholder="CTO"
        />
        <label htmlFor="p2Address" className={labelClass}>Notice Address (email or postal)</label>
        <input
          type="text"
          id="p2Address"
          className={inputClass}
          value={data.p2Address}
          onChange={(e) => onChange({ p2Address: e.target.value })}
          placeholder="john@beta.com"
        />
      </div>
    </div>
  );
}
