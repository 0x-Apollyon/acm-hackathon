import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-500/30 glass mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">FinZ</h3>
            <p className="text-white/70 text-sm">
              Smart financial decisions for a better future.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/transactions" className="hover:text-white transition-colors">
                  Transactions
                </Link>
              </li>
              <li>
                <span className="text-white/50 cursor-not-allowed">Banks</span>
              </li>
              <li>
                <span className="text-white/50 cursor-not-allowed">Savings</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Learn</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Simulator
                </Link>
              </li>
              <li>
                <span className="text-white/50 cursor-not-allowed">Lessons</span>
              </li>
              <li>
                <span className="text-white/50 cursor-not-allowed">Tutorials</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <span className="text-white/50 cursor-not-allowed">Help Center</span>
              </li>
              <li>
                <span className="text-white/50 cursor-not-allowed">Contact</span>
              </li>
              <li>
                <span className="text-white/50 cursor-not-allowed">Privacy</span>
              </li>
              <li>
                <span className="text-white/50 cursor-not-allowed">Terms</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-500/30 mt-8 pt-8 text-center">
          <p className="text-white/60 text-sm">
            © 2025 FinZ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
