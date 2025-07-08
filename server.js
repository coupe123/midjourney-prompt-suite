const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// In-memory storage for demo
let promptHistory = [];
let savedPresets = [];
let templates = [
  { id: 1, category: 'Warcore Realism', prompt: 'A solitary figure in military gear standing in abandoned ruins, moody overcast lighting, gritty realism' },
  { id: 2, category: 'Kodak Photo Style', prompt: 'A high-definition Kodak photo of weathered boots partially submerged in a puddle of red liquid, dim moody lighting, dark muted tones, PNG format' },
  { id: 3, category: 'Sailor Jerry Tattoo', prompt: 'A vintage American traditional tattoo flash illustration of an anchor with roses, bold lines and flat colors, vibrant pastel colors, kraft paper background' },
  { id: 4, category: 'Religious Warcore', prompt: 'Jesus stands in a dusty battlefield, weathered robes flowing, gripping a tactical rifle across his chest, golden light breaking through smoke behind him, crown of thorns casting shadows, red liquid stains the ground, cinematic warcore style with sacred iconography' },
  { id: 5, category: 'Sacred Military', prompt: 'The Virgin Mary stands at the edge of a scorched city, her blue veil flowing over body armor, holding a sniper rifle close, the barrel etched with gold roses, eyes steady and sorrowful, watching from a cathedral rooftop as smoke rolls across the skyline' }
];

// Advanced mock AI functions
const enhancePrompt = async (prompt, preset = 'none', tier = 'full', parameters = {}) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  let enhanced = prompt;
  
  // Apply style presets
  switch (preset) {
    case 'warcore':
      enhanced = enhanced.replace(/beautiful/gi, 'battle-worn')
                        .replace(/peaceful/gi, 'tense')
                        .replace(/bright/gi, 'harsh');
      enhanced += ', gritty realism, weathered textures, military aesthetic, desaturated colors';
      break;
    case 'photographic':
      enhanced = `A high-definition photograph of ${enhanced}, professional lighting, sharp focus, detailed textures, realistic composition`;
      break;
    case 'cinematic':
      enhanced += ', cinematic composition, dramatic lighting, film grain, anamorphic lens, color grading';
      break;
    case 'artistic':
      enhanced += ', painterly style, artistic interpretation, gallery quality, expressive brushwork';
      break;
    case 'experimental':
      enhanced += ', experimental techniques, avant-garde approach, unconventional composition, abstract elements';
      break;
    default:
      if (enhanced.length < 50) {
        enhanced += ', highly detailed, professional quality, cinematic composition';
      }
  }
  
  // Apply rewrite tiers
  switch (tier) {
    case 'quick':
      // Light enhancement
      break;
    case 'full':
      enhanced = enhanced.replace(/big/gi, 'massive')
                        .replace(/small/gi, 'intricate')
                        .replace(/dark/gi, 'dramatically shadowed')
                        .replace(/bright/gi, 'luminously lit');
      break;
    case 'remix':
      enhanced += ', creative reinterpretation, artistic liberty, enhanced visual narrative';
      break;
  }
  
  // Add parameters
  const enabledParams = [];
  if (parameters.v && parameters.v.enabled) enabledParams.push(`--v ${parameters.v.value}`);
  if (parameters.styleRaw && parameters.styleRaw.enabled) enabledParams.push('--style raw');
  if (parameters.s && parameters.s.enabled) enabledParams.push(`--s ${parameters.s.value}`);
  if (parameters.ar && parameters.ar.enabled) enabledParams.push(`--ar ${parameters.ar.value}`);
  
  if (enabledParams.length > 0) {
    enhanced += ` ${enabledParams.join(' ')}`;
  } else if (!enhanced.includes('--')) {
    enhanced += ' --ar 16:9 --v 6';
  }
  
  return enhanced;
};

