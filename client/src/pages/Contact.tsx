import Title from '../components/Title';
import { FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

const Contact = () => {
  return (
    <div className="w-full min-h-screen bg-black py-20 px-4">
      <Title title="Contact Us" />

      <div className="max-w-3xl mx-auto mt-12 flex flex-col gap-10">
        <p className="text-zinc-400 text-center text-lg">
          Have a question or want to reach out? We'd love to hear from you.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <div className="flex items-center gap-3 text-zinc-300">
            <FaEnvelope className="text-primary text-xl" />
            <span>contact@satyabolpu.com</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-300">
            <FaPhone className="text-primary text-xl" />
            <span>+91 98765 43210</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-300">
            <FaMapMarkerAlt className="text-primary text-xl" />
            <span>Mangaluru, Karnataka</span>
          </div>
        </div>

        <form
          className="flex flex-col gap-6 bg-[#111112]/60 border border-zinc-800 rounded-2xl p-8"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-zinc-400">
              Name
            </label>
            <input
              className="w-full text-white bg-black/40 px-4 py-3.5 border border-zinc-800
              rounded-xl focus:outline-none focus:border-primary/80 focus:ring-1
              focus:ring-primary/40 transition-all duration-300"
              type="text"
              placeholder="Your name"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-zinc-400">
              Email
            </label>
            <input
              className="w-full text-white bg-black/40 px-4 py-3.5 border border-zinc-800
              rounded-xl focus:outline-none focus:border-primary/80 focus:ring-1
              focus:ring-primary/40 transition-all duration-300"
              type="email"
              placeholder="your@email.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-zinc-400">
              Message
            </label>
            <textarea
              className="w-full text-white bg-black/40 px-4 py-3.5 border border-zinc-800
              rounded-xl focus:outline-none focus:border-primary/80 focus:ring-1
              focus:ring-primary/40 transition-all duration-300 resize-none"
              rows={5}
              placeholder="How can we help?"
            />
          </div>

          <button
            type="submit"
            className="self-end px-8 py-3 rounded-full bg-primary hover:bg-[#d46f2a] text-black
            font-bold tracking-widest uppercase text-sm transition-all"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
