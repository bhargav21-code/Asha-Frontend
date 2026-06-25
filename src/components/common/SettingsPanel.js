import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';

const APP_URL = window.location.origin;

export default function SettingsPanel() {
  const { logout } = useAuth();
  const { lang, t, changeLang } = useLang();
  const navigate = useNavigate();

  const [open, setOpen]           = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [showShare, setShowShare]   = useState(false);
  const [showLang, setShowLang]     = useState(false);
  const [copied, setCopied]         = useState(false);

  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(APP_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'ASHA Health System', text: t('shareMsg'), url: APP_URL });
      } catch {}
    }
  };

  const LANGS = [
    { code: 'en', label: t('english'), native: 'English' },
    { code: 'hi', label: t('hindi'),   native: 'हिंदी' },
    { code: 'gu', label: t('gujarati'),native: 'ગુજરાતી' },
  ];

  return (
    <div className="relative" ref={ref}>
      {/* Settings Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
        title={t('settings')}
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700">⚙️ {t('settings')}</p>
          </div>

          <div className="p-2">
            {/* Language */}
            <div>
              <button
                onClick={() => { setShowLang(l => !l); setShowShare(false); }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm text-gray-700">
                  🌐 {t('language')}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                    {lang === 'en' ? 'EN' : lang === 'hi' ? 'हि' : 'gu'}
                  </span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${showLang ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>

              {showLang && (
                <div className="mx-2 mb-1 rounded-xl border border-gray-100 overflow-hidden">
                  {LANGS.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { changeLang(l.code); setShowLang(false); setOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                        lang === l.code
                          ? 'bg-green-50 text-green-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{l.native}</span>
                      {lang === l.code && <span className="text-green-600">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Share App */}
            <div>
              <button
                onClick={() => { setShowShare(s => !s); setShowLang(false); }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm text-gray-700">
                  📤 {t('shareApp')}
                </span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${showShare ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showShare && (
                <div className="mx-2 mb-1 rounded-xl border border-gray-100 p-3 space-y-2">
                  {/* App link preview */}
                  <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500 font-mono truncate">{APP_URL}</div>

                  {/* Copy */}
                  <button
                    onClick={copyLink}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      copied ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {copied ? '✅ ' + t('copied') : '📎 ' + t('copyLink')}
                  </button>

                  {/* Native share (mobile) */}
                  {navigator.share && (
                    <button
                      onClick={shareNative}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      📲 {t('shareVia')}
                    </button>
                  )}

                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(t('shareMsg') + ' ' + APP_URL)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
                  >
                    💬 WhatsApp
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:?subject=${encodeURIComponent('ASHA Health System')}&body=${encodeURIComponent(t('shareMsg') + '\n' + APP_URL)}`}
                    className="flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                  >
                    📧 Email
                  </a>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="my-1 border-t border-gray-100" />

            {/* Sign Out */}
            <button
              onClick={() => { setOpen(false); setShowSignOut(true); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
            >
              <span className="text-sm">🚪 {t('signOut')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      {showSignOut && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowSignOut(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚪</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t('signOut')}</h3>
            <p className="text-sm text-gray-500 mb-6">{t('confirmSignOut')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOut(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                {t('yes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
