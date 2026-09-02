import { notFound } from "next/navigation";
import { BandSite } from "@/components/templates/BandSite";
import { getTenantBySlug, toPublicTenant } from "@/lib/tenant";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) return { title: "Band not found" };
  return {
    title: tenant.name,
    description: `${tenant.name} — ${tenant.tagline}`,
  };
}

export default async function BandPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();
  return <BandSite tenant={toPublicTenant(tenant)} />;
}