const calculateQualityScore = (prompt) => {
  let score = 50; // Base score
  
  // Length bonus
  if (prompt.length > 100) score += 15;
  else if (prompt.length > 50) score += 10;
  
  // Descriptive words bonus
  const descriptiveWords = ['detailed', 'cinematic', 'professional', 'realistic', 'dramatic', 'atmospheric'];
  descriptiveWords.forEach(word => {
    if (prompt.toLowerCase().includes(word)) score += 5;
  });
  
  // Parameter bonus
  if (prompt.includes('--')) score += 10;
  
  // Specificity bonus
  const specificWords = ['lighting', 'composition', 'color', 'texture', 'mood'];
  specificWords.forEach(word => {
    if (prompt.toLowerCase().includes(word)) score += 3;
  });
  
  return Math.min(100, Math.max(1, score));
};

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    features: ['enhancement', 'moderation', 'batch', 'quality_scoring', 'templates', 'history']
  });
});

app.post('/api/claude/complete', async (req, res) => {
  try {
    const { prompt, preset = 'none', tier = 'full', parameters = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const enhanced = await enhancePrompt(prompt, preset, tier, parameters);
    const qualityScore = calculateQualityScore(enhanced);
    
    // Add to history
    const historyEntry = {
      original: prompt,
      enhanced: enhanced,
      timestamp: new Date().toISOString(),
      preset: preset,
      tier: tier,
      qualityScore: qualityScore
    };
    
    promptHistory.unshift(historyEntry);
    if (promptHistory.length > 50) promptHistory = promptHistory.slice(0, 50);
    
    res.json({ 
      enhanced,
      originalLength: prompt.length,
      enhancedLength: enhanced.length,
      qualityScore: qualityScore,
      processingTime: Math.random() * 2 + 1,
      suggestions: [
        'Add dramatic lighting',
        'Include environmental details', 
        'Specify camera angle',
        'Add color palette info'
      ]
    });

  } catch (error) {
    console.error('Enhancement error:', error);
    res.status(500).json({ error: 'Enhancement failed' });
  }
});

app.post('/api/moderation/fix', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const rewrites = [
      prompt.replace(/blood/gi, 'red liquid')
           .replace(/nude|naked/gi, 'partially covered')
           .replace(/sex|sexual/gi, ''),
      prompt.replace(/blood/gi, 'crimson stains')
           .replace(/nude|naked/gi, 'draped in fabric')
           .replace(/sex|sexual/gi, ''),
      prompt.replace(/blood/gi, 'red markings')
           .replace(/nude|naked/gi, 'veiled figure')
           .replace(/sex|sexual/gi, '')
    ].filter(r => r.trim());

    res.json({
      rewrites,
      flagged_reason: 'content_policy',
      changes_made: 'Replaced sensitive terms with PG-13 alternatives',
      original_prompt: prompt
    });

  } catch (error) {
    res.status(500).json({ error: 'Moderation fix failed' });
  }
});

app.post('/api/batch/process', async (req, res) => {
  try {
    const { prompts, settings = {} } = req.body;
    
    if (!Array.isArray(prompts)) {
      return res.status(400).json({ error: 'Prompts array required' });
    }

    const results = [];
    
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      if (prompt.trim()) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const enhanced = await enhancePrompt(prompt, settings.preset, settings.tier);
        results.push({
          original: prompt,
          enhanced: enhanced,
          index: i,
          timestamp: new Date().toISOString()
        });
      }
    }

    res.json({
      results,
      totalProcessed: results.length,
      processingTime: results.length * 0.3
    });

  } catch (error) {
    res.status(500).json({ error: 'Batch processing failed' });
  }
});

app.get('/api/templates', (req, res) => {
  res.json(templates);
});

app.post('/api/templates', (req, res) => {
  const { category, prompt } = req.body;
  if (!category || !prompt) {
    return res.status(400).json({ error: 'Category and prompt required' });
  }
  
  const newTemplate = {
    id: Date.now(),
    category,
    prompt,
    timestamp: new Date().toISOString()
  };
  
  templates.push(newTemplate);
  res.json(newTemplate);
});

