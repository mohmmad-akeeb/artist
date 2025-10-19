/**
 * Structured Data Component
 *
 * This component provides a reusable way to inject structured data (JSON-LD)
 * into pages for better SEO and search engine understanding.
 */

interface StructuredDataProps {
  data: Record<string, any>;
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}

/**
 * Multiple Structured Data Component
 *
 * For pages that need multiple structured data objects
 */
interface MultipleStructuredDataProps {
  dataArray: Array<Record<string, any>>;
}

export function MultipleStructuredData({
  dataArray,
}: MultipleStructuredDataProps) {
  return (
    <>
      {dataArray.map((data, index) => (
        <StructuredData key={index} data={data} />
      ))}
    </>
  );
}
