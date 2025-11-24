"use client";

import { useUIStore } from "./store/toggleStore";
import { FrontendPush } from "./components/FrontendPush";
import { BackendPush } from "./components/BackendPush";

export default function Page() {
  const { on } = useUIStore();

  return (
    <>
        <BackendPush />
   
    </>
  );
}