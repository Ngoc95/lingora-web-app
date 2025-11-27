'use client'
import { Button } from "@/components/ui/button";

const Home = () => {
  return <div className="flex flex-col items-center justify-center h-screen">
    <h1 className="text-x font-bold bg-amber-200 mb-10">Lingora app</h1>
    <Button variant={"link"} onClick={() => alert("Shadcn button clicked")}>Shadcn button</Button>
  </div>;
};

export default Home;