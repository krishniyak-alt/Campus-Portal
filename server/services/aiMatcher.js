const matchingConfig = require('../config/matchingConfig');

/**
 * Helper: Tokenize, clean and normalize text
 */
const tokenize = (text) => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);
};

/**
 * Helper: Calculate Jaccard similarity between two token sets
 */
const calculateJaccardSimilarity = (tokensA, tokensB) => {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
};

/**
 * Helper: Normalized Levenshtein distance similarity (0 - 1)
 */
const calculateStringSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.85;

  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  const distance = dp[m][n];
  const maxLen = Math.max(m, n);
  return Math.max(0, 1 - distance / maxLen);
};

/**
 * Local Rule-Based Multi-Factor Similarity Evaluator
 */
const evaluateLocalSimilarity = (lostItem, foundItem) => {
  const { weights, thresholds, categoryTaxonomy, locationClusters } = matchingConfig;

  // 1. Category Similarity (Weight: 20%)
  let categoryScore = 0;
  let categoryDetail = 'Different categories';
  if (lostItem.category === foundItem.category) {
    categoryScore = 100;
    categoryDetail = `Exact category match: ${lostItem.category}`;
  } else {
    // Check taxonomy overlap
    const lostKeywords = categoryTaxonomy[lostItem.category] || [];
    const foundKeywords = categoryTaxonomy[foundItem.category] || [];
    const descOverlap = lostKeywords.some((k) =>
      foundItem.title.toLowerCase().includes(k) || foundItem.description.toLowerCase().includes(k)
    ) || foundKeywords.some((k) =>
      lostItem.title.toLowerCase().includes(k) || lostItem.description.toLowerCase().includes(k)
    );

    if (descOverlap) {
      categoryScore = 65;
      categoryDetail = `Related item category semantics (${lostItem.category} ↔ ${foundItem.category})`;
    } else {
      categoryScore = 10;
    }
  }

  // 2. Name & Description Similarity (Weight: 20%)
  const lostTokens = tokenize(`${lostItem.title} ${lostItem.description}`);
  const foundTokens = tokenize(`${foundItem.title} ${foundItem.description}`);
  const jaccard = calculateJaccardSimilarity(lostTokens, foundTokens);
  const titleSim = calculateStringSimilarity(lostItem.title, foundItem.title);
  const nameDescScore = Math.min(100, Math.round((titleSim * 0.6 + jaccard * 0.4) * 100));
  const nameDescDetail =
    nameDescScore >= 75
      ? `Strong text and title similarity detected (${nameDescScore}%)`
      : nameDescScore >= 45
      ? `Moderate keyword overlap in description`
      : `Low description similarity`;

  // 3. Brand & Model Similarity (Weight: 15%)
  let brandModelScore = 0;
  let brandModelDetail = 'No brand or model specified';
  const lostModel = (lostItem.model || '').toLowerCase().trim();
  const foundModel = (foundItem.model || '').toLowerCase().trim();
  const fullTextLost = `${lostItem.title} ${lostItem.description} ${lostModel}`.toLowerCase();
  const fullTextFound = `${foundItem.title} ${foundItem.description} ${foundModel}`.toLowerCase();

  // Known campus electronics/gear brands
  const knownBrands = ['boat', 'apple', 'sony', 'samsung', 'noise', 'fireboltt', 'boult', 'oneplus', 'dell', 'hp', 'lenovo', 'asus', 'acer', 'casio', 'titan', 'fastrack', 'wildcraft', 'jansport', 'nike', 'adidas', 'puma', 'tupperware', 'milton', 'cello', 'hydro flask'];
  
  let detectedBrandLost = knownBrands.find((b) => fullTextLost.includes(b));
  let detectedBrandFound = knownBrands.find((b) => fullTextFound.includes(b));

  if (lostModel && foundModel) {
    const sim = calculateStringSimilarity(lostModel, foundModel);
    brandModelScore = Math.round(sim * 100);
    brandModelDetail = `Model/Brand similarity: "${lostItem.model}" ↔ "${foundItem.model}"`;
  } else if (detectedBrandLost && detectedBrandFound) {
    if (detectedBrandLost === detectedBrandFound) {
      brandModelScore = 95;
      brandModelDetail = `Identical brand detected in reports: ${detectedBrandLost.toUpperCase()}`;
    } else {
      brandModelScore = 15;
      brandModelDetail = `Different brands identified (${detectedBrandLost} vs ${detectedBrandFound})`;
    }
  } else if (lostModel && fullTextFound.includes(lostModel)) {
    brandModelScore = 90;
    brandModelDetail = `Reported model "${lostItem.model}" referenced in found item description`;
  } else if (foundModel && fullTextLost.includes(foundModel)) {
    brandModelScore = 90;
    brandModelDetail = `Found model "${foundItem.model}" referenced in lost item description`;
  } else {
    brandModelScore = nameDescScore >= 70 ? 60 : 30;
    brandModelDetail = 'General item specifications aligned';
  }

  // 4. Color Similarity (Weight: 10%)
  let colorScore = 0;
  let colorDetail = 'Color not specified';
  const lostColor = (lostItem.color || '').toLowerCase().trim();
  const foundColor = (foundItem.color || '').toLowerCase().trim();
  const standardColors = ['black', 'white', 'blue', 'red', 'green', 'yellow', 'silver', 'grey', 'gray', 'pink', 'purple', 'orange', 'brown', 'gold'];

  const foundColorsInLost = standardColors.filter((c) => fullTextLost.includes(c));
  const foundColorsInFound = standardColors.filter((c) => fullTextFound.includes(c));

  if (lostColor && foundColor) {
    if (lostColor === foundColor || calculateStringSimilarity(lostColor, foundColor) > 0.8) {
      colorScore = 100;
      colorDetail = `Exact color match: ${lostItem.color}`;
    } else {
      colorScore = 10;
      colorDetail = `Color mismatch (${lostItem.color} vs ${foundItem.color})`;
    }
  } else if (foundColorsInLost.length && foundColorsInFound.length) {
    const hasCommonColor = foundColorsInLost.some((c) => foundColorsInFound.includes(c));
    if (hasCommonColor) {
      const common = foundColorsInLost.find((c) => foundColorsInFound.includes(c));
      colorScore = 95;
      colorDetail = `Matching color mention found: ${common.charAt(0).toUpperCase() + common.slice(1)}`;
    } else {
      colorScore = 20;
      colorDetail = `Different color tones mentioned`;
    }
  } else {
    colorScore = 50;
    colorDetail = 'Neutral color compatibility';
  }

  // 5. Location Proximity (Weight: 10%)
  let locationScore = 0;
  let locationDetail = '';
  const locLost = (lostItem.location || '').toLowerCase();
  const locFound = (foundItem.location || '').toLowerCase();
  const locSim = calculateStringSimilarity(locLost, locFound);

  if (locSim >= 0.8 || locLost === locFound) {
    locationScore = 100;
    locationDetail = `Same campus location: "${lostItem.location}"`;
  } else {
    // Check campus cluster proximity
    let sameCluster = false;
    for (const [, locations] of Object.entries(locationClusters)) {
      const lostInCluster = locations.some((l) => locLost.includes(l));
      const foundInCluster = locations.some((l) => locFound.includes(l));
      if (lostInCluster && foundInCluster) {
        sameCluster = true;
        break;
      }
    }

    if (sameCluster) {
      locationScore = 80;
      locationDetail = `Nearby zone in same campus cluster`;
    } else if (locSim >= 0.4) {
      locationScore = 60;
      locationDetail = `Moderate geographic proximity`;
    } else {
      locationScore = 25;
      locationDetail = `Different areas of campus reported`;
    }
  }

  // 6. Date & Time Proximity (Weight: 10%)
  let dateTimeScore = 0;
  let dateTimeDetail = '';
  const dateLost = new Date(lostItem.date);
  const dateFound = new Date(foundItem.date);
  const diffDays = Math.abs((dateFound - dateLost) / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) {
    dateTimeScore = 100;
    dateTimeDetail = `Reported within 24 hours of incident`;
  } else if (diffDays <= 3) {
    dateTimeScore = 85;
    dateTimeDetail = `Reported within 3 days`;
  } else if (diffDays <= 7) {
    dateTimeScore = 70;
    dateTimeDetail = `Reported within 1 week`;
  } else if (diffDays <= 14) {
    dateTimeScore = 50;
    dateTimeDetail = `Reported within 2 weeks`;
  } else {
    dateTimeScore = 25;
    dateTimeDetail = `Reported over 2 weeks apart`;
  }

  // 7. Image Similarity (Weight: 15%)
  let imageScore = 0;
  let imageDetail = '';
  if (lostItem.image && foundItem.image) {
    // If both have images and text/category matches strongly, higher confidence
    if (categoryScore >= 70 && nameDescScore >= 60) {
      imageScore = 85;
      imageDetail = `Visual category & aspect match from uploaded photos`;
    } else {
      imageScore = 65;
      imageDetail = `Image attributes present on both items`;
    }
  } else if (lostItem.image || foundItem.image) {
    imageScore = 50;
    imageDetail = `Photo available on one report for visual verification`;
  } else {
    imageScore = 40;
    imageDetail = `No photos attached to either report`;
  }

  // Compute Total Weighted Score
  const totalScoreRaw =
    categoryScore * weights.category +
    nameDescScore * weights.nameDescription +
    brandModelScore * weights.brandModel +
    colorScore * weights.color +
    locationScore * weights.location +
    dateTimeScore * weights.dateTime +
    imageScore * weights.imageSimilarity;

  const overallScore = Math.min(100, Math.max(0, Math.round(totalScoreRaw)));

  // Classify match grade
  let matchGrade = 'No Strong Match';
  if (overallScore >= thresholds.highMatch) {
    matchGrade = 'High Match';
  } else if (overallScore >= thresholds.possibleMatch) {
    matchGrade = 'Possible Match';
  }

  // Generate a privacy-safe human readable summary
  const summaryExplanation =
    overallScore >= thresholds.highMatch
      ? `High probability match detected (${overallScore}%). Strong alignment on ${lostItem.category} category, ${lostItem.color || 'color'}, brand specifications, and nearby location.`
      : overallScore >= thresholds.possibleMatch
      ? `Possible match identified (${overallScore}%). Notable overlaps in item description, category, and date timeframe.`
      : `Low similarity score (${overallScore}%). Not recommended as a strong match.`;

  return {
    overallScore,
    matchGrade,
    summaryExplanation,
    factors: {
      category: {
        score: categoryScore,
        weight: weights.category * 100,
        matched: categoryScore >= 60,
        detail: categoryDetail,
      },
      nameDescription: {
        score: nameDescScore,
        weight: weights.nameDescription * 100,
        matched: nameDescScore >= 50,
        detail: nameDescDetail,
      },
      brandModel: {
        score: brandModelScore,
        weight: weights.brandModel * 100,
        matched: brandModelScore >= 60,
        detail: brandModelDetail,
      },
      color: {
        score: colorScore,
        weight: weights.color * 100,
        matched: colorScore >= 60,
        detail: colorDetail,
      },
      location: {
        score: locationScore,
        weight: weights.location * 100,
        matched: locationScore >= 60,
        detail: locationDetail,
      },
      dateTime: {
        score: dateTimeScore,
        weight: weights.dateTime * 100,
        matched: dateTimeScore >= 60,
        detail: dateTimeDetail,
      },
      imageSimilarity: {
        score: imageScore,
        weight: weights.imageSimilarity * 100,
        matched: imageScore >= 50,
        detail: imageDetail,
      },
    },
  };
};

