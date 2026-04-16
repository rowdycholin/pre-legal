import NdaCreator from '@/components/NdaCreator';

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3">
        <h1 className="text-lg font-semibold text-gray-900">Mutual NDA Creator</h1>
        <p className="text-xs text-gray-500">
          Fill in the fields on the left to generate your Mutual Non-Disclosure Agreement.
        </p>
      </header>
      <div className="flex-1 overflow-hidden">
        <NdaCreator />
      </div>
    </div>
  );
}
