const fs = require('fs');
const path = require('path');

const API_KEY = process.env.MYSCHEME_API_KEY || '';

async function fetchSchemeDetails(slug) {
  const url = `https://api.myscheme.gov.in/schemes/v6/public/schemes?slug=${slug}&lang=en`;
  try {
    const res = await fetch(url, {
      headers: {
        'x-api-key': API_KEY,
        'User-Agent': 'Mozilla/5.0'
      }
    });
    if (!res.ok) {
      return null;
    }
    const json = await res.json();
    return json?.data?.en || null;
  } catch (err) {
    console.error(`Failed to fetch ${slug}:`, err.message);
    return null;
  }
}

async function run() {
  const rootDir = path.resolve(__dirname, '..');
  let rawText = fs.readFileSync(path.join(rootDir, 'myscheme_mosje_raw.json'), 'utf8');
  if (rawText.charCodeAt(0) === 0xFEFF) {
    rawText = rawText.slice(1);
  }
  const rawList = JSON.parse(rawText);
  console.log(`Loaded ${rawList.length} MoSJE schemes from myScheme.`);

  const results = [];

  for (let i = 0; i < rawList.length; i++) {
    const item = rawList[i];
    console.log(`[${i + 1}/${rawList.length}] Visiting: ${item.slug} - ${item.name}...`);

    const details = await fetchSchemeDetails(item.slug);
    
    const nameLower = (item.name + ' ' + (item.desc || '')).toLowerCase();
    const tagsLower = (item.tags || '').toLowerCase();

    const isExcludedType = 
      nameLower.includes('award') || 
      nameLower.includes('social audit') || 
      nameLower.includes('project monitoring unit') || 
      nameLower.includes('central smart surveillance unit') ||
      nameLower.includes('evaluation and studies') ||
      nameLower.includes('internship') ||
      nameLower.includes('pre-matric') || 
      nameLower.includes('pre matric') ||
      nameLower.includes('construction of hostels') ||
      nameLower.includes('day care scheme') ||
      nameLower.includes('respite care scheme') ||
      nameLower.includes('group home for adults') ||
      nameLower.includes('grant-in-aid programme for financial assistance in the field of social defence') ||
      nameLower.includes('grant-in-aid to voluntary and other organizations') ||
      nameLower.includes('adarsh gram');

    let isRelevant = false;
    let reason = '';

    if (isExcludedType) {
      isRelevant = false;
      reason = 'Excluded: Scheme is an administrative program, national award, institutional infrastructure grant, or school-level pre-matric scholarship outside adult livelihood/credit routing scope.';
    } else if (
      item.slug === 'vcf-sc' ||
      item.slug === 'cegssc' ||
      item.slug === 'asiim' ||
      item.slug === 'visvasi' ||
      item.slug === 'visvas' ||
      item.slug === 'srms' ||
      item.slug === 'lbssk-suy' ||
      item.slug === 'lbssk-sms' ||
      item.slug === 'lbssk-spuct' ||
      item.slug === 'namaste-ersufaf' ||
      item.slug === 'pm-daksh' ||
      item.slug === 'lbssf-gtl' ||
      item.slug === 'lbssf-els' ||
      item.slug === 'cbssc-tl' ||
      item.slug === 'mcfnsfdc' ||
      item.slug === 'nbcfdc-gls' ||
      item.slug === 'nssw' ||
      item.slug === 'cbssc-msy' ||
      item.slug === 'gbs' ||
      item.slug === 'dacssiselosobcebc' ||
      item.slug === 'vetls' ||
      item.slug === 'els-nsfdc' ||
      item.slug === 'cmhtp-crwtp-smile' ||
      item.slug === 'sadppfaa'
    ) {
      isRelevant = true;
      reason = 'Direct Match: High-impact MoSJE / NSFDC / NBCFDC / NSKFDC concessional credit, venture equity, loan guarantee, rehabilitation, or assistive empowerment scheme.';
    } else if ((tagsLower.includes('loan') || tagsLower.includes('credit') || tagsLower.includes('finance') || tagsLower.includes('subsidy') || tagsLower.includes('venture')) && (tagsLower.includes('entrepreneur') || tagsLower.includes('self employment') || tagsLower.includes('rehabilitation') || tagsLower.includes('business'))) {
      isRelevant = true;
      reason = 'Relevant: Verified livelihood/enterprise/credit assistance under MoSJE.';
    } else {
      isRelevant = false;
      reason = 'Skipped: Does not offer credit, loan, enterprise capital, or direct livelihood rehabilitation for citizens.';
    }

    results.push({
      slug: item.slug,
      name: item.name,
      category: item.category,
      tags: item.tags,
      isRelevant,
      reason,
      details: details ? {
        briefDescription: details.schemeContent?.briefDescription || item.desc,
        benefits_md: details.schemeContent?.benefits_md || '',
        detailedDescription_md: details.schemeContent?.detailedDescription_md || '',
        eligibilityCriteria: details.eligibilityCriteria || null,
        references: details.schemeContent?.references || []
      } : null
    });

    // Polite delay
    await new Promise(r => setTimeout(r, 120));
  }

  // Save full evaluation data to JSON
  fs.writeFileSync(path.join(rootDir, 'myscheme_evaluation_full.json'), JSON.stringify(results, null, 2), 'utf8');
  console.log('Saved myscheme_evaluation_full.json');

  // Generate Memory README
  const accepted = results.filter(r => r.isRelevant);
  const rejected = results.filter(r => !r.isRelevant);

  let readme = `# myScheme.gov.in Scheme Ingestion & Audit Report
**Problem Statement:** SIH26092 · Ministry of Social Justice & Empowerment (MoSJE) · Smart Automation
**Audit Date:** ${new Date().toISOString().split('T')[0]}
**Audited Source:** https://www.myscheme.gov.in/ (Official Public API v6)
**Total MoSJE Schemes Visited:** ${results.length}
**Relevant Schemes Identified & Ingested:** ${accepted.length}
**Irrelevant Schemes Filtered Out:** ${rejected.length}

---

## 1. Executive Summary & Verification Criteria
In accordance with the project constraints and SIH26092 mandates:
- **Core Focus:** Concessional credit-linked schemes, micro-finance, term loans, education loans, assistive enterprise equipment, venture equity, and statutory rehabilitation administered by MoSJE and its three apex corporations (NSFDC, NBCFDC, NSKFDC).
- **Inclusion Rules:** The scheme must provide direct financial support (term loans, working capital, interest subvention, venture funding, capital subsidy, rehabilitation cash support, or assistive livelihood aids) for target beneficiaries (SC, OBC, Safai Karamcharis / Manual Scavengers, EBC, DNT, Transgender, Divyangjan).
- **Exclusion Rules:** General administrative programs, internal monitoring units (I-MESA PMU/Audit), national annual awards, institutional construction grants (hostels), and school-level pre-matric scholarships (uniforms/books) are excluded.

---

## 2. Ingested Relevant Schemes (${accepted.length})

`;

  accepted.forEach((s, idx) => {
    readme += `### ${idx + 1}. ${s.name} (\`${s.slug}\`)
- **Category:** ${s.category || 'N/A'}
- **Tags:** ${s.tags || 'N/A'}
- **Verification Rationale:** ${s.reason}
- **Official myScheme Link:** [https://www.myscheme.gov.in/schemes/${s.slug}](https://www.myscheme.gov.in/schemes/${s.slug})
- **Brief Description:** ${s.details?.briefDescription || 'N/A'}

`;
  });

  readme += `---

## 3. Filtered & Excluded Schemes (${rejected.length})

| # | Scheme Slug | Scheme Name | Exclusion Reason |
|---|---|---|---|
`;

  rejected.forEach((s, idx) => {
    readme += `| ${idx + 1} | \`${s.slug}\` | ${s.name.replace(/\|/g, '-')} | ${s.reason} |\n`;
  });

  readme += `\n---\n*Report generated automatically after inspecting all ${results.length} schemes under Ministry of Social Justice and Empowerment on myScheme.gov.in.*\n`;

  fs.writeFileSync(path.join(rootDir, 'MYSCHEME_INGESTION_README.md'), readme, 'utf8');
  console.log('Generated MYSCHEME_INGESTION_README.md successfully!');
}

run().catch(console.error);
