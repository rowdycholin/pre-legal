import { NextRequest, NextResponse } from 'next/server';
import { buildDownloadHtml, buildDownloadFilename } from '@/lib/ndaUtils';
import type { NdaFormData } from '@/lib/types';

export async function POST(req: NextRequest) {
  let body: Partial<NdaFormData>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const data: NdaFormData = {
    purpose: (body.purpose ?? 'Evaluating whether to enter into a business relationship with the other party.').trim(),
    effectiveDate: (body.effectiveDate ?? '').trim(),
    mndaTermType: body.mndaTermType === 'until-terminated' ? 'until-terminated' : 'expires',
    mndaTermYears: Number(body.mndaTermYears ?? 1),
    confTermType: body.confTermType === 'perpetuity' ? 'perpetuity' : 'years',
    confTermYears: Number(body.confTermYears ?? 1),
    governingLaw: (body.governingLaw ?? '').trim(),
    jurisdiction: (body.jurisdiction ?? '').trim(),
    modifications: (body.modifications ?? '').trim(),
    p1Company: (body.p1Company ?? '').trim(),
    p1Name: (body.p1Name ?? '').trim(),
    p1Title: (body.p1Title ?? '').trim(),
    p1Address: (body.p1Address ?? '').trim(),
    p2Company: (body.p2Company ?? '').trim(),
    p2Name: (body.p2Name ?? '').trim(),
    p2Title: (body.p2Title ?? '').trim(),
    p2Address: (body.p2Address ?? '').trim(),
  };

  const html = buildDownloadHtml(data);
  const filename = buildDownloadFilename(data);

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
