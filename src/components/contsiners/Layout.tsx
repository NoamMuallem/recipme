import { type ReactNode } from "react";
import { Header } from "../features/header";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <Header />
      <main className="overflow-none flex min-h-screen justify-center">
        <div className="flex h-full w-full flex-col border-x border-slate-400 px-2 md:max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
