import AppShell from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Placeholder = ({ title, desc }: { title: string; desc: string }) => (
  <AppShell>
    <Card className="glass border-border/60">
      <CardHeader><CardTitle className="font-display text-2xl">{title}</CardTitle></CardHeader>
      <CardContent className="text-sm text-muted-foreground">{desc}</CardContent>
    </Card>
  </AppShell>
);

export const Reports = () => <Placeholder title="Reports" desc="PDF intelligence reports coming in the next iteration. Use any Bot's 'AI Briefing' button to generate raw briefings now." />;
export const Alerts = () => <Placeholder title="Alerts" desc="Realtime alerts feed (WebSocket-driven) — ready to wire to live sources once admin enables API connections." />;
export const DataExplorer = () => <Placeholder title="Data Explorer" desc="Filter & export raw mentions across all enabled sources." />;
export const Team = () => <Placeholder title="Team" desc="Invite analysts and viewers. Admins manage roles in Admin Panel → Users & Roles." />;

export default Placeholder;
