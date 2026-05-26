import NotFoundView from "@/components/modules/errors/NotFoundView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | NexusMarket",
  description: "The page you are looking for does not exist on NexusMarket.",
};

export default function Custom404Page() {
  return <NotFoundView />;
}
