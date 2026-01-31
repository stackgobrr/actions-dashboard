# SEO

Search engine optimization and social sharing configuration.

## What We Do

**Standard SEO**
- Meta description optimized for GitHub Actions monitoring keywords
- Responsive viewport configuration
- Character encoding setup

**Social Sharing**
- Open Graph tags for Facebook, LinkedIn, and general platforms
- Twitter Card configuration for optimized previews
- Social share images (og-image.png)

**Rich Search Results**
- JSON-LD structured data marking the site as a WebApplication
- Organization and creator information
- Application category and description

**Environment Awareness**
- Production: Allows search engine indexing
- Non-production: Automatic `noindex, nofollow` to prevent staging/dev indexing

## Implementation

All SEO configuration lives in [index.html](../index.html) as meta tags and JSON-LD schema.

## Future Enhancements

- Sitemap generation
- Canonical URLs
- Core Web Vitals monitoring
- Backlink strategy
