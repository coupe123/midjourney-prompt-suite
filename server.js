const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

const mockEnhance = async (prompt) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return prompt + ', highly detailed, professional quality, cinematic composition, --ar 16:9 --v 6';
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', version: '1.0.0' });
});

app.post('/api/claude/complete', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });
    const enhanced = await mockEnhance(prompt);
    res.json({ enhanced });
  } catch (error) {
    res.status(500).json({ error: 'Enhancement failed' });
  }
});

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>Midjourney Prompt Tool</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState } = React;
    
    function App() {
      const [input, setInput] = useState('');
      const [output, setOutput] = useState('');
      const [loading, setLoading] = useState(false);
      
      const enhance = async () => {
        if (!input.trim()) return;
        setLoading(true);
        try {
          const res = await fetch('/api/claude/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: input })
          });
          const data = await res.json();
          setOutput(data.enhanced);
        } catch (err) {
          setOutput('Error: ' + err.message);
        }
        setLoading(false);
      };
      
      const copy = () => {
        navigator.clipboard.writeText(output);
      };
      
      return (
        <div className="min-h-screen bg-gray-900 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">
              Midjourney Prompt Enhancer
            </h1>
            
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <label className="block text-gray-300 mb-2">Enter your prompt:</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-32 bg-gray-700 text-white p-4 rounded border-none resize-none"
                placeholder="e.g., a warrior in armor"
              />
            </div>
            
            <button
              onClick={enhance}
              disabled={!input.trim() || loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-4 px-8 rounded mb-6"
            >
              {loading ? 'Enhancing...' : 'Enhance Prompt'}
            </button>
            
            {output && (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-gray-300">Enhanced Result:</label>
                  <button
                    onClick={copy}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Copy
                  </button>
                </div>
                <div className="bg-gray-700 p-4 rounded">
                  <p className="text-white">{output}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    ReactDOM.render(<App />, document.getElementById('root'));
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log('Server running on http://localhost:3000');
});