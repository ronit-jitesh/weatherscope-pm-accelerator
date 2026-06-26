export default function AboutPMA() {
  const services = [
    { title: 'PMA Pro', desc: 'End-to-end PM job-hunting program — FAANG-level skills, unlimited mock interviews, and referrals through our largest alumni network. 25% of offers come from tier-1 companies, paying up to $800K/year.' },
    { title: 'AI PM Bootcamp', desc: 'Build a real AI product alongside engineers, data scientists, and designers — then launch it to our 100,000+ PM community.' },
    { title: 'PMA Power Skills', desc: 'Sharpen product, leadership, and executive-presentation skills for working product managers.' },
    { title: 'PMA Leader', desc: 'Accelerate to Director and product-executive levels, and learn to win in the boardroom.' },
    { title: '1:1 Resume Review', desc: 'Rewrite a standout PM resume with an interview guarantee. Free template used by 14,000+ PMs at drnancyli.com/pmresume.' },
    { title: '500+ Free Courses', desc: 'Free training on YouTube @drnancyli and Instagram @drnancyli — start learning today.' },
  ];

  return (
    <section className="glass rounded-[28px] p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20">PM</span>
          <div>
            <h2 className="text-xl font-semibold leading-tight">About PM Accelerator</h2>
            <p className="text-xs text-muted">Product Manager Accelerator · founded by Dr. Nancy Li</p>
          </div>
        </div>
        <span className="glass-strong rounded-full px-4 py-1.5 text-sm">
          Built by <strong className="font-semibold">Ronit Jitesh</strong>
        </span>
      </div>

      <div className="mt-5 space-y-3 text-sm leading-relaxed text-muted max-w-3xl">
        <p>
          <strong className="text-[var(--foreground)]">The Product Manager Accelerator Program supports PM professionals through every stage of their careers.</strong>{' '}
          From students seeking entry-level roles to Directors stepping into leadership, the program has helped hundreds of people fulfil their career aspirations.
        </p>
        <p>
          Our community is ambitious and committed. Through the program they learn, hone, and develop new PM and leadership skills — building a strong foundation for everything that comes next.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {services.map(({ title, desc }) => (
          <div key={title} className="glass-strong rounded-2xl p-4 lift">
            <p className="flex items-center gap-2 font-semibold text-sm">
              <span className="text-[var(--accent)]" aria-hidden>🚀</span> {title}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t hairline pt-4 text-[11px] text-muted text-center">
        Weather data by <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="underline hover:text-[var(--foreground)]">Open-Meteo</a>
        {' · '}Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-[var(--foreground)]">OpenStreetMap</a> contributors
        {' · '}Learn more at <a href="https://www.pmaccelerator.io" target="_blank" rel="noreferrer" className="underline hover:text-[var(--foreground)]">pmaccelerator.io</a>
      </div>
    </section>
  );
}
