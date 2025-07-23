import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
}

export const useSEO = ({
  title,
  description,
  keywords,
  author,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  twitterTitle,
  twitterDescription,
  twitterImage,
  canonical
}: SEOProps) => {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Helper function to update or create meta tags
    const updateMetaTag = (selector: string, content: string) => {
      if (!content) return;
      
      let element = document.querySelector(selector) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        if (selector.includes('property=')) {
          element.setAttribute('property', selector.split('"')[1]);
        } else if (selector.includes('name=')) {
          element.setAttribute('name', selector.split('"')[1]);
        }
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Helper function to update or create link tags
    const updateLinkTag = (rel: string, href: string) => {
      if (!href) return;
      
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!element) {
        element = document.createElement('link');
        element.rel = rel;
        document.head.appendChild(element);
      }
      element.href = href;
    };

    // Update basic meta tags
    updateMetaTag('meta[name="description"]', description || '');
    updateMetaTag('meta[name="keywords"]', keywords || '');
    updateMetaTag('meta[name="author"]', author || '');

    // Update Open Graph tags
    updateMetaTag('meta[property="og:title"]', ogTitle || title || '');
    updateMetaTag('meta[property="og:description"]', ogDescription || description || '');
    updateMetaTag('meta[property="og:image"]', ogImage || '');
    updateMetaTag('meta[property="og:url"]', ogUrl || window.location.href);

    // Update Twitter tags
    updateMetaTag('meta[name="twitter:title"]', twitterTitle || ogTitle || title || '');
    updateMetaTag('meta[name="twitter:description"]', twitterDescription || ogDescription || description || '');
    updateMetaTag('meta[name="twitter:image"]', twitterImage || ogImage || '');

    // Update canonical URL
    if (canonical) {
      updateLinkTag('canonical', canonical);
    }

    // Cleanup function to restore original values on unmount
    return () => {
      // Restore original title
      document.title = 'ReadMode - by Curate.Fun | News Made Fun';
      
      // Restore original meta descriptions
      updateMetaTag('meta[name="description"]', 'News made fun! Swipe to read articles in an engaging, newspaper-style interface. Discover, like, and save stories from your favorite sources with ReadMode by Curate.Fun.');
      updateMetaTag('meta[property="og:title"]', 'ReadMode - by Curate.Fun | News Made Fun');
      updateMetaTag('meta[property="og:description"]', 'News made fun! Swipe to read articles in an engaging, newspaper-style interface. Discover, like, and save stories from your favorite sources.');
      updateMetaTag('meta[property="og:url"]', 'https://curate.fun/');
      updateMetaTag('meta[name="twitter:title"]', 'ReadMode - by Curate.Fun | News Made Fun');
      updateMetaTag('meta[name="twitter:description"]', 'News made fun! Swipe to read articles in an engaging, newspaper-style interface. Discover, like, and save stories.');
      updateLinkTag('canonical', 'https://curate.fun/');
    };
  }, [title, description, keywords, author, ogTitle, ogDescription, ogImage, ogUrl, twitterTitle, twitterDescription, twitterImage, canonical]);
};