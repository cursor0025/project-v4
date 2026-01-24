// Générer un code à 6 chiffres aléatoire
export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  // Calculer l'expiration du code (15 minutes)
  export function getCodeExpiration(): Date {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    return now;
  }
  
  // Calculer le temps de blocage (30 minutes)
  export function getBlockedUntil(): Date {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now;
  }
  
  // Vérifier si le code est expiré
  export function isCodeExpired(expiresAt: Date): boolean {
    return new Date() > new Date(expiresAt);
  }
  
  // Vérifier si l'utilisateur est bloqué
  export function isUserBlocked(blockedUntil: Date | null): boolean {
    if (!blockedUntil) return false;
    return new Date() < new Date(blockedUntil);
  }
  
  // Calculer le temps restant de blocage (en minutes)
  export function getRemainingBlockTime(blockedUntil: Date): number {
    const now = new Date();
    const blocked = new Date(blockedUntil);
    const diffMs = blocked.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60)); // Conversion en minutes
  }
  
  // Vérifier si on peut renvoyer un code (1 minute entre chaque envoi)
  export function canResendCode(lastSentAt: Date | null): boolean {
    if (!lastSentAt) return true;
    const now = new Date();
    const lastSent = new Date(lastSentAt);
    const diffMs = now.getTime() - lastSent.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    return diffMinutes >= 1; // 1 minute minimum
  }
  
  // Constantes de configuration
  export const VERIFICATION_CONFIG = {
    MAX_ATTEMPTS: 3,           // 3 tentatives max
    MAX_RESENDS: 3,            // 3 renvois max
    CODE_VALIDITY_MINUTES: 15, // Code valable 15 min
    BLOCK_DURATION_MINUTES: 30,// Blocage 30 min
    RESEND_DELAY_MINUTES: 1    // 1 min entre renvois
  };
  