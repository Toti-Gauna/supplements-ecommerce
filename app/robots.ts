import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { SITE_URL } from "@/lib/base-path";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: site.indexable ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
