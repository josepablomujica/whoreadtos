import Link from 'next/link';
import type { Metadata } from 'next';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact — whoreadtos',
  description: 'Get in touch with the whoreadtos team.',
};

export default function Contact() {
  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <nav className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-[#1D9E75] text-lg tracking-tight">whoreadtos</Link>
            <Link href="/rankings" className="text-sm font-medium text-gray-600 hover:text-[#1D9E75] transition-colors">Rankings</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Contact</h1>
        <p className="text-gray-500 mb-10">
          Bug? Company request? Just want to say hi? We read every message.
        </p>

        <ContactForm />
      </main>

      <footer className="max-w-3xl mx-auto px-6 py-8 flex flex-wrap gap-4 items-center justify-between text-sm text-gray-400 border-t border-gray-100 mt-6">
        <Link href="/" className="hover:text-[#1D9E75] transition-colors">← whoreadtos</Link>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-[#1D9E75] transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-[#1D9E75] transition-colors">Privacy</Link>
          <Link href="/contact" className="text-[#1D9E75]">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
