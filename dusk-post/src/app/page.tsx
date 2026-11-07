import { PressProvider } from "@/components/press-provider";
import { Colophon } from "@/components/layout/colophon";
import { TopSlug } from "@/components/layout/top-slug";
import { CommissionDesk } from "@/components/sections/commission-desk";
import { EditionWall } from "@/components/sections/edition-wall";
import { Passes } from "@/components/sections/passes";
import { PlateBed } from "@/components/sections/plate-bed";
import { ProofTable } from "@/components/sections/proof-table";
import { SpecSheet } from "@/components/sections/spec-sheet";
import { TypeDrawer } from "@/components/sections/type-drawer";
import { EggDialog } from "@/components/shared/egg-dialog";
import { HalftoneTrail } from "@/components/shared/halftone-trail";

export default function Home() {
  return (
    <PressProvider>
      <TopSlug />
      <main id="content">
        <ProofTable />
        <SpecSheet />
        <Passes />
        <PlateBed />
        <EditionWall />
        <TypeDrawer />
        <CommissionDesk />
      </main>
      <Colophon />
      <HalftoneTrail />
      <EggDialog />
    </PressProvider>
  );
}
