import type { TenantPublicData } from "@/lib/types";
import { EditorialTemplate } from "./EditorialTemplate";
import { MagazineTemplate } from "./MagazineTemplate";
import { PosterTemplate } from "./PosterTemplate";

export function BandSite({ tenant }: { tenant: TenantPublicData }) {
  switch (tenant.template) {
    case "poster":
      return <PosterTemplate tenant={tenant} />;
    case "magazine":
      return <MagazineTemplate tenant={tenant} />;
    case "editorial":
    default:
      return <EditorialTemplate tenant={tenant} />;
  }
}
