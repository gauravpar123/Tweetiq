const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// In-memory store for card data (username -> { data, imageBuffer })
const cardStore = new Map();

// Save card data + image after analysis
router.post('/save', (req, res) => {
  try {
    const { username, data, image } = req.body;

    if (!username || !data) {
      return res.status(400).json({ error: 'Username and data are required' });
    }

    // Store card data
    const cardData = {
      username,
      profile: data.profile,
      analysis: data.analysis,
      insights: data.insights,
      tweetIQScore: data.tweetIQScore,
      savedAt: new Date().toISOString()
    };

    // If image is provided as base64 data URI, decode it
    let imageBuffer = null;
    if (image && image.startsWith('data:image/png;base64,')) {
      imageBuffer = Buffer.from(image.replace('data:image/png;base64,', ''), 'base64');
    }

    cardStore.set(username.toLowerCase(), { data: cardData, imageBuffer });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const cardUrl = `${baseUrl}/card/${username}`;

    console.log(`✅ Card saved for @${username}: ${cardUrl}`);

    res.json({
      success: true,
      cardUrl,
      imageUrl: `${baseUrl}/card/${username}/image`
    });
  } catch (error) {
    console.error('❌ Error saving card:', error);
    res.status(500).json({ error: 'Failed to save card' });
  }
});

// Serve card image as PNG
router.get('/:username/image', (req, res) => {
  const username = req.params.username.toLowerCase();
  const card = cardStore.get(username);

  if (!card || !card.imageBuffer) {
    // Generate a fallback SVG card
    const data = card?.data;
    const svg = generateSVGCard(data, username);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(svg);
  }

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(card.imageBuffer);
});

// Serve card page with Twitter Card meta tags
router.get('/:username', (req, res) => {
  const username = req.params.username.toLowerCase();
  const card = cardStore.get(username);

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const imageUrl = `${baseUrl}/card/${username}/image`;

  // Default values if no data stored yet
  const name = card?.data?.profile?.name || username;
  const score = card?.data?.tweetIQScore || card?.data?.insights?.overallScore || '??';
  const rank = card?.data?.insights?.rankPercentile || '';
  const viralHook = card?.data?.analysis?.contentDNA?.viralHook || '??';
  const opinion = card?.data?.analysis?.contentDNA?.opinion || '??';
  const humor = card?.data?.analysis?.contentDNA?.humor || '??';

  const title = `${name}'s TweetIQ Score: ${score}/100`;
  const description = `Viral Hook: ${viralHook} · Opinion: ${opinion} · Humor: ${humor} ${rank ? '· ' + rank : ''} — Decode your Twitter DNA at TweetIQ`;

  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>

  <!-- Open Graph -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:type" content="website">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0a; color: #fff; font-family: 'Bricolage Grotesque', system-ui, sans-serif; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; }
    .card-wrap { width: 100%; max-width: 700px; }
    .card-img { width: 100%; border-radius: 16px; border: 1px solid #222; }
    h1 { margin-top: 24px; font-size: 28px; text-align: center; }
    p { margin-top: 8px; color: #888; font-size: 14px; text-align: center; }
    .cta { display: inline-block; margin-top: 24px; background: #f97316; color: #000; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; }
    .cta:hover { opacity: .9; }
  </style>
</head>
<body>
  <div class="card-wrap">
    <img class="card-img" src="${imageUrl}" alt="${name}'s TweetIQ Card">
    <h1>${title}</h1>
    <p>${description}</p>
    <div style="text-align:center">
      <a class="cta" href="/">Decode Your Twitter DNA →</a>
    </div>
  </div>
</body>
</html>`);
});

function generateSVGCard(data, username) {
  const name = data?.profile?.name || username;
  const score = data?.tweetIQScore || '??';
  const dna = data?.analysis?.contentDNA || {};
  const bars = [
    { label: 'Viral Hook', val: dna.viralHook || 50 },
    { label: 'Opinion', val: dna.opinion || 50 },
    { label: 'Humor', val: dna.humor || 50 },
    { label: 'Depth', val: dna.depth || 50 },
    { label: 'Storytelling', val: dna.storytelling || 50 },
  ];

  const barsSVG = bars.map((b, i) => {
    const y = 120 + i * 85;
    const barWidth = (b.val / 100) * 520;
    return `
      <text x="430" y="${y}" fill="#999" font-size="28" font-family="sans-serif">${b.label}</text>
      <rect x="430" y="${y + 14}" width="520" height="22" rx="11" fill="#1c1c1c"/>
      <rect x="430" y="${y + 14}" width="${barWidth}" height="22" rx="11" fill="#f97316"/>
      <text x="970" y="${y}" fill="#fff" font-size="32" font-weight="bold" font-family="sans-serif" text-anchor="end">${b.val}</text>
    `;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#0a0a0a"/>
    <rect width="1200" height="4" fill="#f97316"/>
    <circle cx="200" cy="220" r="80" fill="#1a1a1a" stroke="#f97316" stroke-width="4"/>
    <text x="200" y="232" text-anchor="middle" fill="#fff" font-size="48" font-weight="bold" font-family="sans-serif">${name.slice(0, 2).toUpperCase()}</text>
    <text x="200" y="340" text-anchor="middle" fill="#fff" font-size="32" font-weight="bold" font-family="sans-serif">${name}</text>
    <text x="200" y="375" text-anchor="middle" fill="#f97316" font-size="20" font-family="monospace">@${username}</text>
    <text x="200" y="440" text-anchor="middle" fill="#777" font-size="16" font-family="monospace" letter-spacing="3">IQ SCORE</text>
    <text x="200" y="510" text-anchor="middle" fill="#fff" font-size="80" font-weight="bold" font-family="sans-serif">${score}</text>
    <line x1="380" y1="80" x2="380" y2="550" stroke="#242424" stroke-width="1"/>
    ${barsSVG}
    <text x="1170" y="605" text-anchor="end" fill="#444" font-size="18" font-weight="bold" font-family="monospace">✦ TweetIQ</text>
  </svg>`;
}

module.exports = router;
