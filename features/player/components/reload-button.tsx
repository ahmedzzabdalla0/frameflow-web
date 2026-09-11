import { RotateCw } from "lucide-react";

export default function ReloadButton() {
  function reloadHandle() {
    if (window !== null) {
      window.location.reload();
    }
  }

  return (
    <button
      onClick={reloadHandle}
      className="flex size-10 cursor-pointer items-center justify-center rounded-full border-none bg-black/50"
      aria-label="Refresh page"
    >
      <RotateCw size={20} color="white" strokeWidth={2.25} />
    </button>
  );
}
