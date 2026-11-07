import { GrantlyProvider } from "@/lib/grantly-store";
import { GrantlyView } from "@/components/grantly/grantly-view";

export default function Home() {
  return (
    <GrantlyProvider>
      <GrantlyView />
    </GrantlyProvider>
  );
}
