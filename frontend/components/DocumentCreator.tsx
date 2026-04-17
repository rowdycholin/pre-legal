'use client';

import { useState, useCallback, useMemo } from 'react';
import DocumentChat from './DocumentChat';
import NdaDocument from './NdaDocument';
import NdaCoverPageDocument from './NdaCoverPageDocument';
import PilotDocument from './PilotDocument';
import DesignPartnerDocument from './DesignPartnerDocument';
import AiAddendumDocument from './AiAddendumDocument';
import {
  DOCUMENT_MAP,
  defaultNdaFormData,
  defaultPilotFormData,
  defaultDesignPartnerFormData,
  defaultAiAddendumFormData,
} from '@/lib/documents';
import type {
  DocumentType,
  NdaFormData,
  PilotFormData,
  DesignPartnerFormData,
  AiAddendumFormData,
} from '@/lib/types';

interface Props {
  isLoggedIn: boolean;
}

export default function DocumentCreator({ isLoggedIn }: Props) {
  const [docType, setDocType] = useState<DocumentType | null>(null);
  const [ndaData, setNdaData] = useState<NdaFormData>(defaultNdaFormData);
  const [pilotData, setPilotData] = useState<PilotFormData>(defaultPilotFormData);
  const [designPartnerData, setDesignPartnerData] = useState<DesignPartnerFormData>(defaultDesignPartnerFormData);
  const [aiAddendumData, setAiAddendumData] = useState<AiAddendumFormData>(defaultAiAddendumFormData);
  const [downloading, setDownloading] = useState(false);

  const currentFields: Record<string, unknown> = useMemo(() => {
    switch (docType) {
      case 'mutual-nda':
      case 'nda-cover-page':
        return ndaData as unknown as Record<string, unknown>;
      case 'pilot-agreement':
        return pilotData as unknown as Record<string, unknown>;
      case 'design-partner-agreement':
        return designPartnerData as unknown as Record<string, unknown>;
      case 'ai-addendum':
        return aiAddendumData as unknown as Record<string, unknown>;
      default:
        return {};
    }
  }, [docType, ndaData, pilotData, designPartnerData, aiAddendumData]);

  const handleDocTypeSelected = useCallback((selected: DocumentType) => {
    setDocType(selected);
  }, []);

  const handleFieldsUpdate = useCallback(
    (updated: Record<string, unknown>) => {
      switch (docType) {
        case 'mutual-nda':
        case 'nda-cover-page':
          setNdaData((prev) => ({ ...prev, ...updated }));
          break;
        case 'pilot-agreement':
          setPilotData((prev) => ({ ...prev, ...updated }));
          break;
        case 'design-partner-agreement':
          setDesignPartnerData((prev) => ({ ...prev, ...updated }));
          break;
        case 'ai-addendum':
          setAiAddendumData((prev) => ({ ...prev, ...updated }));
          break;
      }
    },
    [docType],
  );

  const allRequiredFilled = useMemo(() => {
    if (!docType) return false;
    const config = DOCUMENT_MAP[docType];
    const fields = currentFields;
    return config.requiredFields.every((f) => Boolean(fields[f]));
  }, [docType, currentFields]);

  const handleDownload = useCallback(async () => {
    if (!docType || !isLoggedIn) return;
    setDownloading(true);
    try {
      const config = DOCUMENT_MAP[docType];
      const token = localStorage.getItem('auth_token') ?? '';
      const res = await fetch(config.downloadEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(currentFields),
      });

      if (res.status === 401 || res.status === 403) {
        alert('Please sign in to download.');
        return;
      }
      if (!res.ok) throw new Error('Download failed');

      const disposition = res.headers.get('Content-Disposition') ?? '';
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match ? match[1] : `${docType}.pdf`;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  }, [docType, isLoggedIn, currentFields]);

  const docName = docType ? DOCUMENT_MAP[docType].name : null;

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Chat Panel ──────────────────────────────────────────── */}
      <aside className="w-80 flex-shrink-0 flex flex-col bg-white border-r border-gray-200 overflow-hidden">
        <div className="flex-shrink-0 border-b border-gray-200 px-4 py-2.5 text-xs font-semibold text-navy uppercase tracking-wide">
          AI Assistant
        </div>
        <div className="flex-1 overflow-hidden">
          <DocumentChat
            docType={docType}
            currentFields={currentFields}
            onDocTypeSelected={handleDocTypeSelected}
            onFieldsUpdate={handleFieldsUpdate}
          />
        </div>
        <div className="border-t border-gray-200 p-4">
          {isLoggedIn ? (
            <>
              <button
                onClick={handleDownload}
                disabled={downloading || !allRequiredFilled || !docType}
                title={!allRequiredFilled ? 'Complete all required fields to download' : undefined}
                className="w-full bg-purple-secondary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg text-sm transition-opacity"
              >
                {downloading ? 'Generating…' : docName ? `Download ${docName}` : 'Download'}
              </button>
              {!allRequiredFilled && docType && (
                <p className="mt-2 text-center text-xs text-gray-text">
                  Fill all required fields to enable download
                </p>
              )}
            </>
          ) : (
            <p className="text-center text-xs text-gray-text">
              <a href="/login/" className="text-blue-primary underline hover:opacity-80">Sign in</a> to download your document
            </p>
          )}
        </div>
      </aside>

      {/* ── Preview Panel ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        <div className="flex-shrink-0 border-b border-gray-200 bg-white px-5 py-2.5 text-xs font-medium text-gray-text">
          {docName ? `Preview — ${docName}` : 'Live Document Preview'}
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          {docType === 'mutual-nda' && <NdaDocument data={ndaData} />}
          {docType === 'nda-cover-page' && <NdaCoverPageDocument data={ndaData} />}
          {docType === 'pilot-agreement' && <PilotDocument data={pilotData} />}
          {docType === 'design-partner-agreement' && <DesignPartnerDocument data={designPartnerData} />}
          {docType === 'ai-addendum' && <AiAddendumDocument data={aiAddendumData} />}
          {!docType && (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Select a document type to see a live preview
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
