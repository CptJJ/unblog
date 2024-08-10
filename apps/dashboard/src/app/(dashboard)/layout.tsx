import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "./components/sidebar";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Sidebar>{children}</Sidebar>
    </>
  );
}
