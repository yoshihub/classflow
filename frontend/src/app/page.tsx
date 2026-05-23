import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold">ClassFlow Mini</h1>
        <Button>shadcn/ui Button</Button>
      </div>
    </main>
  );
}