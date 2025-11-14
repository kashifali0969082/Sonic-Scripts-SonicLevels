"use client";

import { useToggleStore } from "./store/toggleStore";
import { FrontendPush } from "./components/FrontendPush";
import { BackendPush } from "./components/BackendPush";

export default function Page() {
  const { on } = useToggleStore();

  return (
    <>

      {on ? <BackendPush /> : <FrontendPush />}
    </>
  );
}
