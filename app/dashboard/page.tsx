export default function DashboardHomePage() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <h2 className="text-lg font-semibold tracking-tight">Welcome</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Choose a tool from the sidebar to begin.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          {
            title: "AI Chat",
            desc: "Ask questions about a matter with citations and context.",
          },
          {
            title: "Document Review",
            desc: "Upload and OCR documents for fast issue spotting.",
          },
          {
            title: "Contract Generator",
            desc: "Generate structured clauses and checklists.",
          },
          {
            title: "Legal Research",
            desc: "Organize research notes and summarize authorities.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5"
          >
            <div className="text-sm font-semibold">{card.title}</div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {card.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

