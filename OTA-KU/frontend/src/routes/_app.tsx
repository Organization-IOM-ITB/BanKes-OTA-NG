import AppSelectorFab from "@/components/app-selector-fab";
import NavBar from "@/components/navbar";
import SessionProvider from "@/components/session";
import { SidebarProvider } from "@/context/sidebar";
import { useSidebar } from "@/context/sidebar-context";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen } = useSidebar();
  const [isLargeScreen, setIsLargeScreen] = useState<boolean>(false);

  // Handle screen size detection
  useEffect(() => {
    // Check initial screen size
    const checkScreenSize = () => {
      // lg breakpoint in Tailwind is 1024px
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    // Set initial value
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Clean up
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <motion.div
      animate={{
        marginLeft: isLargeScreen && isSidebarOpen ? "255px" : "0px",
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      {children}
    </motion.div>
  );
}

function AppLayout() {
  const redirected = useRef(false);

  useEffect(() => {
    if (redirected.current) return;
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((session) => {
        if (session?.user?.role === "Pewawancara") {
          redirected.current = true;
          window.location.href = "/";
        }
      })
      .catch(() => {});
  }, []);

  return (
    <SessionProvider>
      <SidebarProvider>
        <NavBar />
        <SidebarLayout>
          <Outlet />
        </SidebarLayout>
        <AppSelectorFab />
      </SidebarProvider>
    </SessionProvider>
  );
}
