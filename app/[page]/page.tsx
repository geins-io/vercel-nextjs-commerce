import Prose from 'components/prose';
import { getPage } from 'lib/geins';
import { notFound } from 'next/navigation';
import PageClient from './page-client'; // Import the client component

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params; // Await params before accessing
  const page = resolvedParams.page;
  const pageData = await getPage(page);

  if (!pageData) return notFound();

  return {
    title: pageData.seo?.title || pageData.title,
    description: pageData.seo?.description || pageData.bodySummary,
    openGraph: {
      publishedTime: pageData.createdAt,
      modifiedTime: pageData.updatedAt,
      type: 'article',
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const resolvedParams = await params; // Await params before accessing
  const page = resolvedParams.page;
  const pageData = await getPage(page);

  if (!pageData) return notFound();

  if (pageData.id === 'checkout') {
    // Render the client component for the `checkout` page
    return <PageClient page={pageData} />;
  }

  // Render the default server-rendered content for other pages
  return (
    <div>
      <h1 className="mb-8 text-5xl font-bold">{pageData.title}</h1>
      <Prose className="mb-8" html={pageData.body} />
      <p className="text-sm italic">
        {`This document was last updated on ${new Intl.DateTimeFormat(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(new Date(pageData.updatedAt))}.`}
      </p>
    </div>
  );
}
