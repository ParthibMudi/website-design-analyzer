import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './styles.css';

const API_BASE = 'http://localhost:5000';

function App() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [techStack, setTechStack] = useState('React');
  const [code, setCode] = useState('');
  const [displayedCode, setDisplayedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('analyze');
  const [customPrompt, setCustomPrompt] = useState('');
  const typewriterInterval = useRef(null);

  // Typewriter effect for code display
  useEffect(() => {
    if (activeTab === 'code' && code) {
      setDisplayedCode(''); // Reset when new code is generated
      let i = 0;
      
      clearInterval(typewriterInterval.current); // Clear any existing interval
      
      typewriterInterval.current = setInterval(() => {
        if (i < code.length) {
          setDisplayedCode(prev => prev + code.charAt(i));
          i++;
        } else {
          clearInterval(typewriterInterval.current);
        }
      }, 10); // Adjust speed here (lower = faster)
    }

    return () => clearInterval(typewriterInterval.current);
  }, [code, activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const processRes = await axios.post(`${API_BASE}/process`, { url });
      if (processRes.data.error) throw new Error(processRes.data.error);

      const analysisRes = await axios.post(`${API_BASE}/analyze`, { url });
      
      setResult({
        ...processRes.data,
        analysis: analysisRes.data.analysis
      });
      setActiveTab('analyze');
      
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeGeneration = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post(`${API_BASE}/generate-code`, { 
        url, 
        techStack,
        customPrompt
      });
      if (res.data.error) throw new Error(res.data.error);

      setCode(res.data.code);
      setActiveTab('code');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const parseAnalysis = (analysisText) => {
    const sections = {};
    const lines = analysisText.split('\n');
    let currentSection = '';
    
    lines.forEach(line => {
      const sectionMatch = line.match(/(\d+)\.\s+(.+?):/);
      if (sectionMatch) {
        currentSection = sectionMatch[2];
        sections[currentSection] = [];
      } else if (currentSection && line.trim()) {
        // Process bold text markers
        const processedLine = line.replace(/^\*/, '').trim()
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        sections[currentSection].push(processedLine);
      }
    });

    return sections;
  };

  const renderAnalysisSection = (title, items, isScore = false) => {
    if (!items || items.length === 0) return null;

    return (
      <div className={`analysis-box ${isScore ? 'score-box' : ''}`}>
        <h4>{title}</h4>
        {isScore ? (
          <div className="score-container">
            <div className="score-circle">{items[0].match(/\d+/)?.[0]}</div>
            <p dangerouslySetInnerHTML={{ __html: items[0].replace(/^.*?\d+\/\d+\s*/, '') }} />
          </div>
        ) : (
          <ul>
            {items.map((item, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="container">
      <header className="app-header">
        <h1>Website Design Analyzer</h1>
        <p className="subtitle">Get design feedback and generated code for any website</p>
      </header>
      
      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {!result ? (
        <form onSubmit={handleSubmit} className="url-form">
          <div className="form-group">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL (e.g., https://example.com)"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="primary-btn">
            {loading ? 'Analyzing...' : 'Analyze Website'}
          </button>
        </form>
      ) : (
        
        <div className="results-container">

          <div className="screenshot-container">
  <div className="screenshot-header">
    <h2>Website Screenshot</h2>
    <button 
      className="secondary-btn start-new-btn"
      onClick={() => {
        setResult(null);
        setUrl('');
        setCode('');
        setDisplayedCode('');
        setCustomPrompt('');
        setError('');
        setActiveTab('analyze');
      }}
    >
      Start New
    </button>
  </div>
  <div className="image-wrapper">
    <img 
      src={`${API_BASE}${result.screenshot_url}`} 
      alt="Website screenshot" 
      className="website-screenshot"
    />
    <a
      href={`${API_BASE}/download/${result.filename}`}
      download={`website_design_${new Date().getTime()}.png`}
      className="download-btn"
    >
      Download Screenshot
    </a>
  </div>
</div>


          <div className="tabs">
            <button 
              className={activeTab === 'analyze' ? 'active' : ''}
              onClick={() => setActiveTab('analyze')}
            >
              Analysis
            </button>
            <button 
              className={activeTab === 'code' ? 'active' : ''}
              onClick={() => setActiveTab('code')}
              disabled={!code}
            >
              Generated Code
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'analyze' ? (
              <div className="analysis-section">
                <h3>Design Analysis</h3>
                <div className="analysis-content">
                  {result?.analysis && Object.entries(parseAnalysis(result.analysis)).map(([section, items]) => (
                    <React.Fragment key={section}>
                      {section === 'Score out of 10' 
                        ? renderAnalysisSection(section, items, true)
                        : renderAnalysisSection(section, items)}
                    </React.Fragment>
                  ))}
                </div>
                <div className="code-generation-section">
                  <h3>Generate Code</h3>
                  <div className="tech-stack-selector">
                    <select
                      value={techStack}
                      onChange={(e) => setTechStack(e.target.value)}
                      className="tech-select"
                    >
                      <option value="React">React</option>
                      <option value="HTML/CSS">HTML/CSS</option>
                      <option value="Next.js">Next.js</option>
                      <option value="Vue">Vue</option>
                      <option value="Svelte">Svelte</option>
                    </select>
                    <button 
                      onClick={handleCodeGeneration}
                      disabled={loading}
                      className="primary-btn"
                    >
                      {loading ? 'Generating...' : 'Generate Code'}
                    </button>
                  </div>
                  <div className="custom-prompt">
                  <label>Custom Suggestions (optional):</label>
                      <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Enter specific instructions for code generation..."
                      />
                  </div>

                </div>
              </div>
            ) : (
              <div className="code-section">
                <div className="code-header">
                  <h3>Generated {techStack} Code</h3>
                  <div className="code-actions">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(code);
                        alert('Code copied to clipboard!');
                      }}
                      className="secondary-btn"
                    >
                      Copy Code
                    </button>
                  </div>
                </div>
                <div className="code-generation-layout">
                  <div className="code-output-container">
                    <pre className="code-output">
                      {displayedCode}
                      <span className="cursor">|</span>
                    </pre>
                  </div>
                  <div className="prompt-section">
                    <h4>Modify Code Generation</h4>
                    <div className="prompt-controls">
                      <div className="form-group">
                        <label>Tech Stack:</label>
                        <select
                          value={techStack}
                          onChange={(e) => setTechStack(e.target.value)}
                          className="tech-select"
                        >
                          <option value="React">React</option>
                          <option value="HTML/CSS">HTML/CSS</option>
                          <option value="Next.js">Next.js</option>
                          <option value="Vue">Vue</option>
                          <option value="Svelte">Svelte</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Custom Suggestions:</label>
                        <textarea
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          placeholder="Enter your custom suggestions for code generation..."
                        />
                      </div>
                      <button 
                        onClick={handleCodeGeneration}
                        disabled={loading}
                        className="primary-btn"
                      >
                        {loading ? 'Regenerating...' : 'Regenerate Code'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="app-footer">
        <div className="footer-content">
          <p className="copyright">© {new Date().getFullYear()} Website Design Analyzer</p>
        </div>
      </footer>
    </div>
  );
}

export default App;