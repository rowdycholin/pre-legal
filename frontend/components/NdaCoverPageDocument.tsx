import type { NdaFormData } from '@/lib/types';
import { formatDate } from '@/lib/ndaUtils';

interface Props {
  data: NdaFormData;
}

function Field({ value, placeholder }: { value: string; placeholder: string }) {
  if (value.trim()) return <span className="text-blue-700 font-medium">{value}</span>;
  return <span className="text-gray-400 italic">[{placeholder}]</span>;
}

export default function NdaCoverPageDocument({ data }: Props) {
  const formattedDate = formatDate(data.effectiveDate);
  const purpose = data.purpose || 'Evaluating whether to enter into a business relationship with the other party.';
  const modifications = data.modifications || 'None.';

  const mndaTerm =
    data.mndaTermType === 'expires' ? (
      <>Expires <span className="text-blue-700 font-medium">{data.mndaTermYears}</span> year(s) from Effective Date.</>
    ) : (
      'Continues until terminated in accordance with the terms of the MNDA.'
    );

  const confTerm =
    data.confTermType === 'years' ? (
      <><span className="text-blue-700 font-medium">{data.confTermYears}</span> year(s) from Effective Date.</>
    ) : (
      'In perpetuity.'
    );

  const cellClass = 'border border-gray-300 px-3 py-2 align-top';
  const thClass = `${cellClass} bg-gray-50 font-semibold w-28`;

  return (
    <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-sm leading-relaxed text-gray-900">
      <h1 className="text-xl font-bold mb-1">Mutual Non-Disclosure Agreement — Cover Page</h1>
      <p className="mb-4 text-gray-600">
        Standard terms incorporated by reference from{' '}
        <a href="https://commonpaper.com/standards/mutual-nda/1.0/" className="underline" target="_blank" rel="noopener noreferrer">
          commonpaper.com/standards/mutual-nda/1.0
        </a>
        .
      </p>

      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-5 mb-1">Purpose</h3>
      <p className="mb-3"><Field value={purpose} placeholder="describe the purpose" /></p>

      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-5 mb-1">Effective Date</h3>
      <p className="mb-3">
        {formattedDate ? (
          <span className="text-blue-700 font-medium">{formattedDate}</span>
        ) : (
          <span className="text-gray-400 italic">[Today&apos;s date]</span>
        )}
      </p>

      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-5 mb-1">MNDA Term</h3>
      <p className="mb-3">{mndaTerm}</p>

      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-5 mb-1">Term of Confidentiality</h3>
      <p className="mb-3">{confTerm}</p>

      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-5 mb-1">Governing Law &amp; Jurisdiction</h3>
      <p className="mb-3">
        Governing Law: <Field value={data.governingLaw} placeholder="fill in state" /><br />
        Jurisdiction: <Field value={data.jurisdiction} placeholder="fill in city or county and state" />
      </p>

      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-5 mb-1">MNDA Modifications</h3>
      <p className="mb-3"><Field value={modifications} placeholder="list any modifications or &quot;None.&quot;" /></p>

      <p className="mt-6 mb-4">By signing this Cover Page, each party agrees to be bound by this MNDA as of the Effective Date.</p>

      <table className="w-full border-collapse text-xs mt-4">
        <thead>
          <tr>
            <th className={thClass}></th>
            <th className={cellClass}>
              Party 1{data.p1Company && <> &mdash; <span className="font-semibold">{data.p1Company}</span></>}
            </th>
            <th className={cellClass}>
              Party 2{data.p2Company && <> &mdash; <span className="font-semibold">{data.p2Company}</span></>}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr><th className={thClass}>Signature</th><td className={cellClass}>&nbsp;</td><td className={cellClass}>&nbsp;</td></tr>
          <tr><th className={thClass}>Print Name</th><td className={cellClass}><Field value={data.p1Name} placeholder="name" /></td><td className={cellClass}><Field value={data.p2Name} placeholder="name" /></td></tr>
          <tr><th className={thClass}>Title</th><td className={cellClass}><Field value={data.p1Title} placeholder="title" /></td><td className={cellClass}><Field value={data.p2Title} placeholder="title" /></td></tr>
          <tr><th className={thClass}>Company</th><td className={cellClass}><Field value={data.p1Company} placeholder="company" /></td><td className={cellClass}><Field value={data.p2Company} placeholder="company" /></td></tr>
          <tr><th className={thClass}>Notice Address</th><td className={cellClass}><Field value={data.p1Address} placeholder="email or postal" /></td><td className={cellClass}><Field value={data.p2Address} placeholder="email or postal" /></td></tr>
          <tr>
            <th className={thClass}>Date</th>
            <td className={cellClass}>{formattedDate ? <span className="text-blue-700 font-medium">{formattedDate}</span> : <span className="text-gray-400 italic">[date]</span>}</td>
            <td className={cellClass}>{formattedDate ? <span className="text-blue-700 font-medium">{formattedDate}</span> : <span className="text-gray-400 italic">[date]</span>}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
