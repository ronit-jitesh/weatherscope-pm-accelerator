export default function AboutPMA() {
  return (
    <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold">About PM Accelerator</h2>
        <span className="text-sm text-gray-400">Built by <strong className="text-white">Ronit Jitesh</strong></span>
      </div>

      <p className="text-gray-300 text-sm leading-relaxed mb-5">
        <strong className="text-white">The Product Manager Accelerator Program is designed to support PM professionals through every stage of their careers.</strong>{' '}
        From students looking for entry-level jobs to Directors looking to take on a leadership role, our program has helped over hundreds of students fulfill their career aspirations.
      </p>
      <p className="text-gray-300 text-sm leading-relaxed mb-6">
        Our Product Manager Accelerator community are ambitious and committed. Through our program they have learnt, honed and developed new PM and leadership skills, giving them a strong foundation for their future endeavors.
      </p>

      <p className="text-sm font-semibold text-gray-200 mb-4">Here are examples of services we offer:</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            title: 'PMA Pro',
            desc: 'End-to-end PM job hunting program — master FAANG-level skills, unlimited mock interviews, job referrals via our largest alumni network. 25% of offers from tier 1 companies, up to $800K/year.',
          },
          {
            title: 'AI PM Bootcamp',
            desc: 'Hands-on AI Product Management — build a real AI product with engineers, data scientists, and designers. Launch with real users from our 100,000+ PM community.',
          },
          {
            title: 'PMA Power Skills',
            desc: 'Sharpen product management, leadership, and executive presentation skills for existing PMs.',
          },
          {
            title: 'PMA Leader',
            desc: 'Accelerate to Director and product executive levels. Win in the board room.',
          },
          {
            title: '1:1 Resume Review',
            desc: 'Rewrite your killer PM resume to stand out — with an interview guarantee. Free template used by 14,000+ PMs at drnancyli.com/pmresume.',
          },
          {
            title: '500+ Free Courses',
            desc: 'Free training on YouTube @drnancyli and Instagram @drnancyli. Start learning today.',
          },
        ].map(({ title, desc }) => (
          <div key={title} className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-4">
            <p className="font-semibold text-sky-400 text-sm mb-1">🚀 {title}</p>
            <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <p className="mt-5 text-xs text-gray-500 text-center">
        Weather data by{' '}
        <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="underline text-gray-400">Open-Meteo.com</a>
        {' · '}Map data ©{' '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline text-gray-400">OpenStreetMap</a> contributors
      </p>
    </section>
  );
}