app.delete('/api/templates/:id', (req, res) => {
  const id = parseInt(req.params.id);
  templates = templates.filter(t => t.id !== id);
  res.json({ success: true });
});

app.get('/api/history', (req, res) => {
  res.json(promptHistory.slice(0, 20));
});

app.delete('/api/history', (req, res) => {
  promptHistory = [];
  res.json({ success: true });
});

app.get('/api/presets', (req, res) => {
  res.json(savedPresets);
});

app.post('/api/presets', (req, res) => {
  const preset = {
    id: Date.now(),
    ...req.body,
    timestamp: new Date().toISOString()
  };
  savedPresets.push(preset);
  res.json(preset);
});

// Serve the main HTML
app.get('/', (req, res) => {
  const html = '<!DOCTYPE html>' +
    '<html lang="en">' +
    '<head>' +
    '  <meta charset="UTF-8">' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '  <title>Midjourney Prompt Tool Suite</title>' +
    '  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>' +
    '  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>' +
    '  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>' +
    '  <script src="https://unpkg.com/lucide-react@0.263.1/dist/umd/lucide-react.js"></script>' +
    '  <script src="https://cdn.tailwindcss.com"></script>' +
    '  <style>' +
    '    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif; }' +
    '  </style>' +
    '</head>' +
    '<body>' +
    '  <div id="root"></div>' +
    '  <script type="text/babel" src="/app.js"></script>' +
    '</body>' +
    '</html>';
  
  res.send(html);
});

