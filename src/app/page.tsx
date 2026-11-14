import { AuthBootstrap } from "@/components/auth/AuthBootstrap";

export const instant = false;

export default function HomePage() {
  return <AuthBootstrap scope="root">{null}</AuthBootstrap>;
}
