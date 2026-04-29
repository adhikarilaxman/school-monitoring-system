import { useTranslation } from 'react-i18next';
import { Building2, Facebook, Twitter, Instagram } from 'lucide-react';

const PublicFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-100 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-navy-500 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-navy-500">{t('app.fullName')}</h3>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Dedicated to excellence in government-subsidized education. Transforming lives and communities across the district.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-4">{t('public.footer.quickLinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-slate-600 hover:text-navy-500 transition-colors">District Directory</a></li>
              <li><a href="/" className="text-slate-600 hover:text-navy-500 transition-colors">Board of Governors</a></li>
              <li><a href="/" className="text-slate-600 hover:text-navy-500 transition-colors">Employment</a></li>
              <li><a href="/" className="text-slate-600 hover:text-navy-500 transition-colors">Career Portal</a></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-4">{t('public.footer.community')}</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-slate-600 hover:text-navy-500 transition-colors">Private Volunteer Portal</a></li>
              <li><a href="/" className="text-slate-600 hover:text-navy-500 transition-colors">Alumni Network</a></li>
              <li><a href="/" className="text-slate-600 hover:text-navy-500 transition-colors">Governance Book</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-4">{t('public.footer.contact')}</h4>
            <p className="text-sm text-slate-600 mb-4">
              District Education Office, Main Plaza<br />
              Government Administrative Wing A
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-slate-200 hover:bg-navy-500 hover:text-white rounded-full flex items-center justify-center transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-slate-200 hover:bg-navy-500 hover:text-white rounded-full flex items-center justify-center transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-slate-200 hover:bg-navy-500 hover:text-white rounded-full flex items-center justify-center transition-all">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">{t('public.footer.copyright')}</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-700 transition-colors">Compliance Policy</a>
            <a href="#" className="hover:text-slate-700 transition-colors">System Logs</a>
            <a href="#" className="hover:text-slate-700 transition-colors">Institutional Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
