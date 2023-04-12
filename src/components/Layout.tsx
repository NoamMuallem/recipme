import { ReactNode } from "react";
import { Header } from "./header";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-[#c9f5d4] to-[#f3f5c9]">
        {children}
      </main>
    </div>
  );
};

export default Layout;
