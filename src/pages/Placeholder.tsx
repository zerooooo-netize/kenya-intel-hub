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

export const Team = () => <Placeholder title="Team" desc="Invite analysts and viewers. Admins manage roles in Admin Panel → Users & Roles." />;

export default Placeholder;
