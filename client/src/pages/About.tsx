import Title from '../components/Title';

const About = () => {
  return (
    <div className="w-full min-h-screen bg-black py-20 px-4">
      <Title title="About Us" />

      <div className="max-w-3xl mx-auto mt-12 flex flex-col gap-10 text-zinc-400 text-lg leading-relaxed">
        <p className="text-center">
          <span className="text-primary font-bold">SatyaBolpu</span> — Tuluva
          Satya Chitta — is a platform dedicated to preserving, documenting, and
          celebrating the rich cultural heritage of Tulunadu.
        </p>

        <div className="flex flex-col gap-6 bg-[#111112]/60 border border-zinc-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white">Our Mission</h2>
          <p>
            We aim to create a living archive of Tulunadu's traditions — from
            Daivaradhane and Nagaradhane to Yakshagana and Kambala — ensuring
            that the stories, rituals, and art forms of this land are accessible
            to future generations.
          </p>
        </div>

        <div className="flex flex-col gap-6 bg-[#111112]/60 border border-zinc-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white">What We Offer</h2>
          <ul className="list-disc list-inside flex flex-col gap-3">
            <li>
              <span className="text-white font-semibold">Posts</span> — Articles
              and stories about Tulunadu's culture, history, and people.
            </li>
            <li>
              <span className="text-white font-semibold">Cultures</span> — In-depth
              documentation of traditions, rituals, and practices.
            </li>
            <li>
              <span className="text-white font-semibold">Events</span> — A calendar
              of cultural events, festivals, and gatherings.
            </li>
            <li>
              <span className="text-white font-semibold">Blogs</span> — Personal
              narratives and community voices.
            </li>
            <li>
              <span className="text-white font-semibold">Map</span> — An
              interactive map of culturally significant locations.
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-6 bg-[#111112]/60 border border-zinc-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white">Join Us</h2>
          <p>
            SatyaBolpu is a community-driven platform. Whether you want to share
            a story, document a tradition, or simply explore — you belong here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
