'use strict';

// ── Helpers ──────────────────────────────────────────────────────────────────

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function radio(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : '';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
}

/**
 * Create a <span> with textContent set to the user value, or a placeholder span
 * if the value is empty. All user text is set via textContent — never via innerHTML —
 * so no escaping or sanitization step is required.
 */
function fieldSpan(text, placeholder) {
  const span = document.createElement('span');
  if (text && text.trim()) {
    span.className = 'field-value';
    span.textContent = text;
  } else {
    span.className = 'field-empty';
    span.textContent = `[${placeholder}]`;
  }
  return span;
}

/** Create a text node — safe, no injection possible. */
function t(str) {
  return document.createTextNode(str);
}

/** Create an element with optional className and optional text content. */
function el(tag, className, textStr) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (textStr !== undefined) node.textContent = textStr;
  return node;
}

/** Append multiple children (nodes or strings→text-nodes) to parent. */
function append(parent, ...children) {
  for (const child of children) {
    if (child === null || child === undefined) continue;
    parent.appendChild(typeof child === 'string' ? t(child) : child);
  }
  return parent;
}

/** Create a table cell (<td> or <th>) and append children into it. */
function cell(tag, ...children) {
  return append(document.createElement(tag), ...children);
}

// ── Build document as DOM nodes ───────────────────────────────────────────────

