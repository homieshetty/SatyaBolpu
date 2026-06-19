import Title from '../components/Title';
import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const faqs = [
  {
    question: 'What is SatyaBolpu?',
    answer:
      'SatyaBolpu — Tuluva Satya Chitta — is a platform dedicated to preserving and celebrating the cultural heritage of Tulunadu. We document traditions, stories, events, and locations that define this region.',
  },
  {
    question: 'How can I contribute content?',
    answer:
      'You can create an account and use the "Create" section to add posts, cultures, events, and locations. Your contributions help grow the archive and keep Tulunadu\'s heritage alive.',
  },
  {
    question: 'Is SatyaBolpu free to use?',
    answer:
      'Yes, SatyaBolpu is completely free. You can browse all content without an account. Creating an account allows you to contribute and interact with the community.',
  },
  {
    question: 'How do I report incorrect or offensive content?',
    answer:
      'If you find content that is inaccurate or violates community guidelines, please contact us through the Contact Us page and we will review it promptly.',
  },
  {
    question: 'Can I save or bookmark content?',
    answer:
      'Yes, you can like posts and other content by clicking the like button. We are working on adding dedicated bookmarking features in the future.',
  },
  {
    question: 'Who maintains SatyaBolpu?',
    answer:
      'SatyaBolpu is maintained by a team of passionate individuals from Tulunadu who believe in preserving their cultural identity through technology and community collaboration.',
  },
  {
    question: 'How can I contact the team?',
    answer:
      'You can reach us through the Contact Us page, or email us directly at contact@satyabolpu.com. We typically respond within 24–48 hours.',
  },
];

const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-6 py-5 text-left text-white
        hover:bg-zinc-900/50 transition-colors cursor-pointer"
      >
        <span className="font-semibold text-lg">{question}</span>
        <FaChevronDown
          className={`text-primary transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        style={{
          height: open ? 'auto' : '0',
        }}
        className="text-zinc-400 leading-relaxed transition-all overflow-hidden"
      >
        <p className="p-5">{answer}</p>
      </div>
    </div>
  );
};

const FAQ = () => {
  return (
    <div className="w-full min-h-screen bg-black py-20 px-4">
      <Title title="FAQs" />

      <div className="max-w-3xl mx-auto mt-12 flex flex-col gap-4">
        {faqs.map((faq, i) => (
          <FAQItem key={i} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
};

export default FAQ;
