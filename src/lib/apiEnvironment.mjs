export function resolveApiEnvironment(env = {}) {
  const preview = env.VITE_APP_ENV === 'preview';
  if (env.VERCEL_ENV === 'production' && preview) throw new Error('Publicação oficial não pode usar configuração de preview.');
  if (env.VITE_APP_ENV && !['preview','production'].includes(env.VITE_APP_ENV)) throw new Error('VITE_APP_ENV inválido.');
  const base = (env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
  if (!preview && base !== '/api') throw new Error('Build de produção exige API no mesmo domínio (/api).');
  if (preview && base !== '/api') {
    const url = new URL(base);
    if (!['sofa-king-api-preview.onrender.com','sofa-king-configurador-test.onrender.com','localhost','127.0.0.1'].includes(url.hostname)) {
      throw new Error('Preview só pode usar API de testes ou local.');
    }
  }
  return {base,productsCacheKey:preview ? 'sfk_preview_products_v2' : 'sfk_products_v1',cartKey:preview ? 'sk_preview_cart_v2' : 'sk_cart_v1'};
}