function buildDoc(data) {
  const {
    purpose, effectiveDate, mndaTermType, mndaTermYears,
    confTermType, confTermYears, governingLaw, jurisdiction,
    modifications, p1Company, p1Name, p1Title, p1Address,
    p2Company, p2Name, p2Title, p2Address,
  } = data;

  const formattedDate = formatDate(effectiveDate);

  // MNDA term text nodes
  function mndaTermNodes() {
    if (mndaTermType === 'expires') {
      return [
        t('Expires '),
        fieldSpan(mndaTermYears, '1'),
        t(' year(s) from Effective Date.'),
      ];
    }
    return [t('Continues until terminated in accordance with the terms of the MNDA.')];
  }

  // Confidentiality term nodes
  function confTermNodes() {
    if (confTermType === 'years') {
      return [
        fieldSpan(confTermYears, '1'),
        t(' year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.'),
      ];
    }
    return [t('In perpetuity.')];
  }

  const wrap = el('div', 'nda-doc-inner');

  // ── Cover Page ──────────────────────────────────────────────────────────────
  append(wrap, el('h1', null, 'Mutual Non-Disclosure Agreement'));

  append(wrap, el('h2', null, 'USING THIS MUTUAL NON-DISCLOSURE AGREEMENT'));

  const introPara = el('p');
  append(introPara,
    t('This Mutual Non-Disclosure Agreement (the \u201cMNDA\u201d) consists of: (1) this Cover Page (\u201cCover Page\u201d) and (2) the Common Paper Mutual NDA Standard Terms Version 1.0 (\u201cStandard Terms\u201d) identical to those posted at commonpaper.com/standards/mutual-nda/1.0. Any modifications of the Standard Terms should be made on the Cover Page, which will control over conflicts with the Standard Terms.')
  );
  wrap.appendChild(introPara);

  append(wrap, el('h3', null, 'Purpose'));
  const purposePara = el('p');
  const purposeLabel = el('em', null, 'How Confidential Information may be used');
  append(purposePara, purposeLabel, el('br'), fieldSpan(purpose, 'describe the purpose'));
  wrap.appendChild(purposePara);

  append(wrap, el('h3', null, 'Effective Date'));
  const datePara = el('p');
  append(datePara, formattedDate
    ? fieldSpan(formattedDate, '')
    : fieldSpan('', "Today's date"));
  wrap.appendChild(datePara);

  append(wrap, el('h3', null, 'MNDA Term'));
  const mndaTermPara = el('p');
  const mndaTermLabel = el('em', null, 'The length of this MNDA');
  append(mndaTermPara, mndaTermLabel, el('br'), ...mndaTermNodes());
  wrap.appendChild(mndaTermPara);

  append(wrap, el('h3', null, 'Term of Confidentiality'));
  const confTermPara = el('p');
  const confTermLabel = el('em', null, 'How long Confidential Information is protected');
  append(confTermPara, confTermLabel, el('br'), ...confTermNodes());
  wrap.appendChild(confTermPara);

  append(wrap, el('h3', null, 'Governing Law & Jurisdiction'));
  const lawPara = el('p');
  append(lawPara,
    t('Governing Law: '), fieldSpan(governingLaw, 'fill in state'), el('br'),
    t('Jurisdiction: '), fieldSpan(jurisdiction, 'fill in city or county and state')
  );
  wrap.appendChild(lawPara);

  append(wrap, el('h3', null, 'MNDA Modifications'));
  const modPara = el('p');
  append(modPara, fieldSpan(modifications || 'None.', 'list any modifications or \u201cNone.\u201d'));
  wrap.appendChild(modPara);

  const signingPara = el('p');
  signingPara.style.marginTop = '24px';
  signingPara.textContent = 'By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.';
  wrap.appendChild(signingPara);

  // Signature table
  const table = el('table', 'sig-table');
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const th0 = document.createElement('th');
  const th1 = document.createElement('th');
  const th2 = document.createElement('th');

  th1.textContent = 'Party 1';
  if (p1Company) { th1.textContent += ' \u2014 '; th1.appendChild(t(p1Company)); }
  th2.textContent = 'Party 2';
  if (p2Company) { th2.textContent += ' \u2014 '; th2.appendChild(t(p2Company)); }

  append(headerRow, th0, th1, th2);
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  const rows = [
    ['Signature', t('\u00a0'), t('\u00a0')],
    ['Print Name', fieldSpan(p1Name, 'name'), fieldSpan(p2Name, 'name')],
    ['Title',      fieldSpan(p1Title, 'title'), fieldSpan(p2Title, 'title')],
    ['Company',    fieldSpan(p1Company, 'company'), fieldSpan(p2Company, 'company')],
    ['Notice Address', fieldSpan(p1Address, 'email or postal'), fieldSpan(p2Address, 'email or postal')],
    ['Date',
      formattedDate ? fieldSpan(formattedDate, '') : fieldSpan('', 'date'),
      formattedDate ? fieldSpan(formattedDate, '') : fieldSpan('', 'date'),
    ],
  ];
  for (const [label, c1, c2] of rows) {
    const row = document.createElement('tr');
    append(row, cell('th', label), cell('td', c1), cell('td', c2));
    tbody.appendChild(row);
  }
  table.appendChild(tbody);
  wrap.appendChild(table);

  // Divider
  wrap.appendChild(el('hr', 'cover-divider'));

  // ── Standard Terms ──────────────────────────────────────────────────────────
  append(wrap, el('h1', null, 'Standard Terms'));

  function stdPara(boldLabel, ...nodes) {
    const p = el('p');
    const strong = el('strong', null, `${boldLabel}.`);
    append(p, strong, t(' '), ...nodes);
    return p;
  }

  // §1
  const purposeText = purpose || 'the Purpose';
  wrap.appendChild(stdPara('1. Introduction',
    t('This Mutual Non-Disclosure Agreement (which incorporates these Standard Terms and the Cover Page (defined below)) (\u201cMNDA\u201d) allows each party (\u201cDisclosing Party\u201d) to disclose or make available information in connection with the '),
    el('em', null, purposeText),
    t(' which (1) the Disclosing Party identifies to the receiving party (\u201cReceiving Party\u201d) as \u201cconfidential\u201d, \u201cproprietary\u201d, or the like or (2) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure (\u201cConfidential Information\u201d). Each party\u2019s Confidential Information also includes the existence and status of the parties\u2019 discussions and information on the Cover Page. Confidential Information includes technical or business information, product designs or roadmaps, requirements, pricing, security and compliance documentation, technology, inventions and know-how. To use this MNDA, the parties must complete and sign a cover page incorporating these Standard Terms (\u201cCover Page\u201d). Each party is identified on the Cover Page and capitalized terms have the meanings given herein or on the Cover Page.')
  ));

  // §2
  wrap.appendChild(stdPara('2. Use and Protection of Confidential Information',
    t('The Receiving Party shall: (a) use Confidential Information solely for the '),
    el('em', null, purposeText),
    t('; (b) not disclose Confidential Information to third parties without the Disclosing Party\u2019s prior written approval, except that the Receiving Party may disclose Confidential Information to its employees, agents, advisors, contractors and other representatives having a reasonable need to know for the '),
    el('em', null, purposeText),
    t(', provided these representatives are bound by confidentiality obligations no less protective of the Disclosing Party than the applicable terms in this MNDA and the Receiving Party remains responsible for their compliance with this MNDA; and (c) protect Confidential Information using at least the same protections the Receiving Party uses for its own similar information but no less than a reasonable standard of care.')
  ));

  // §3
  wrap.appendChild(stdPara('3. Exceptions',
    t('The Receiving Party\u2019s obligations in this MNDA do not apply to information that it can demonstrate: (a) is or becomes publicly available through no fault of the Receiving Party; (b) it rightfully knew or possessed prior to receipt from the Disclosing Party without confidentiality restrictions; (c) it rightfully obtained from a third party without confidentiality restrictions; or (d) it independently developed without using or referencing the Confidential Information.')
  ));

  // §4
  wrap.appendChild(stdPara('4. Disclosures Required by Law',
    t('The Receiving Party may disclose Confidential Information to the extent required by law, regulation or regulatory authority, subpoena or court order, provided (to the extent legally permitted) it provides the Disclosing Party reasonable advance notice of the required disclosure and reasonably cooperates, at the Disclosing Party\u2019s expense, with the Disclosing Party\u2019s efforts to obtain confidential treatment for the Confidential Information.')
  ));

  // §5
  const termP = el('p');
  const s5strong = el('strong', null, '5. Term and Termination.');
  append(termP, s5strong,
    t(' This MNDA commences on the '),
    formattedDate ? fieldSpan(formattedDate, 'Effective Date') : fieldSpan('', 'Effective Date'),
    t(' and expires at the end of the '),
    ...mndaTermNodes(),
    t(' Either party may terminate this MNDA for any or no reason upon written notice to the other party. The Receiving Party\u2019s obligations relating to Confidential Information will survive for the '),
    ...confTermNodes(),
    t(', despite any expiration or termination of this MNDA.')
  );
  wrap.appendChild(termP);

  // §6
  wrap.appendChild(stdPara('6. Return or Destruction of Confidential Information',
    t('Upon expiration or termination of this MNDA or upon the Disclosing Party\u2019s earlier request, the Receiving Party will: (a) cease using Confidential Information; (b) promptly after the Disclosing Party\u2019s written request, destroy all Confidential Information in the Receiving Party\u2019s possession or control or return it to the Disclosing Party; and (c) if requested by the Disclosing Party, confirm its compliance with these obligations in writing. As an exception to subsection (b), the Receiving Party may retain Confidential Information in accordance with its standard backup or record retention policies or as required by law, but the terms of this MNDA will continue to apply to the retained Confidential Information.')
  ));

  // §7
  wrap.appendChild(stdPara('7. Proprietary Rights',
    t('The Disclosing Party retains all of its intellectual property and other rights in its Confidential Information and its disclosure to the Receiving Party grants no license under such rights.')
  ));

  // §8
  wrap.appendChild(stdPara('8. Disclaimer',
    t('ALL CONFIDENTIAL INFORMATION IS PROVIDED \u201cAS IS\u201d, WITH ALL FAULTS, AND WITHOUT WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.')
  ));

  // §9
  const govP = el('p');
  const s9strong = el('strong', null, '9. Governing Law and Jurisdiction.');
  append(govP, s9strong,
    t(' This MNDA and all matters relating hereto are governed by, and construed in accordance with, the laws of the State of '),
    fieldSpan(governingLaw, 'Governing Law'),
    t(', without regard to the conflict of laws provisions of such '),
    fieldSpan(governingLaw, 'Governing Law'),
    t('. Any legal suit, action, or proceeding relating to this MNDA must be instituted in the federal or state courts located in '),
    fieldSpan(jurisdiction, 'Jurisdiction'),
    t('. Each party irrevocably submits to the exclusive jurisdiction of such '),
    fieldSpan(jurisdiction, 'Jurisdiction'),
    t(' in any such suit, action, or proceeding.')
  );
  wrap.appendChild(govP);

  // §10
  wrap.appendChild(stdPara('10. Equitable Relief',
    t('A breach of this MNDA may cause irreparable harm for which monetary damages are an insufficient remedy. Upon a breach of this MNDA, the Disclosing Party is entitled to seek appropriate equitable relief, including an injunction, in addition to its other remedies.')
  ));

  // §11
  wrap.appendChild(stdPara('11. General',
    t('Neither party has an obligation under this MNDA to disclose Confidential Information to the other or proceed with any proposed transaction. Neither party may assign this MNDA without the prior written consent of the other party, except that either party may assign this MNDA in connection with a merger, reorganization, acquisition or other transfer of all or substantially all its assets or voting securities. Any assignment in violation of this Section is null and void. This MNDA will bind and inure to the benefit of each party\u2019s permitted successors and assigns. Waivers must be signed by the waiving party\u2019s authorized representative and cannot be implied from conduct. If any provision of this MNDA is held unenforceable, it will be limited to the minimum extent necessary so the rest of this MNDA remains in effect. This MNDA (including the Cover Page) constitutes the entire agreement of the parties with respect to its subject matter, and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, whether written or oral, regarding such subject matter. This MNDA may only be amended, modified, waived, or supplemented by an agreement in writing signed by both parties. Notices, requests and approvals under this MNDA must be sent in writing to the email or postal addresses on the Cover Page and are deemed delivered on receipt. This MNDA may be executed in counterparts, including electronic copies, each of which is deemed an original and which together form the same agreement.')
  ));

  const licenseNote = el('p', 'license-note',
    'Common Paper Mutual Non-Disclosure Agreement Version 1.0 free to use under CC BY 4.0.');
  wrap.appendChild(licenseNote);

  return wrap;
}

