import type { DesignPartnerFormData } from '@/lib/types';
import { formatDate } from '@/lib/ndaUtils';

interface Props {
  data: DesignPartnerFormData;
}

function Field({ value, placeholder }: { value: string; placeholder: string }) {
  if (value.trim()) return <span className="text-blue-700 font-medium">{value}</span>;
  return <span className="text-gray-400 italic">[{placeholder}]</span>;
}

export default function DesignPartnerDocument({ data }: Props) {
  const fmtDate = formatDate(data.effectiveDate);

  const cellClass = 'border border-gray-300 px-3 py-2 align-top';
  const thClass = `${cellClass} bg-gray-50 font-semibold w-32`;

  return (
    <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-sm leading-relaxed text-gray-900">
      <h1 className="text-xl font-bold mb-1">Design Partner Agreement</h1>
      <p className="mb-4 text-gray-600">
        Effective{' '}
        {fmtDate ? <span className="text-blue-700 font-medium">{fmtDate}</span> : <span className="text-gray-400 italic">[Effective Date]</span>}
      </p>

      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-5 mb-1">Provider</h3>
      <p className="mb-3"><Field value={data.provider} placeholder="provider company" /></p>

      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-5 mb-1">Design Partner</h3>
      <p className="mb-3"><Field value={data.partner} placeholder="partner company" /></p>

      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-5 mb-1">Product</h3>
      <p className="mb-3"><Field value={data.product} placeholder="product name" /></p>

      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-5 mb-1">Program</h3>
      <p className="mb-3"><Field value={data.program} placeholder="design partner program name" /></p>

      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-5 mb-1">Term</h3>
      <p className="mb-3"><Field value={data.term} placeholder="e.g. 12 months" /></p>

      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-5 mb-1">Fees</h3>
      <p className="mb-3"><Field value={data.fees || 'None.'} placeholder="fees or None." /></p>

      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-5 mb-1">Governing Law &amp; Courts</h3>
      <p className="mb-3">
        Governing Law: <Field value={data.governingLaw} placeholder="fill in state" /><br />
        Chosen Courts: <Field value={data.chosenCourts} placeholder="fill in city or county and state" />
      </p>

      <p className="mt-6 mb-4">By signing below, the parties agree to the terms of this Design Partner Agreement.</p>

      <table className="w-full border-collapse text-xs mt-4">
        <thead>
          <tr>
            <th className={thClass}></th>
            <th className={cellClass}>
              Provider{data.provider && <> &mdash; <span className="font-semibold">{data.provider}</span></>}
            </th>
            <th className={cellClass}>
              Partner{data.partner && <> &mdash; <span className="font-semibold">{data.partner}</span></>}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr><th className={thClass}>Signature</th><td className={cellClass}>&nbsp;</td><td className={cellClass}>&nbsp;</td></tr>
          <tr><th className={thClass}>Print Name</th><td className={cellClass}><Field value={data.p1Name} placeholder="name" /></td><td className={cellClass}><Field value={data.p2Name} placeholder="name" /></td></tr>
          <tr><th className={thClass}>Title</th><td className={cellClass}><Field value={data.p1Title} placeholder="title" /></td><td className={cellClass}><Field value={data.p2Title} placeholder="title" /></td></tr>
          <tr><th className={thClass}>Notice Address</th><td className={cellClass}><Field value={data.p1Address} placeholder="email or postal" /></td><td className={cellClass}><Field value={data.p2Address} placeholder="email or postal" /></td></tr>
          <tr>
            <th className={thClass}>Date</th>
            <td className={cellClass}>{fmtDate ? <span className="text-blue-700 font-medium">{fmtDate}</span> : <span className="text-gray-400 italic">[date]</span>}</td>
            <td className={cellClass}>{fmtDate ? <span className="text-blue-700 font-medium">{fmtDate}</span> : <span className="text-gray-400 italic">[date]</span>}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
