import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
    structuredData?: Record<string, any>;
}

export const SEO: React.FC<SEOProps> = ({
    title,
    description,
    keywords,
    image = 'https://examsphare.web.app/og-image.png',
    url = window.location.href,
    type = 'website',
    structuredData
}) => {
    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{title} | ExamSphere</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={`${title} | ExamSphere`} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={`${title} | ExamSphere`} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />

            {/* Canonical */}
            <link rel="canonical" href={url} />

            {/* Structured Data (JSON-LD) */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    "name": "ExamSphere",
                    "url": "https://examsphare.web.app",
                    "logo": "https://examsphare.web.app/logo.png",
                    "sameAs": [
                        "https://twitter.com/examsphere",
                        "https://github.com/examsphere"
                    ],
                    "contactPoint": {
                        "@type": "ContactPoint",
                        "contactType": "customer support",
                        "email": "support@examsphere.app"
                    },
                    ...structuredData
                })}
            </script>
        </Helmet>
    );
};
