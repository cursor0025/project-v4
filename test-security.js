// Script de test automatique de sécurité - BZMARKET
// Usage: node test-security.js

const BASE_URL = 'http://localhost:3000'
let passed = 0
let failed = 0

console.log('🔐 DÉMARRAGE DES TESTS DE SÉCURITÉ BZMARKET\n')
console.log('⚠️  Assure-toi que le serveur tourne (npm run dev)\n')

// Fonction helper pour les tests
async function test(name, testFn) {
  process.stdout.write(`Testing: ${name}... `)
  try {
    await testFn()
    console.log('✅ PASS')
    passed++
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`)
    failed++
  }
}

// Helper pour fetch avec timeout
async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    if (error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}

// TEST 1: Security Headers
async function testSecurityHeaders() {
  const res = await fetchWithTimeout(BASE_URL)
  const headers = res.headers
  
  const requiredHeaders = {
    'x-frame-options': 'SAMEORIGIN',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin'
  }
  
  for (const [header, expectedValue] of Object.entries(requiredHeaders)) {
    const actualValue = headers.get(header)
    if (!actualValue || !actualValue.toLowerCase().includes(expectedValue.toLowerCase())) {
      throw new Error(`Missing or incorrect header: ${header}`)
    }
  }
}

// TEST 2: Rate Limiting
async function testRateLimit() {
  const testEndpoint = `${BASE_URL}/api/vendor/orders/test-id-123`
  let rateLimitHit = false
  
  // Faire 35 requêtes rapides (limite = 30)
  for (let i = 0; i < 35; i++) {
    try {
      const res = await fetchWithTimeout(testEndpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (res.status === 429) {
        rateLimitHit = true
        break
      }
    } catch (error) {
      // Ignorer les erreurs de connexion
    }
  }
  
  if (!rateLimitHit) {
    throw new Error('Rate limit not triggered after 35 requests')
  }
}

// TEST 3: Validation Zod (mauvais status)
async function testZodValidation() {
  const res = await fetchWithTimeout(`${BASE_URL}/api/vendor/orders/test-123`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'invalid_status_here' })
  })
  
  if (res.status !== 400 && res.status !== 401) {
    throw new Error(`Expected 400 or 401, got ${res.status}`)
  }
  
  const data = await res.json()
  if (res.status === 400 && !data.error) {
    throw new Error('Validation error should return error field')
  }
}

// TEST 4: Protected Route (Dashboard sans auth)
async function testProtectedRoute() {
  const res = await fetchWithTimeout(`${BASE_URL}/dashboard`, {
    redirect: 'manual'
  })
  
  // Devrait rediriger (302/307) ou bloquer (401/403)
  if (![302, 307, 401, 403].includes(res.status)) {
    throw new Error(`Dashboard should be protected, got status ${res.status}`)
  }
}

// TEST 5: Auth endpoint existe
async function testAuthEndpoint() {
  const res = await fetchWithTimeout(`${BASE_URL}/login`)
  
  if (!res.ok && res.status !== 401) {
    throw new Error(`Login page should be accessible, got ${res.status}`)
  }
}

// TEST 6: API avec données manquantes
async function testMissingData() {
  const res = await fetchWithTimeout(`${BASE_URL}/api/vendor/orders/test`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}) // Vide
  })
  
  // Devrait accepter (car tous les champs sont optional) OU refuser si pas auth
  if (![200, 400, 401, 404].includes(res.status)) {
    throw new Error(`Unexpected status: ${res.status}`)
  }
}

// TEST 7: Rate Limit Headers présents
async function testRateLimitHeaders() {
  const res = await fetchWithTimeout(`${BASE_URL}/api/vendor/orders/test`)
  const headers = res.headers
  
  const hasLimitHeader = headers.get('x-ratelimit-limit')
  const hasRemainingHeader = headers.get('x-ratelimit-remaining')
  
  if (!hasLimitHeader || !hasRemainingHeader) {
    throw new Error('Rate limit headers missing')
  }
}

// TEST 8: Next.js version
async function testNextVersion() {
  const packageJson = require('./package.json')
  const nextVersion = packageJson.dependencies.next
  
  if (!nextVersion.includes('16.1') && !nextVersion.includes('16.2')) {
    throw new Error(`Next.js version should be 16.1+, got ${nextVersion}`)
  }
}

// TEST 9: Fichiers de sécurité existent
async function testSecurityFiles() {
  const fs = require('fs')
  const files = [
    'lib/rate-limit.ts',
    'lib/validation.ts',
    'SECURITY.md',
    'next.config.ts'
  ]
  
  for (const file of files) {
    if (!fs.existsSync(file)) {
      throw new Error(`File missing: ${file}`)
    }
  }
}

// TEST 10: Variables d'environnement
async function testEnvVariables() {
  const fs = require('fs')
  
  if (!fs.existsSync('.env.local')) {
    throw new Error('.env.local file missing')
  }
  
  const envContent = fs.readFileSync('.env.local', 'utf8')
  
  if (!envContent.includes('SUPABASE_SERVICE_ROLE_KEY')) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not found in .env.local')
  }
  
  if (!envContent.includes('NEXT_PUBLIC_SUPABASE_URL')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL not found in .env.local')
  }
}

// EXÉCUTION DES TESTS
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════\n')
  
  await test('1. Security Headers (HTTP)', testSecurityHeaders)
  await test('2. Rate Limiting (30 req/min)', testRateLimit)
  await test('3. Zod Validation (invalid input)', testZodValidation)
  await test('4. Protected Routes (Dashboard)', testProtectedRoute)
  await test('5. Auth Endpoint (Login page)', testAuthEndpoint)
  await test('6. Missing Data Handling', testMissingData)
  await test('7. Rate Limit Headers', testRateLimitHeaders)
  await test('8. Next.js Version (16.1+)', testNextVersion)
  await test('9. Security Files Existence', testSecurityFiles)
  await test('10. Environment Variables', testEnvVariables)
  
  console.log('\n═══════════════════════════════════════════════════')
  console.log(`\n📊 RÉSULTATS: ${passed} PASS / ${failed} FAIL\n`)
  
  if (failed === 0) {
    console.log('🎉 TOUS LES TESTS PASSENT ! Sécurité opérationnelle.\n')
    process.exit(0)
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifie les erreurs ci-dessus.\n')
    process.exit(1)
  }
}

// Lancer les tests
runAllTests().catch(error => {
  console.error('\n❌ ERREUR FATALE:', error.message)
  console.log('\n⚠️  Assure-toi que le serveur tourne: npm run dev\n')
  process.exit(1)
})