// Serve the React component
app.get('/app.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  
  const jsCode = 'const { useState, useEffect, useRef } = React;\n' +
    'const { Wand2, Copy, Sparkles, RefreshCw, History, Palette, Sliders, Settings, Save, RotateCcw, Edit3, Trash2, Plus, MessageCircle, Upload, Download, Check, Info, BarChart3, Target, Shuffle, Grid, Layers } = lucideReact;\n\n' +
    'window.claude = {\n' +
    '  complete: async (prompt) => {\n' +
    '    const response = await fetch("/api/claude/complete", {\n' +
    '      method: "POST",\n' +
    '      headers: { "Content-Type": "application/json" },\n' +
    '      body: JSON.stringify({ prompt })\n' +
    '    });\n' +
    '    const data = await response.json();\n' +
    '    return data.enhanced;\n' +
    '  }\n' +
    '};\n\n' +
    'function MidjourneyPromptSuite() {\n' +
    '  const [activeMainTab, setActiveMainTab] = useState("enhance");\n' +
    '  const [inputPrompt, setInputPrompt] = useState("");\n' +
    '  const [enhancedPrompt, setEnhancedPrompt] = useState("");\n' +
    '  const [isEnhancing, setIsEnhancing] = useState(false);\n' +
    '  const [copySuccess, setCopySuccess] = useState("");\n' +
    '  const [selectedPreset, setSelectedPreset] = useState("none");\n' +
    '  const [rewriteTier, setRewriteTier] = useState("full");\n' +
    '  const [qualityScore, setQualityScore] = useState(null);\n' +
    '  const [templates, setTemplates] = useState([]);\n' +
    '  const [promptHistory, setPromptHistory] = useState([]);\n' +
    '  const [batchPrompts, setBatchPrompts] = useState([""]);\n' +
    '  const [batchResults, setBatchResults] = useState([]);\n' +
    '  const [isBatchProcessing, setIsBatchProcessing] = useState(false);\n' +
    '  const [showModerationError, setShowModerationError] = useState(false);\n' +
    '  const [moderationRewrites, setModerationRewrites] = useState([]);\n' +
    '  const [isFixingModeration, setIsFixingModeration] = useState(false);\n' +
    '  const [parameters, setParameters] = useState({\n' +
    '    v: { enabled: false, value: 6 },\n' +
    '    styleRaw: { enabled: false, value: true },\n' +
    '    s: { enabled: false, value: 100 },\n' +
    '    ar: { enabled: false, value: "16:9" }\n' +
    '  });\n\n' +
    '  useEffect(() => {\n' +
    '    fetch("/api/templates").then(res => res.json()).then(setTemplates).catch(console.error);\n' +
    '    fetch("/api/history").then(res => res.json()).then(setPromptHistory).catch(console.error);\n' +
    '  }, []);\n\n' +
    '  const mainTabs = [\n' +
    '    { id: "enhance", label: "Enhance", icon: Wand2 },\n' +
    '    { id: "poweruser", label: "Power User", icon: Settings },\n' +
    '    { id: "analyze", label: "Analyze", icon: BarChart3 },\n' +
    '    { id: "templates", label: "Templates", icon: Palette }\n' +
    '  ];\n\n' +
    '  const rewritePresets = [\n' +
    '    { id: "none", name: "⚪ Standard Enhancement", description: "Clean, professional enhancement" },\n' +
    '    { id: "warcore", name: "⚔️ Warcore Realism", description: "Military tone, distressed atmospheres" },\n' +
    '    { id: "cinematic", name: "🎞️ Neo-Cinematic", description: "Rich contrast, cinematic lensing" },\n' +
    '    { id: "photographic", name: "📸 Photorealistic", description: "High-definition, sharp details" },\n' +
    '    { id: "artistic", name: "🎨 Artistic Style", description: "Painterly, creative interpretation" },\n' +
    '    { id: "experimental", name: "🧪 Experimental", description: "Bold, unconventional approaches" }\n' +
    '  ];\n\n' +
    '  const rewriteTiers = [\n' +
    '    { id: "quick", name: "🟢 Quick Enhance", description: "Light polish, keeps structure" },\n' +
    '    { id: "full", name: "🟡 Full Rewrite", description: "Complete professional rebuild" },\n' +
    '    { id: "remix", name: "🔴 Creative Remix", description: "Creative reinterpretation" }\n' +
    '  ];\n\n' +
    '  const enhancePrompt = async () => {\n' +
    '    if (!inputPrompt.trim()) return;\n' +
    '    setIsEnhancing(true);\n' +
    '    try {\n' +
    '      const response = await fetch("/api/claude/complete", {\n' +
    '        method: "POST",\n' +
    '        headers: { "Content-Type": "application/json" },\n' +
    '        body: JSON.stringify({ prompt: inputPrompt, preset: selectedPreset, tier: rewriteTier, parameters: parameters })\n' +
    '      });\n' +
    '      const data = await response.json();\n' +
    '      setEnhancedPrompt(data.enhanced);\n' +
    '      setQualityScore(data.qualityScore);\n' +
    '      fetch("/api/history").then(res => res.json()).then(setPromptHistory).catch(console.error);\n' +
    '    } catch (error) {\n' +
    '      setEnhancedPrompt("Enhancement failed. Please try again.");\n' +
    '    }\n' +
    '    setIsEnhancing(false);\n' +
    '  };\n\n' +
    '  const copyToClipboard = async (text, source = "prompt") => {\n' +
    '    try {\n' +
    '      await navigator.clipboard.writeText(text);\n' +
    '      setCopySuccess(source);\n' +
    '      setTimeout(() => setCopySuccess(""), 2000);\n' +
    '    } catch (err) {\n' +
    '      console.error("Copy failed:", err);\n' +
    '    }\n' +
    '  };\n\n' +
    '  const fixModerationError = async () => {\n' +
    '    if (!inputPrompt.trim()) return;\n' +
    '    setIsFixingModeration(true);\n' +
    '    try {\n' +
    '      const response = await fetch("/api/moderation/fix", {\n' +
    '        method: "POST",\n' +
    '        headers: { "Content-Type": "application/json" },\n' +
    '        body: JSON.stringify({ prompt: inputPrompt })\n' +
    '      });\n' +
    '      const data = await response.json();\n' +
    '      setModerationRewrites(data.rewrites);\n' +
    '    } catch (error) {\n' +
    '      setModerationRewrites(["Error generating alternatives"]);\n' +
    '    }\n' +
    '    setIsFixingModeration(false);\n' +
    '  };\n\n' +
    '  const loadTemplate = (template) => { setInputPrompt(template.prompt); setActiveMainTab("enhance"); };\n\n' +
    '  return React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4" },\n' +
    '    React.createElement("div", { className: "max-w-6xl mx-auto" },\n' +
    '      React.createElement("div", { className: "text-center mb-6 pt-6" },\n' +
    '        React.createElement("div", { className: "flex items-center justify-center mb-3" },\n' +
    '          React.createElement("div", { className: "bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl" },\n' +
    '            React.createElement(Wand2, { className: "w-7 h-7 text-white" })\n' +
    '          )\n' +
    '        ),\n' +
    '        React.createElement("h1", { className: "text-3xl font-bold text-white mb-1" }, "Midjourney Prompt Tool Suite"),\n' +
    '        React.createElement("p", { className: "text-slate-300 text-sm" }, "Professional AI-powered prompt enhancement and optimization")\n' +
    '      ),\n' +
    '      React.createElement("div", { className: "bg-slate-800/60 rounded-xl p-2 border border-slate-600 mb-6" },\n' +
    '        React.createElement("div", { className: "flex gap-1" },\n' +
    '          mainTabs.map((tab) =>\n' +
    '            React.createElement("button", {\n' +
    '              key: tab.id,\n' +
    '              onClick: () => setActiveMainTab(tab.id),\n' +
    '              className: "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all " + (activeMainTab === tab.id ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700/50")\n' +
    '            },\n' +
    '              React.createElement(tab.icon, { className: "w-4 h-4" }),\n' +
    '              tab.label\n' +
    '            )\n' +
    '          )\n' +
    '        )\n' +
    '      ),\n' +
    '      activeMainTab === "enhance" && React.createElement("div", { className: "space-y-6" },\n' +
    '        React.createElement("div", { className: "bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50" },\n' +
    '          React.createElement("label", { className: "block text-slate-300 text-sm font-medium mb-3" }, "Enhancement Mode"),\n' +
    '          React.createElement("div", { className: "grid grid-cols-3 gap-3" },\n' +
    '            rewriteTiers.map((tier) =>\n' +
    '              React.createElement("button", {\n' +
    '                key: tier.id,\n' +
    '                onClick: () => setRewriteTier(tier.id),\n' +
    '                className: "flex flex-col items-center p-4 rounded-xl text-center transition-all " + (rewriteTier === tier.id ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50")\n' +
    '              },\n' +
    '                React.createElement("span", { className: "text-lg mb-1" }, tier.name.split(" ")[0]),\n' +
    '                React.createElement("div", { className: "text-xs font-medium" }, tier.name.substring(2)),\n' +
    '                React.createElement("div", { className: "text-xs opacity-75 mt-1" }, tier.description)\n' +
    '              )\n' +
    '            )\n' +
    '          )\n' +
    '        ),\n' +
    '        React.createElement("div", { className: "bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50" },\n' +
    '          React.createElement("label", { className: "block text-slate-300 text-sm font-medium mb-3" }, "Your Prompt"),\n' +
    '          React.createElement("textarea", {\n' +
    '            value: inputPrompt,\n' +
    '            onChange: (e) => setInputPrompt(e.target.value),\n' +
    '            placeholder: "Enter your basic Midjourney prompt here...",\n' +
    '            className: "w-full h-32 bg-slate-700/50 border border-slate-600 rounded-2xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"\n' +
    '          })\n' +
    '        ),\n' +
    '        React.createElement("div", { className: "bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50" },\n' +
    '          React.createElement("label", { className: "block text-slate-300 text-sm font-medium mb-4" }, "Style Presets"),\n' +
    '          React.createElement("div", { className: "grid grid-cols-2 lg:grid-cols-3 gap-3" },\n' +
    '            rewritePresets.map((preset) =>\n' +
    '              React.createElement("button", {\n' +
    '                key: preset.id,\n' +
    '                onClick: () => setSelectedPreset(preset.id),\n' +
    '                className: "flex items-start gap-3 p-4 rounded-xl text-left transition-all " + (selectedPreset === preset.id ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50")\n' +
    '              },\n' +
    '                React.createElement("span", { className: "text-xl" }, preset.name.split(" ")[0]),\n' +
    '                React.createElement("div", { className: "flex-1" },\n' +
    '                  React.createElement("div", { className: "font-medium text-sm" }, preset.name.substring(2)),\n' +
    '                  React.createElement("div", { className: "text-xs opacity-75 mt-1" }, preset.description)\n' +
    '                )\n' +
    '              )\n' +
    '            )\n' +
    '          )\n' +
    '        ),\n' +
    '        React.createElement("button", {\n' +
    '          onClick: enhancePrompt,\n' +
    '          disabled: !inputPrompt.trim() || isEnhancing,\n' +
    '          className: "w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 text-lg"\n' +
    '        },\n' +
    '          isEnhancing ? [\n' +
    '            React.createElement(RefreshCw, { key: "icon", className: "w-6 h-6 animate-spin" }),\n' +
    '            "Enhancing..."\n' +
    '          ] : [\n' +
    '            React.createElement(Sparkles, { key: "icon", className: "w-6 h-6" }),\n' +
    '            "Enhance Prompt"\n' +
    '          ]\n' +
    '        ),\n' +
    '        enhancedPrompt && React.createElement("div", { className: "bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50" },\n' +
    '          React.createElement("div", { className: "flex items-center justify-between mb-3" },\n' +
    '            React.createElement("div", { className: "flex items-center gap-3" },\n' +
    '              React.createElement("label", { className: "text-slate-300 text-sm font-medium" }, "Enhanced Prompt"),\n' +
    '              qualityScore && React.createElement("span", {\n' +
    '                className: "px-2 py-1 rounded-lg text-xs font-bold " + (qualityScore >= 80 ? "bg-green-600" : qualityScore >= 60 ? "bg-yellow-600" : "bg-red-600")
              }, "Quality: " + qualityScore + "%")
            ),
            React.createElement("div", { className: "flex gap-2" },
              React.createElement("button", {
                onClick: () => setShowModerationError(true),
                className: "flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-2 px-3 rounded-xl transition-colors"
              }, "⚠️ Fix Moderation"),
              React.createElement("button", {
                onClick: () => copyToClipboard(enhancedPrompt, "enhanced"),
                className: "flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-2 px-3 rounded-xl transition-colors"
              },
                React.createElement(Copy, { className: "w-3 h-3" }),
                copySuccess === "enhanced" ? "Copied!" : "Copy"
              )
            )
          ),
          React.createElement("div", { className: "bg-slate-700/50 border border-slate-600 rounded-2xl p-4" },
            React.createElement("p", { className: "text-white text-sm leading-relaxed" }, enhancedPrompt)
          )
        )
      ),
      activeMainTab === "templates" && React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50" },
          React.createElement("h3", { className: "text-xl font-bold text-white mb-4 flex items-center gap-2" },
            React.createElement(Palette, { className: "w-5 h-5" }),
            "Prompt Templates"
          ),
          React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4" },
            templates.map((template) =>
              React.createElement("div", { key: template.id, className: "bg-slate-700/30 rounded-lg p-4" },
                React.createElement("div", { className: "flex items-center justify-between mb-2" },
                  React.createElement("h5", { className: "text-white font-medium text-sm" }, template.category),
                  React.createElement("button", {
                    onClick: () => loadTemplate(template),
                    className: "bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-1 px-3 rounded-lg transition-all"
                  }, "Use Template")
                ),
                React.createElement("p", { className: "text-slate-300 text-sm" }, template.prompt)
              )
            )
          )
        )
      ),
      showModerationError && React.createElement("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" },
        React.createElement("div", { className: "bg-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-red-500/30" },
          React.createElement("div", { className: "flex items-center gap-3 mb-4" },
            React.createElement("div", { className: "bg-red-500 p-2 rounded-lg" },
              React.createElement("span", { className: "text-white text-lg" }, "⚠️")
            ),
            React.createElement("div", null,
              React.createElement("h3", { className: "text-red-400 font-medium" }, "Moderation Error Detected"),
              React.createElement("p", { className: "text-red-300 text-sm" }, "Generate safe alternatives for your prompt")
            )
          ),
          React.createElement("div", { className: "bg-slate-700/50 rounded-2xl p-4 mb-4" },
            React.createElement("p", { className: "text-slate-300 text-sm mb-2" }, "Original prompt:"),
            React.createElement("p", { className: "text-white text-sm font-mono bg-slate-800/50 rounded-lg p-3" }, inputPrompt)
          ),
          moderationRewrites.length === 0 ? React.createElement("button", {
            onClick: fixModerationError,
            disabled: isFixingModeration,
            className: "w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium py-3 px-6 rounded-2xl transition-all flex items-center justify-center gap-2"
          },
            isFixingModeration ? [
              React.createElement(RefreshCw, { key: "icon", className: "w-5 h-5 animate-spin" }),
              "Generating Safe Alternatives..."
            ] : "⚠️ Generate Safe Alternatives"
          ) : React.createElement("div", { className: "space-y-4" },
            React.createElement("div", { className: "space-y-3" },
              moderationRewrites.map((rewrite, index) =>
                React.createElement("div", { key: index, className: "bg-slate-700/30 rounded-2xl p-4 border border-slate-600/50" },
                  React.createElement("p", { className: "text-white text-sm mb-3" }, rewrite),
                  React.createElement("div", { className: "flex gap-2" },
                    React.createElement("button", {
                      onClick: () => {
                        setInputPrompt(rewrite);
                        setShowModerationError(false);
                        setActiveMainTab("enhance");
                      },
                      className: "flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-2 px-3 rounded-xl transition-colors"
                    }, "👍 Use This"),
                    React.createElement("button", {
                      onClick: () => copyToClipboard(rewrite, "mod-" + index),
                      className: "flex items-center gap-1 bg-slate-600 hover:bg-slate-700 text-white text-xs font-medium py-2 px-3 rounded-xl transition-colors"
                    },
                      React.createElement(Copy, { className: "w-3 h-3" }),
                      copySuccess === ("mod-" + index) ? "Copied!" : "Copy"
                    )
                  )
                )
              )
            ),
            React.createElement("div", { className: "flex gap-2 pt-3 border-t border-slate-600/30" },
              React.createElement("button", {
                onClick: fixModerationError,
                className: "flex items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 px-4 rounded-xl transition-colors"
              }, "🔄 Generate More"),
              React.createElement("button", {
                onClick: () => setShowModerationError(false),
                className: "flex items-center gap-1 bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium py-2 px-4 rounded-xl transition-colors"
              }, "Close")
            )
          )
        )
      ),
      React.createElement("div", { className: "text-center mt-8 pb-8" },
        React.createElement("p", { className: "text-slate-400 text-xs" }, "Midjourney Prompt Tool Suite • Professional AI Enhancement Platform")
      )
    )
  );
}

ReactDOM.render(React.createElement(MidjourneyPromptSuite), document.getElementById("root"));';
  
  res.send(jsCode);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🎨 Midjourney Prompt Tool Suite ready!`);
  console.log(`✨ Features: Enhancement, Moderation, Batch Processing, Quality Scoring, Templates, History`);
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});
