import { FiUsers, FiHeart, FiCreditCard, FiShield } from 'react-icons/fi';
import { MdTempleHindu } from 'react-icons/md';
import { FaGooglePay } from 'react-icons/fa';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useApi from '../hooks/useApi';

const donationAmounts = [
  { amount: '₹100', label: 'Supporter', value: 100 },
  { amount: '₹250', label: 'Contributor', value: 250 },
  { amount: '₹500', label: 'Patron', value: 500 },
  { amount: '₹1,000', label: 'Sustainer', value: 1000 },
];

const Donate = () => {
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const donationApi = useApi('/api/donate/create-order', { auto: false });
  const verifyApi = useApi('/api/donate/verify', { auto: false });

  const handleDonateClick = async () => {
    try {
      setIsProcessing(true);

      // Determine final amount
      const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

      if (!finalAmount || finalAmount <= 0) {
        toast.error('Please enter a valid amount');
        setIsProcessing(false);
        return;
      }

      // Step 1: Create order on backend
      const orderResponse = await donationApi.post(
        { amount: finalAmount },
        { globalLoad: false }
      );

      if (!orderResponse || !orderResponse.success) {
        toast.error('Failed to create donation order');
        setIsProcessing(false);
        return;
      }

      const order = orderResponse.order;

      // Step 2: Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'SatyaBolpu',
        description: 'Support Tulunadu Heritage Preservation',
        image: '/vite.svg',
        order_id: order.id,
        handler: async (response: any) => {
          // Step 3: Verify payment on backend
          try {
            const verifyResponse = await verifyApi.post(
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: finalAmount,
              },
              { globalLoad: false }
            );

            if (verifyResponse?.success) {
              toast.success('Thank you for your generous donation! 🙏');
              setCustomAmount('');
              setSelectedAmount(100);
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Failed to verify payment');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#ea580c',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on('payment.failed', (response: any) => {
        toast.error(`Payment failed: ${response.error.description}`);
      });
    } catch (error) {
      console.error('Donation error:', error);
      toast.error('Failed to process donation');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black px-6 py-8 text-white md:px-12 w-full">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-zinc-950">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent z-10" />

          <img
            src="/images/daiva-hero.jpg"
            alt="Daiva performance"
            className="absolute right-0 top-0 h-full w-full object-cover opacity-40 md:w-1/2"
          />

          <div className="relative z-20 p-8 md:p-14 md:w-2/3">
            <p className="mb-4 text-lg font-semibold text-orange-500">
              Support SatyaBolpu
            </p>

            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
              Keep our culture alive.
            </h1>

            <div className="max-w-xl space-y-3 text-zinc-300">
              <p>
                SatyaBolpu is a community-driven platform preserving Tulunadu's
                daiva, traditions and cultural practices.
              </p>

              <p>
                Your support helps us keep it running —
                <span className="font-semibold text-orange-500">
                  {' '}
                  without ads.
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Donation Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Amounts */}
          <div className="rounded-3xl border border-orange-500/20 bg-zinc-950 p-8 lg:col-span-2">
            <h2 className="mb-6 text-3xl font-semibold">Choose an amount</h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {donationAmounts.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    setSelectedAmount(item.value);
                    setCustomAmount('');
                  }}
                  className={`rounded-2xl border p-6 text-center transition-all duration-200 hover:border-orange-500 hover:bg-orange-500/10 ${
                    selectedAmount === item.value && !customAmount
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-zinc-800'
                  }`}
                >
                  <h3 className="text-3xl font-bold text-white">
                    {item.amount}
                  </h3>

                  <p className="mt-2 text-zinc-400">{item.label}</p>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <input
                type="number"
                placeholder="Other amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  if (e.target.value) {
                    setSelectedAmount(0);
                  }
                }}
                className="w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="mt-6 flex items-center gap-3 text-sm text-zinc-400">
              <FiShield className="text-orange-500" />
              <p>
                Secure payments. Your support helps us stay independent and
                ad-free.
              </p>
            </div>
          </div>

          {/* Payment Card */}
          <div className="rounded-3xl border border-orange-500/20 bg-zinc-950 p-8">
            <h2 className="mb-6 text-3xl font-semibold">
              Complete your donation
            </h2>

            <div className="space-y-4">
              <button
                onClick={handleDonateClick}
                disabled={isProcessing}
                className="flex w-full items-center justify-between rounded-2xl border border-zinc-800 px-5 py-4 transition hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <FaGooglePay className="text-3xl text-orange-500" />
                  <span>{isProcessing ? 'Processing...' : 'UPI / QR'}</span>
                </div>

                <span className="text-zinc-500">›</span>
              </button>

              <button
                onClick={handleDonateClick}
                disabled={isProcessing}
                className="flex w-full items-center justify-between rounded-2xl border border-zinc-800 px-5 py-4 transition hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <FiCreditCard className="text-xl text-orange-500" />
                  <span>{isProcessing ? 'Processing...' : 'Debit / Credit Card'}</span>
                </div>

                <span className="text-zinc-500">›</span>
              </button>
            </div>

            <div className="mt-8 flex gap-4 rounded-2xl bg-zinc-900 p-5">
              <FiHeart className="mt-1 text-2xl text-orange-500" />

              <p className="text-zinc-400">
                Every contribution keeps Tulunadu's heritage alive for future
                generations.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <section className="grid gap-6 rounded-3xl border border-orange-500/20 bg-zinc-950 p-8 md:grid-cols-3">
          <div className="flex gap-4">
            <FiUsers className="mt-1 text-4xl text-orange-500" />

            <div>
              <h3 className="mb-2 text-xl font-semibold">Community First</h3>

              <p className="text-zinc-400">
                Built for and by the community of Tulunadu.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <FiShield className="mt-1 text-4xl text-orange-500" />

            <div>
              <h3 className="mb-2 text-xl font-semibold">No Ads. Ever.</h3>

              <p className="text-zinc-400">
                We don't run ads. Your support keeps it that way.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <MdTempleHindu className="mt-1 text-4xl text-orange-500" />

            <div>
              <h3 className="mb-2 text-xl font-semibold">Preserve & Educate</h3>

              <p className="text-zinc-400">
                Documenting daiva, traditions and practices for the world to
                learn.
              </p>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-2 w-full justify-center">
          <span>Thank you for supporting our culture.</span>
          <FiHeart className="text-orange-500" />
        </div>
      </div>
    </div>
  );
};

export default Donate;