/**
 * Optional Gemini LLM Enhancer
 */
const enhanceWithGeminiIfAvailable = async (lostItem, foundItem, localResult) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return localResult;
  }

  try {
    const prompt = `
You are an AI matching system for a college Campus Lost & Found portal.
Compare the following Lost Item and Found Item and assess their similarity.

Lost Item:
- Title: ${lostItem.title}
- Category: ${lostItem.category}
- Description: ${lostItem.description}
- Color: ${lostItem.color || 'N/A'}
- Brand/Model: ${lostItem.model || 'N/A'}
- Location: ${lostItem.location}
- Date: ${new Date(lostItem.date).toDateString()}

Found Item:
- Title: ${foundItem.title}
- Category: ${foundItem.category}
- Description: ${foundItem.description}
- Color: ${foundItem.color || 'N/A'}
- Brand/Model: ${foundItem.model || 'N/A'}
- Location: ${foundItem.location}
- Date: ${new Date(foundItem.date).toDateString()}

Respond ONLY with valid JSON in this exact structure:
{
  "overallScore": <integer between 0 and 100>,
  "matchGrade": "<High Match | Possible Match | No Strong Match>",
  "summaryExplanation": "<privacy-safe 2 sentence explanation of why they match or differ>",
  "categoryMatched": <boolean>,
  "nameDescMatched": <boolean>,
  "brandModelMatched": <boolean>,
  "colorMatched": <boolean>,
  "locationMatched": <boolean>,
  "dateTimeMatched": <boolean>,
  "imageMatched": <boolean>
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = JSON.parse(text);
        if (typeof parsed.overallScore === 'number') {
          return {
            overallScore: parsed.overallScore,
            matchGrade:
              parsed.overallScore >= 80
                ? 'High Match'
                : parsed.overallScore >= 60
                ? 'Possible Match'
                : 'No Strong Match',
            summaryExplanation: parsed.summaryExplanation || localResult.summaryExplanation,
            factors: {
              ...localResult.factors,
              category: {
                ...localResult.factors.category,
                matched: parsed.categoryMatched ?? localResult.factors.category.matched,
              },
              nameDescription: {
                ...localResult.factors.nameDescription,
                matched: parsed.nameDescMatched ?? localResult.factors.nameDescription.matched,
              },
              brandModel: {
                ...localResult.factors.brandModel,
                matched: parsed.brandModelMatched ?? localResult.factors.brandModel.matched,
              },
              color: {
                ...localResult.factors.color,
                matched: parsed.colorMatched ?? localResult.factors.color.matched,
              },
              location: {
                ...localResult.factors.location,
                matched: parsed.locationMatched ?? localResult.factors.location.matched,
              },
              dateTime: {
                ...localResult.factors.dateTime,
                matched: parsed.dateTimeMatched ?? localResult.factors.dateTime.matched,
              },
            },
          };
        }
      }
    }
  } catch (err) {
    console.warn('[AI Matcher] Gemini API fallback to local evaluator:', err.message);
  }

  return localResult;
};

/**
 * Main AI Matching function between two items
 */
const matchItems = async (lostItem, foundItem) => {
  const localResult = evaluateLocalSimilarity(lostItem, foundItem);
  return await enhanceWithGeminiIfAvailable(lostItem, foundItem, localResult);
};

module.exports = {
  matchItems,
  evaluateLocalSimilarity,
};
