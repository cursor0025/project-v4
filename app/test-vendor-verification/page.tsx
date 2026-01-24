'use client';

import { useState } from 'react';

export default function TestVendorVerificationPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [step, setStep] = useState<'send' | 'verify'>('send');

  // Envoyer le code de vérification
  const handleSendCode = async () => {
    setLoading(true);
    setResult(null);

    const response = await fetch('/api/vendor-verification/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendorEmail: email,
        vendorName: name
      })
    });

    const data = await response.json();
    setResult(data);
    setLoading(false);

    if (data.success) {
      setStep('verify');
    }
  };

  // Vérifier le code
  const handleVerifyCode = async () => {
    setLoading(true);
    setResult(null);

    const response = await fetch('/api/vendor-verification/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendorEmail: email,
        code
      })
    });

    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  // Renvoyer un code
  const handleResendCode = () => {
    setCode('');
    setResult(null);
    handleSendCode();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">
          🧪 Test Vérification Vendeur
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Système sécurisé : 3 tentatives max • Blocage 30 min • Code valable 15 min
        </p>

        {/* Étape 1 : Envoi du code */}
        {step === 'send' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email du vendeur
              </label>
              <input
                type="email"
                placeholder="proclaude249@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du vendeur
              </label>
              <input
                type="text"
                placeholder="Zinou"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleSendCode}
              disabled={loading || !email || !name}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? '📧 Envoi en cours...' : '📧 Envoyer le code de vérification'}
            </button>
          </div>
        )}

        {/* Étape 2 : Vérification du code */}
        {step === 'verify' && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 text-sm">
                ✅ Code envoyé à <strong>{email}</strong>
              </p>
              <p className="text-green-700 text-xs mt-1">
                Vérifiez votre boîte mail (et vos spams)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code de vérification (6 chiffres)
              </label>
              <input
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleVerifyCode}
              disabled={loading || code.length !== 6}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? '🔐 Vérification...' : '🔐 Vérifier le code'}
            </button>

            <button
              onClick={handleResendCode}
              disabled={loading}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition text-sm"
            >
              📬 Renvoyer un nouveau code
            </button>

            <button
              onClick={() => {
                setStep('send');
                setCode('');
                setResult(null);
              }}
              className="w-full text-gray-500 text-sm hover:text-gray-700"
            >
              ← Changer d'email
            </button>
          </div>
        )}

        {/* Résultats */}
        {result && (
          <div className={`mt-6 p-4 rounded-lg border ${
            result.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <p className={`font-semibold mb-2 ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.success ? '✅ ' : '❌ '}
              {result.message || result.error}
            </p>
            
            {result.debug_code && (
              <p className="text-green-700 text-sm mt-2 font-mono bg-green-100 p-2 rounded">
                🔑 Code de test : <strong>{result.debug_code}</strong>
              </p>
            )}

            {result.remainingAttempts !== undefined && (
              <p className="text-red-700 text-sm mt-2">
                ⚠️ Tentatives restantes : <strong>{result.remainingAttempts}</strong>
              </p>
            )}

            {result.blockedFor && (
              <p className="text-red-700 text-sm mt-2">
                🔒 Bloqué pendant : <strong>{result.blockedFor} minute{result.blockedFor > 1 ? 's' : ''}</strong>
              </p>
            )}

            {result.expiresIn && (
              <p className="text-green-700 text-sm mt-2">
                ⏱️ Code valable : <strong>{result.expiresIn} minutes</strong>
              </p>
            )}

            {result.verified && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-green-800 font-semibold text-center">
                  🎉 Compte vendeur vérifié avec succès !
                </p>
              </div>
            )}
          </div>
        )}

        {/* Infos système */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            ℹ️ Règles de sécurité
          </h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Maximum 3 tentatives de vérification</li>
            <li>• Blocage de 30 minutes après 3 échecs</li>
            <li>• Code valable pendant 15 minutes</li>
            <li>• Maximum 3 renvois de code</li>
            <li>• Délai de 1 minute entre chaque renvoi</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