// ── Render ───────────────────────────────────────────────────────────────────

function render() {
  const data = {
    purpose:       val('purpose') || 'Evaluating whether to enter into a business relationship with the other party.',
    effectiveDate: val('effective-date'),
    mndaTermType:  radio('mnda-term'),
    mndaTermYears: val('mnda-term-years') || '1',
    confTermType:  radio('conf-term'),
    confTermYears: val('conf-term-years') || '1',
    governingLaw:  val('governing-law'),
    jurisdiction:  val('jurisdiction'),
    modifications: val('modifications'),
    p1Company:     val('p1-company'),
    p1Name:        val('p1-name'),
    p1Title:       val('p1-title'),
    p1Address:     val('p1-address'),
    p2Company:     val('p2-company'),
    p2Name:        val('p2-name'),
    p2Title:       val('p2-title'),
    p2Address:     val('p2-address'),
  };

  const preview = document.getElementById('nda-preview');
  preview.replaceChildren(buildDoc(data));
}

// ── Download ─────────────────────────────────────────────────────────────────

function download() {
  const p1   = val('p1-company') || 'Party1';
  const p2   = val('p2-company') || 'Party2';
  const date = val('effective-date') || new Date().toISOString().slice(0, 10);

  // Sanitize filename characters
  const filename = `Mutual-NDA_${p1}_${p2}_${date}`
    .replace(/[^a-zA-Z0-9_\-. ]/g, '-')
    .replace(/\s+/g, '-') + '.html';

  // Serialize the already-rendered DOM node to HTML for download
  const docNode  = document.querySelector('.nda-doc-inner');
  const serializer = new XMLSerializer();
  const docHtml  = docNode ? serializer.serializeToString(docNode) : '';

  const fullHtml = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="UTF-8"/>',
    '<meta name="viewport" content="width=device-width,initial-scale=1.0"/>',
    `<title>Mutual NDA \u2014 ${p1} &amp; ${p2}</title>`,
    '<style>',
    '*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}',
    'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#f5f5f3;color:#1a1a1a;padding:40px}',
    '.nda-doc-inner{max-width:760px;margin:0 auto;background:#fff;border:1px solid #d1d1cc;border-radius:8px;padding:56px 64px;font-size:.9rem;line-height:1.65}',
    '.nda-doc-inner h1{font-size:1.4rem;font-weight:700;margin-bottom:4px}',
    '.nda-doc-inner h2{font-size:1rem;font-weight:600;margin-top:28px;margin-bottom:6px}',
    '.nda-doc-inner h3{font-size:.875rem;font-weight:600;margin-top:20px;margin-bottom:4px;color:#666;text-transform:uppercase;letter-spacing:.04em}',
    '.nda-doc-inner p{margin-bottom:12px}',
    '.cover-divider{border:none;border-top:2px solid #d1d1cc;margin:32px 0}',
    '.field-value{color:#1a56db;font-weight:500}',
    '.field-empty{color:#bbb;font-style:italic}',
    '.nda-doc-inner table{width:100%;border-collapse:collapse;font-size:.85rem;margin-top:16px}',
    '.nda-doc-inner th,.nda-doc-inner td{border:1px solid #d1d1cc;padding:10px 12px;text-align:left;vertical-align:top}',
    '.nda-doc-inner th{background:#f5f5f3;font-weight:600;width:33%}',
    '.license-note{font-size:.78rem;color:#666;margin-top:32px}',
    '@media print{body{background:#fff;padding:0}.nda-doc-inner{border:none;box-shadow:none;padding:0;max-width:100%}}',
    '</style>',
    '</head>',
    '<body>',
    docHtml,
    '</body>',
    '</html>',
  ].join('\n');

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Init ─────────────────────────────────────────────────────────────────────

// Set today's date as default
document.getElementById('effective-date').value = new Date().toISOString().slice(0, 10);

// Wire live preview — debounced for performance
let debounceTimer;
document.getElementById('nda-form').addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(render, 80);
});

document.getElementById('download-btn').addEventListener('click', download);

// Initial render
render();
