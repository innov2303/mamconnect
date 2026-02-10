import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  structuredData?: object;
}

const SITE_NAME = "Mam Connect";
const DEFAULT_DESCRIPTION = "Mam Connect met en relation les parents avec les Maisons d'Assistantes Maternelles (MAM) en France. Parcourez l'annuaire, découvrez les MAM de votre secteur et trouvez la place idéale pour votre enfant.";
const BASE_URL = "https://mamconnect.fr";

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogTitle,
  ogDescription,
  ogImage = "/images/hero-bg.png",
  ogType = "website",
  noindex = false,
  structuredData,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Trouvez la MAM idéale pour votre enfant`;
  const fullCanonical = canonical ? `${BASE_URL}${canonical}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {fullCanonical && <link rel="canonical" href={fullCanonical} />}

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      {ogImage && <meta property="og:image" content={ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`} />}
      {fullCanonical && <meta property="og:url" content={fullCanonical} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || fullTitle} />
      <meta name="twitter:description" content={ogDescription || description} />
      {ogImage && <meta name="twitter:image" content={ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`} />}

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
