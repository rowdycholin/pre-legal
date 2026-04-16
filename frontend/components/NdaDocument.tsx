import type { NdaFormData } from '@/lib/types';
import { formatDate } from '@/lib/ndaUtils';

interface Props {
  data: NdaFormData;
}

function Field({ value, placeholder }: { value: string; placeholder: string }) {
  if (value.trim()) {
    return <span className="text-blue-700 font-medium">{value}</span>;
  }
  return <span className="text-gray-400 italic">[{placeholder}]</span>;
}

export default function NdaDocument({ data }: Props) {
  const formattedDate = formatDate(data.effectiveDate);
  const purpose = data.purpose || 'Evaluating whether to enter into a business relationship with the other party.';
  const modifications = data.modifications || 'None.';

  const mndaTerm =
    data.mndaTermType === 'expires' ? (
      <>
        Expires <span className="text-blue-700 font-medium">{data.mndaTermYears}</span> year(s) from Effective Date.
      </>
    ) : (
      'Continues until terminated in accordance with the terms of the MNDA.'
    );

  const confTerm =
    data.confTermType === 'years' ? (
      <>
        <span className="text-blue-700 font-medium">{data.confTermYears}</span> year(s) from Effective Date, but in
        the case of trade secrets until Confidential Information is no longer considered a trade secret under
        applicable laws.
      </>
    ) : (
      'In perpetuity.'
    );

  const cellClass = 'border border-gray-300 px-3 py-2 align-top';
  const thClass = `${cellClass} bg-gray-50 font-semibold w-28`;

  return (
    <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-sm leading-relaxed text-gray-900">
      {/* ── Cover Page ─────────────────────────────────────── */}
      <h1 className="text-xl font-bold mb-1">Mutual Non-Disclosure Agreement</h1>

      <h2 className="text-base font-semibold mt-7 mb-1.5">USING THIS MUTUAL NON-DISCLOSURE AGREEMENT</h2>
      <p className="mb-3">
        This Mutual Non-Disclosure Agreement (the &ldquo;<strong>MNDA</strong>&rdquo;) consists of: (1) this Cover
        Page (&ldquo;<strong>Cover Page</strong>&rdquo;) and (2) the Common Paper Mutual NDA Standard Terms Version
        1.0 (&ldquo;<strong>Standard Terms</strong>&rdquo;) identical to those posted at
        commonpaper.com/standards/mutual-nda/1.0. Any modifications of the Standard Terms should be made on the
        Cover Page, which will control over conflicts with the Standard Terms.
      </p>

      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-5 mb-1">Purpose</h3>
      <p className="mb-1 text-xs text-gray-500 italic">How Confidential Information may be used</p>
      <p className="mb-3">
        <Field value={purpose} placeholder="describe the purpose" />
      </p>

      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-5 mb-1">Effective Date</h3>
      <p className="mb-3">
        {formattedDate ? (
          <span className="text-blue-700 font-medium">{formattedDate}</span>
        ) : (
          <span className="text-gray-400 italic">[Today&apos;s date]</span>
        )}
      </p>

      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-5 mb-1">MNDA Term</h3>
      <p className="mb-1 text-xs text-gray-500 italic">The length of this MNDA</p>
      <p className="mb-3">{mndaTerm}</p>

      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-5 mb-1">
        Term of Confidentiality
      </h3>
      <p className="mb-1 text-xs text-gray-500 italic">How long Confidential Information is protected</p>
      <p className="mb-3">{confTerm}</p>

      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-5 mb-1">
        Governing Law &amp; Jurisdiction
      </h3>
      <p className="mb-3">
        Governing Law: <Field value={data.governingLaw} placeholder="fill in state" />
        <br />
        Jurisdiction: <Field value={data.jurisdiction} placeholder="fill in city or county and state" />
      </p>

      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-5 mb-1">
        MNDA Modifications
      </h3>
      <p className="mb-3">
        <Field value={modifications} placeholder="list any modifications or &quot;None.&quot;" />
      </p>

      <p className="mt-6 mb-4">
        By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.
      </p>

      {/* Signature Table */}
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
          <tr>
            <th className={thClass}>Signature</th>
            <td className={cellClass}>&nbsp;</td>
            <td className={cellClass}>&nbsp;</td>
          </tr>
          <tr>
            <th className={thClass}>Print Name</th>
            <td className={cellClass}><Field value={data.p1Name} placeholder="name" /></td>
            <td className={cellClass}><Field value={data.p2Name} placeholder="name" /></td>
          </tr>
          <tr>
            <th className={thClass}>Title</th>
            <td className={cellClass}><Field value={data.p1Title} placeholder="title" /></td>
            <td className={cellClass}><Field value={data.p2Title} placeholder="title" /></td>
          </tr>
          <tr>
            <th className={thClass}>Company</th>
            <td className={cellClass}><Field value={data.p1Company} placeholder="company" /></td>
            <td className={cellClass}><Field value={data.p2Company} placeholder="company" /></td>
          </tr>
          <tr>
            <th className={thClass}>Notice Address</th>
            <td className={cellClass}><Field value={data.p1Address} placeholder="email or postal" /></td>
            <td className={cellClass}><Field value={data.p2Address} placeholder="email or postal" /></td>
          </tr>
          <tr>
            <th className={thClass}>Date</th>
            <td className={cellClass}>
              {formattedDate ? (
                <span className="text-blue-700 font-medium">{formattedDate}</span>
              ) : (
                <span className="text-gray-400 italic">[date]</span>
              )}
            </td>
            <td className={cellClass}>
              {formattedDate ? (
                <span className="text-blue-700 font-medium">{formattedDate}</span>
              ) : (
                <span className="text-gray-400 italic">[date]</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Standard Terms ─────────────────────────────────── */}
      <hr className="my-8 border-t-2 border-gray-200" />
      <h1 className="text-xl font-bold mb-4">Standard Terms</h1>

      <p className="mb-3">
        <strong>1. Introduction.</strong> This Mutual Non-Disclosure Agreement (which incorporates these Standard
        Terms and the Cover Page) (&ldquo;<strong>MNDA</strong>&rdquo;) allows each party (&ldquo;
        <strong>Disclosing Party</strong>&rdquo;) to disclose or make available information in connection with
        the <em>{purpose}</em> which (1) the Disclosing Party identifies to the receiving party (&ldquo;
        <strong>Receiving Party</strong>&rdquo;) as &ldquo;confidential&rdquo;, &ldquo;proprietary&rdquo;, or
        the like or (2) should be reasonably understood as confidential or proprietary due to its nature and the
        circumstances of its disclosure (&ldquo;<strong>Confidential Information</strong>&rdquo;). Each party&rsquo;s
        Confidential Information also includes the existence and status of the parties&rsquo; discussions and
        information on the Cover Page. Confidential Information includes technical or business information, product
        designs or roadmaps, requirements, pricing, security and compliance documentation, technology, inventions and
        know-how. To use this MNDA, the parties must complete and sign a cover page incorporating these Standard
        Terms (&ldquo;<strong>Cover Page</strong>&rdquo;). Each party is identified on the Cover Page and capitalized
        terms have the meanings given herein or on the Cover Page.
      </p>

      <p className="mb-3">
        <strong>2. Use and Protection of Confidential Information.</strong> The Receiving Party shall: (a) use
        Confidential Information solely for the <em>{purpose}</em>; (b) not disclose Confidential Information to
        third parties without the Disclosing Party&rsquo;s prior written approval, except that the Receiving Party
        may disclose Confidential Information to its employees, agents, advisors, contractors and other
        representatives having a reasonable need to know for the <em>{purpose}</em>, provided these representatives
        are bound by confidentiality obligations no less protective of the Disclosing Party than the applicable terms
        in this MNDA and the Receiving Party remains responsible for their compliance with this MNDA; and (c) protect
        Confidential Information using at least the same protections the Receiving Party uses for its own similar
        information but no less than a reasonable standard of care.
      </p>

      <p className="mb-3">
        <strong>3. Exceptions.</strong> The Receiving Party&rsquo;s obligations in this MNDA do not apply to
        information that it can demonstrate: (a) is or becomes publicly available through no fault of the Receiving
        Party; (b) it rightfully knew or possessed prior to receipt from the Disclosing Party without
        confidentiality restrictions; (c) it rightfully obtained from a third party without confidentiality
        restrictions; or (d) it independently developed without using or referencing the Confidential Information.
      </p>

      <p className="mb-3">
        <strong>4. Disclosures Required by Law.</strong> The Receiving Party may disclose Confidential Information
        to the extent required by law, regulation or regulatory authority, subpoena or court order, provided (to the
        extent legally permitted) it provides the Disclosing Party reasonable advance notice of the required
        disclosure and reasonably cooperates, at the Disclosing Party&rsquo;s expense, with the Disclosing
        Party&rsquo;s efforts to obtain confidential treatment for the Confidential Information.
      </p>

      <p className="mb-3">
        <strong>5. Term and Termination.</strong> This MNDA commences on the{' '}
        {formattedDate ? (
          <span className="text-blue-700 font-medium">{formattedDate}</span>
        ) : (
          <span className="text-gray-400 italic">[Effective Date]</span>
        )}{' '}
        and expires at the end of the {mndaTerm} Either party may terminate this MNDA for any or no reason upon
        written notice to the other party. The Receiving Party&rsquo;s obligations relating to Confidential
        Information will survive for the {confTerm}, despite any expiration or termination of this MNDA.
      </p>

      <p className="mb-3">
        <strong>6. Return or Destruction of Confidential Information.</strong> Upon expiration or termination of
        this MNDA or upon the Disclosing Party&rsquo;s earlier request, the Receiving Party will: (a) cease using
        Confidential Information; (b) promptly after the Disclosing Party&rsquo;s written request, destroy all
        Confidential Information in the Receiving Party&rsquo;s possession or control or return it to the Disclosing
        Party; and (c) if requested by the Disclosing Party, confirm its compliance with these obligations in
        writing. As an exception to subsection (b), the Receiving Party may retain Confidential Information in
        accordance with its standard backup or record retention policies or as required by law, but the terms of
        this MNDA will continue to apply to the retained Confidential Information.
      </p>

      <p className="mb-3">
        <strong>7. Proprietary Rights.</strong> The Disclosing Party retains all of its intellectual property and
        other rights in its Confidential Information and its disclosure to the Receiving Party grants no license
        under such rights.
      </p>

      <p className="mb-3">
        <strong>8. Disclaimer.</strong> ALL CONFIDENTIAL INFORMATION IS PROVIDED &ldquo;AS IS&rdquo;, WITH ALL
        FAULTS, AND WITHOUT WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR
        A PARTICULAR PURPOSE.
      </p>

      <p className="mb-3">
        <strong>9. Governing Law and Jurisdiction.</strong> This MNDA and all matters relating hereto are governed
        by, and construed in accordance with, the laws of the State of{' '}
        <Field value={data.governingLaw} placeholder="Governing Law" />, without regard to the conflict of laws
        provisions of such <Field value={data.governingLaw} placeholder="Governing Law" />. Any legal suit, action,
        or proceeding relating to this MNDA must be instituted in the federal or state courts located in{' '}
        <Field value={data.jurisdiction} placeholder="Jurisdiction" />. Each party irrevocably submits to the
        exclusive jurisdiction of such <Field value={data.jurisdiction} placeholder="Jurisdiction" /> in any such
        suit, action, or proceeding.
      </p>

      <p className="mb-3">
        <strong>10. Equitable Relief.</strong> A breach of this MNDA may cause irreparable harm for which monetary
        damages are an insufficient remedy. Upon a breach of this MNDA, the Disclosing Party is entitled to seek
        appropriate equitable relief, including an injunction, in addition to its other remedies.
      </p>

      <p className="mb-3">
        <strong>11. General.</strong> Neither party has an obligation under this MNDA to disclose Confidential
        Information to the other or proceed with any proposed transaction. Neither party may assign this MNDA
        without the prior written consent of the other party, except that either party may assign this MNDA in
        connection with a merger, reorganization, acquisition or other transfer of all or substantially all its
        assets or voting securities. Any assignment in violation of this Section is null and void. This MNDA will
        bind and inure to the benefit of each party&rsquo;s permitted successors and assigns. Waivers must be
        signed by the waiving party&rsquo;s authorized representative and cannot be implied from conduct. If any
        provision of this MNDA is held unenforceable, it will be limited to the minimum extent necessary so the
        rest of this MNDA remains in effect. This MNDA (including the Cover Page) constitutes the entire agreement
        of the parties with respect to its subject matter, and supersedes all prior and contemporaneous
        understandings, agreements, representations, and warranties, whether written or oral, regarding such subject
        matter. This MNDA may only be amended, modified, waived, or supplemented by an agreement in writing signed
        by both parties. Notices, requests and approvals under this MNDA must be sent in writing to the email or
        postal addresses on the Cover Page and are deemed delivered on receipt. This MNDA may be executed in
        counterparts, including electronic copies, each of which is deemed an original and which together form the
        same agreement.
      </p>

      <p className="text-xs text-gray-500 mt-8">
        Common Paper Mutual Non-Disclosure Agreement{' '}
        <a
          href="https://commonpaper.com/standards/mutual-nda/1.0/"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Version 1.0
        </a>{' '}
        free to use under{' '}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          CC BY 4.0
        </a>
        .
      </p>
    </div>
  );
}
