export default function KYBAlert() {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          {/* Petit indicateur visuel orange */}
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <div>
            <p className="text-sm font-semibold text-amber-500">
              Vérification BZMarket en cours
            </p>
            <p className="text-xs text-amber-500/80">
              Votre profil vendeur est en cours d'examen par notre équipe.
            </p>
          </div>
        </div>
      </div>
    );
  }