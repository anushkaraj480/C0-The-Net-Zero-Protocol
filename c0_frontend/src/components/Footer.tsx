import { Globe, FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#142701]/10 bg-[#52B788] py-12 px-6 text-[#142701] shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-xl font-bold flex items-center gap-2 text-[#142701]">
          <Globe className="w-6 h-6" />
          <span>C0: Carbon Intelligence Platform</span>
        </div>
        <div className="text-sm font-semibold text-[#142701]/75">
          © 2026 C0: Carbon Intelligence Platform. All rights reserved.
        </div>
        <div className="flex gap-4">
          {/* 11. Document Viewer Trigger placeholder */}
          <button className="text-sm font-bold text-[#142701] hover:text-white transition-colors flex items-center gap-1">
            <FileText className="w-4 h-4" /> Verify Certificates
          </button>
        </div>
      </div>
    </footer>
  );
}



