import { Globe, FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#06080d] py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-xl font-bold flex items-center gap-2 text-primary">
          <Globe className="w-6 h-6" />
          <span>C0 Net-Zero</span>
        </div>
        <div className="text-sm text-gray-500">
          © 2026 C0 Net-Zero Platform. All rights reserved.
        </div>
        <div className="flex gap-4">
           {/* 11. Document Viewer Trigger placeholder */}
          <button className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
            <FileText className="w-4 h-4" /> Verify Certificates
          </button>
        </div>
      </div>
    </footer>
  );
}
