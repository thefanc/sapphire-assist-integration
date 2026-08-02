import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AMFullLayout } from "@/components/assist-manager/AMFullLayout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Assist Manager Console — Software Vala" },
      {
        name: "description",
        content:
          "Approve, monitor, control and audit secure remote assist sessions from the VALA Connect Assist Manager console.",
      },
      { property: "og:title", content: "Assist Manager Console — Software Vala" },
      {
        property: "og:description",
        content:
          "Approve, monitor, control and audit secure remote assist sessions from the VALA Connect Assist Manager console.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <AMFullLayout />
      <Toaster position="top-right" richColors />
    </>
  );
}
