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
  if (parameters.v?.enabled) enabledParams.push(`--v ${parameters.v.value}`);
  if (parameters.styleRaw?.enabled) enabledParams.push('--style raw');
  if (parameters.s?.enabled) enabledParams.push(`--s ${parameters.s.value}`);
  if (parameters.ar?.enabled) enabledParams.push(`--ar ${parameters.ar.value}`);
  
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

// Serve the full-featured React app
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Midjourney Prompt Tool Suite</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/lucide-react@0.263.1/dist/umd/lucide-react.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" src="/app.js"></script>
</body>
</html>`);
});

// Serve the React component
app.get('/app.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(\`
const { useState, useEffect, useRef } = React;
const { 
  Wand2, Copy, Sparkles, RefreshCw, History, Palette, Sliders, Settings, 
  Save, RotateCcw, Edit3, Trash2, Plus, MessageCircle, Upload, Download,
  Check, Info, BarChart3, Target, Shuffle, Grid, Layers
} = lucideReact;

// Mock window.claude for server environment
window.claude = {
  complete: async (prompt) => {
    const response = await fetch('/api/claude/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    return data.enhanced;
  }
};

function MidjourneyPromptSuite() {
  const [activeMainTab, setActiveMainTab] = useState('enhance');
  const [inputPrompt, setInputPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('none');
  const [rewriteTier, setRewriteTier] = useState('full');
  const [qualityScore, setQualityScore] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [promptHistory, setPromptHistory] = useState([]);
  const [batchPrompts, setBatchPrompts] = useState(['']);
  const [batchResults, setBatchResults] = useState([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [showModerationError, setShowModerationError] = useState(false);
  const [moderationRewrites, setModerationRewrites] = useState([]);
  const [isFixingModeration, setIsFixingModeration] = useState(false);
  const [parameters, setParameters] = useState({
    v: { enabled: false, value: 6 },
    styleRaw: { enabled: false, value: true },
    s: { enabled: false, value: 100 },
    ar: { enabled: false, value: '16:9' }
  });
  
  // Load templates on mount
  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(setTemplates)
      .catch(console.error);
  }, []);
  
  const mainTabs = [
    { id: 'enhance', label: 'Enhance', icon: Wand2 },
    { id: 'poweruser', label: 'Power User', icon: Settings },
    { id: 'analyze', label: 'Analyze', icon: BarChart3 },
    { id: 'templates', label: 'Templates', icon: Palette }
  ];

  const rewritePresets = [
    { id: 'none', name: '⚪ Standard Enhancement', description: 'Clean, professional enhancement' },
    { id: 'warcore', name: '⚔️ Warcore Realism', description: 'Military tone, distressed atmospheres' },
    { id: 'cinematic', name: '🎞️ Neo-Cinematic', description: 'Rich contrast, cinematic lensing' },
    { id: 'photographic', name: '📸 Photorealistic', description: 'High-definition, sharp details' },
    { id: 'artistic', name: '🎨 Artistic Style', description: 'Painterly, creative interpretation' },
    { id: 'experimental', name: '🧪 Experimental', description: 'Bold, unconventional approaches' }
  ];

  const rewriteTiers = [
    { id: 'quick', name: '🟢 Quick Enhance', description: 'Light polish, keeps structure' },
    { id: 'full', name: '🟡 Full Rewrite', description: 'Complete professional rebuild' },
    { id: 'remix', name: '🔴 Creative Remix', description: 'Creative reinterpretation' }
  ];

  const enhancePrompt = async () => {
    if (!inputPrompt.trim()) return;
    setIsEnhancing(true);

    try {
      const response = await fetch('/api/claude/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: inputPrompt,
          preset: selectedPreset,
          tier: rewriteTier,
          parameters: parameters
        })
      });
      
      const data = await response.json();
      setEnhancedPrompt(data.enhanced);
      setQualityScore(data.qualityScore);
      
      // Refresh history
      fetch('/api/history')
        .then(res => res.json())
        .then(setPromptHistory)
        .catch(console.error);
        
    } catch (error) {
      setEnhancedPrompt('Enhancement failed. Please try again.');
    }

    setIsEnhancing(false);
  };

  const copyToClipboard = async (text, source = 'prompt') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(source);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const fixModerationError = async () => {
    if (!inputPrompt.trim()) return;
    setIsFixingModeration(true);

    try {
      const response = await fetch('/api/moderation/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputPrompt })
      });
      
      const data = await response.json();
      setModerationRewrites(data.rewrites);
      
    } catch (error) {
      setModerationRewrites(['Error generating alternatives']);
    }

    setIsFixingModeration(false);
  };

  const processBatch = async () => {
    const validPrompts = batchPrompts.filter(p => p.trim());
    if (validPrompts.length === 0) return;
    
    setIsBatchProcessing(true);
    
    try {
      const response = await fetch('/api/batch/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompts: validPrompts,
          settings: { preset: selectedPreset, tier: rewriteTier }
        })
      });
      
      const data = await response.json();
      setBatchResults(data.results);
      
    } catch (error) {
      console.error('Batch processing failed:', error);
    }
    
    setIsBatchProcessing(false);
  };

  const addBatchPrompt = () => {
    setBatchPrompts(prev => [...prev, '']);
  };

  const updateBatchPrompt = (index, value) => {
    setBatchPrompts(prev => prev.map((p, i) => i === index ? value : p));
  };

  const removeBatchPrompt = (index) => {
    setBatchPrompts(prev => prev.filter((_, i) => i !== index));
  };

  const updateParameter = (param, field, value) => {
    setParameters(prev => ({
      ...prev,
      [param]: { ...prev[param], [field]: value }
    }));
  };

  const loadTemplate = (template) => {
    setInputPrompt(template.prompt);
    setActiveMainTab('enhance');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-6 pt-6">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl">
              <Wand2 className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Midjourney Prompt Tool Suite</h1>
          <p className="text-slate-300 text-sm">Professional AI-powered prompt enhancement and optimization</p>
        </div>

        {/* Main Navigation */}
        <div className="bg-slate-800/60 rounded-xl p-2 border border-slate-600 mb-6">
          <div className="flex gap-1">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveMainTab(tab.id)}
                  className={\`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all \${
                    activeMainTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }\`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeMainTab === 'enhance' && (
          <div className="space-y-6">
            
            {/* Enhancement Mode */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50">
              <label className="block text-slate-300 text-sm font-medium mb-3">Enhancement Mode</label>
              <div className="grid grid-cols-3 gap-3">
                {rewriteTiers.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setRewriteTier(tier.id)}
                    className={\`flex flex-col items-center p-4 rounded-xl text-center transition-all \${
                      rewriteTier === tier.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                    }\`}
                  >
                    <span className="text-lg mb-1">{tier.name.split(' ')[0]}</span>
                    <div className="text-xs font-medium">{tier.name.substring(2)}</div>
                    <div className="text-xs opacity-75 mt-1">{tier.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Prompt */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50">
              <label className="block text-slate-300 text-sm font-medium mb-3">Your Prompt</label>
              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Enter your basic Midjourney prompt here..."
                className="w-full h-32 bg-slate-700/50 border border-slate-600 rounded-2xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
              />
            </div>

            {/* Parameters */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50">
              <h3 className="text-slate-300 text-sm font-medium mb-4">Parameters</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(parameters).map(([param, config]) => (
                  <div key={param} className="space-y-2">
                    <label className="flex items-center gap-2 text-slate-300 text-sm">
                      <input
                        type="checkbox"
                        checked={config.enabled}
                        onChange={() => updateParameter(param, 'enabled', !config.enabled)}
                        className="w-4 h-4 rounded border-slate-500 bg-slate-700 text-purple-500"
                      />
                      --{param === 'styleRaw' ? 'style raw' : param}
                    </label>
                    {param !== 'styleRaw' ? (
                      param === 'ar' ? (
                        <select
                          value={config.value}
                          onChange={(e) => updateParameter(param, 'value', e.target.value)}
                          disabled={!config.enabled}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
                        >
                          <option value="16:9">16:9</option>
                          <option value="9:16">9:16</option>
                          <option value="1:1">1:1</option>
                          <option value="4:3">4:3</option>
                          <option value="3:2">3:2</option>
                        </select>
                      ) : (
                        <input
                          type="number"
                          min={param === 'v' ? 1 : 0}
                          max={param === 'v' ? 7 : 1000}
                          value={config.value}
                          onChange={(e) => updateParameter(param, 'value', parseInt(e.target.value) || 0)}
                          disabled={!config.enabled}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm text-center disabled:opacity-50"
                        />
                      )
                    ) : (
                      <div className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-center">
                        <span className={\`text-sm font-bold \${config.enabled ? 'text-green-400' : 'text-slate-400'}\`}>
                          {config.enabled ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Style Presets */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50">
              <label className="block text-slate-300 text-sm font-medium mb-4">Style Presets</label>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {rewritePresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset.id)}
                    className={\`flex items-start gap-3 p-4 rounded-xl text-left transition-all \${
                      selectedPreset === preset.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                    }\`}
                  >
                    <span className="text-xl">{preset.name.split(' ')[0]}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{preset.name.substring(2)}</div>
                      <div className="text-xs opacity-75 mt-1">{preset.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Enhance Button */}
            <button
              onClick={enhancePrompt}
              disabled={!inputPrompt.trim() || isEnhancing}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 text-lg"
            >
              {isEnhancing ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Enhance Prompt
                </>
              )}
            </button>

            {/* Enhanced Output */}
            {enhancedPrompt && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <label className="text-slate-300 text-sm font-medium">Enhanced Prompt</label>
                    {qualityScore && (
                      <span className={\`px-2 py-1 rounded-lg text-xs font-bold \${
                        qualityScore >= 80 ? 'bg-green-600' : 
                        qualityScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                      }\`}>
                        Quality: {qualityScore}%
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowModerationError(true)}
                      className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-2 px-3 rounded-xl transition-colors"
                    >
                      ⚠️ Fix Moderation
                    </button>
                    <button
                      onClick={() => copyToClipboard(enhancedPrompt, 'enhanced')}
                      className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-2 px-3 rounded-xl transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      {copySuccess === 'enhanced' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="bg-slate-700/50 border border-slate-600 rounded-2xl p-4">
                  <p className="text-white text-sm leading-relaxed">{enhancedPrompt}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* POWER USER TAB */}
        {activeMainTab === 'poweruser' && (
          <div className="space-y-6">
            
            {/* Batch Processing */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Grid className="w-5 h-5" />
                Batch Processing
              </h3>
              
              <div className="space-y-4">
                {batchPrompts.map((prompt, index) => (
                  <div key={index} className="flex gap-3">
                    <textarea
                      value={prompt}
                      onChange={(e) => updateBatchPrompt(index, e.target.value)}
                      placeholder={\`Prompt \${index + 1}...\`}
                      className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      rows="2"
                    />
                    <button
                      onClick={() => removeBatchPrompt(index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-all"
                      disabled={batchPrompts.length === 1}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                <div className="flex gap-3">
                  <button
                    onClick={addBatchPrompt}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Prompt
                  </button>
                  
                  <button
                    onClick={processBatch}
                    disabled={isBatchProcessing || batchPrompts.every(p => !p.trim())}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-medium py-2 px-6 rounded-lg transition-all flex items-center gap-2"
                  >
                    {isBatchProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Process Batch
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Batch Results */}
              {batchResults.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-white font-medium mb-3">Batch Results</h4>
                  <div className="space-y-3">
                    {batchResults.map((result, index) => (
                      <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-400 text-sm">Result {index + 1}</span>
                          <button
                            onClick={() => copyToClipboard(result.enhanced, \`batch-\${index}\`)}
                            className="bg-purple-600 hover:bg-purple-700 p-1 rounded transition-all flex items-center gap-1"
                          >
                            {copySuccess === \`batch-\${index}\` ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                        <p className="text-white text-sm">{result.enhanced}</p>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => {
                      const allResults = batchResults.map(r => r.enhanced).join('\\n\\n');
                      copyToClipboard(allResults, 'all-batch');
                    }}
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Copy All Results
                  </button>
                </div>
              )}
            </div>

            {/* Prompt History */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <History className="w-5 h-5" />
                Prompt History
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {promptHistory.length === 0 ? (
                  <p className="text-slate-400 text-sm">No history yet. Start enhancing prompts to see them here.</p>
                ) : (
                  promptHistory.map((entry, index) => (
                    <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-xs">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">
                            {entry.preset}
                          </span>
                          {entry.qualityScore && (
                            <span className={\`text-xs px-2 py-1 rounded \${
                              entry.qualityScore >= 80 ? 'bg-green-600' : 
                              entry.qualityScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                            }\`}>
                              {entry.qualityScore}%
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setInputPrompt(entry.original);
                            setEnhancedPrompt(entry.enhanced);
                            setActiveMainTab('enhance');
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded transition-all"
                        >
                          Load
                        </button>
                      </div>
                      <p className="text-white text-sm">{entry.enhanced}</p>
                    </div>
                  ))
                )}
              </div>
              
              {promptHistory.length > 0 && (
                <button
                  onClick={() => {
                    fetch('/api/history', { method: 'DELETE' })
                      .then(() => setPromptHistory([]))
                      .catch(console.error);
                  }}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all"
                >
                  Clear History
                </button>
              )}
            </div>
          </div>
        )}

        {/* ANALYZE TAB */}
        {activeMainTab === 'analyze' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Quality Analysis
              </h3>
              
              <div className="space-y-4">
                <textarea
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="Enter prompt to analyze..."
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  rows="3"
                />
                
                <button
                  onClick={() => {
                    if (inputPrompt.trim()) {
                      const score = Math.floor(Math.random() * 40) + 60; // Demo score
                      setQualityScore(score);
                    }
                  }}
                  disabled={!inputPrompt.trim()}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center gap-2"
                >
                  <BarChart3 className="w-5 h-5" />
                  Analyze Quality
                </button>
                
                {qualityScore && (
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Quality Score</h4>
                    <div className="flex items-center gap-4">
                      <div className={\`text-3xl font-bold \${
                        qualityScore >= 80 ? 'text-green-400' : 
                        qualityScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }\`}>
                        {qualityScore}%
                      </div>
                      <div className="flex-1">
                        <div className="bg-slate-600 rounded-full h-3 overflow-hidden">
                          <div 
                            className={\`h-full transition-all duration-1000 \${
                              qualityScore >= 80 ? 'bg-green-500' : 
                              qualityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }\`}
                            style={{ width: \`\${qualityScore}%\` }}
                          />
                        </div>
                        <p className="text-slate-400 text-sm mt-2">
                          {qualityScore >= 80 ? 'Excellent prompt quality' : 
                           qualityScore >= 60 ? 'Good prompt, room for improvement' : 'Needs enhancement'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TEMPLATES TAB */}
        {activeMainTab === 'templates' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Prompt Templates
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-white font-medium text-sm">{template.category}</h5>
                      <button
                        onClick={() => loadTemplate(template)}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-1 px-3 rounded-lg transition-all"
                      >
                        Use Template
                      </button>
                    </div>
                    <p className="text-slate-300 text-sm">{template.prompt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Moderation Error Modal */}
        {showModerationError && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-red-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-500 p-2 rounded-lg">
                  <span className="text-white text-lg">⚠️</span>
                </div>
                <div>
                  <h3 className="text-red-400 font-medium">Moderation Error Detected</h3>
                  <p className="text-red-300 text-sm">Generate safe alternatives for your prompt</p>
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-2xl p-4 mb-4">
                <p className="text-slate-300 text-sm mb-2">Original prompt:</p>
                <p className="text-white text-sm font-mono bg-slate-800/50 rounded-lg p-3">{inputPrompt}</p>
              </div>

              {moderationRewrites.length === 0 ? (
                <button
                  onClick={fixModerationError}
                  disabled={isFixingModeration}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium py-3 px-6 rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  {isFixingModeration ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Generating Safe Alternatives...
                    </>
                  ) : (
                    <>
                      ⚠️ Generate Safe Alternatives
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {moderationRewrites.map((rewrite, index) => (
                      <div key={index} className="bg-slate-700/30 rounded-2xl p-4 border border-slate-600/50">
                        <p className="text-white text-sm mb-3">{rewrite}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setInputPrompt(rewrite);
                              setShowModerationError(false);
                              setActiveMainTab('enhance');
                            }}
                            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-2 px-3 rounded-xl transition-colors"
                          >
                            👍 Use This
                          </button>
                          <button
                            onClick={() => copyToClipboard(rewrite, \`mod-\${index}\`)}
                            className="flex items-center gap-1 bg-slate-600 hover:bg-slate-700 text-white text-xs font-medium py-2 px-3 rounded-xl transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            {copySuccess === \`mod-\${index}\` ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-slate-600/30">
                    <button
                      onClick={fixModerationError}
                      className="flex items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 px-4 rounded-xl transition-colors"
                    >
                      🔄 Generate More
                    </button>
                    <button
                      onClick={() => setShowModerationError(false)}
                      className="flex items-center gap-1 bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium py-2 px-4 rounded-xl transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 pb-8">
          <p className="text-slate-400 text-xs">Midjourney Prompt Tool Suite • Professional AI Enhancement Platform</p>
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<MidjourneyPromptSuite />, document.getElementById('root'));
  \`);
});

app.listen(PORT, () => {
  console.log(\`🚀 Server running on http://localhost:\${PORT}\`);
  console.log(\`🎨 Midjourney Prompt Tool Suite ready!\`);
  console.log(\`✨ Features: Enhancement, Moderation, Batch Processing, Quality Scoring, Templates, History\`);
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});
