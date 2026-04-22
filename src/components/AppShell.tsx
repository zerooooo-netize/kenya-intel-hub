import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

const AppShell = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex bg-gradient-hero">
    <Sidebar />
    <div className="flex-1 min-w-0 flex flex-col">
      <TopBar />
      <main className="flex-1 p-4 lg:p-8 space-y-7 overflow-x-hidden">{children}</main>
    </div>
  </div>
);

export default AppShell;
