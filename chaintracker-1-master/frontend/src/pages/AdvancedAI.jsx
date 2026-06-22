import React, { useState } from 'react';
import { Camera, Type, Mic, MapPin, Network, BrainCircuit, ArrowRight, AlertTriangle, CheckCircle, Shield, Activity } from 'lucide-react';
import { multiAgentApi } from '../api';

const AdvancedAI = () => {
  const [activeTab, setActiveTab] = useState('nlp');
  const [inputValue, setInputValue] = useState('');
  const [description, setDescription] = useState('');
  const [transcript, setTranscript] = useState('');
  const [query, setQuery] = useState('Analyze this area for potential threats');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tabs = [
    { id: 'nlp', label: 'NLP / Scam', icon: Type },
    { id: 'computer-vision', label: 'Computer Vision', icon: Camera },
    { id: 'speech', label: 'Speech AI', icon: Mic },
    { id: 'geospatial', label: 'Geospatial', icon: MapPin },
    { id: 'graph-ai', label: 'Graph AI', icon: Network },
    { id: 'fusion', label: 'Intelligence Fusion', icon: BrainCircuit },
  ];

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let response;
      switch (activeTab) {
        case 'nlp':
          response = await multiAgentApi.analyzeNLP({ text: inputValue });
          break;
        case 'computer-vision':
          response = await multiAgentApi.analyzeComputerVision({ 
            type: 'image', 
            filename: inputValue,
            description: description
          });
          break;
        case 'speech':
          response = await multiAgentApi.analyzeSpeech({ 
            type: 'audio', 
            filename: inputValue,
            transcript: transcript
          });
          break;
        case 'geospatial':
          response = await multiAgentApi.analyzeGeospatial({ 
            locations: [],
            query: query
          });
          break;
        case 'graph-ai':
          response = await multiAgentApi.analyzeGraphAI({ graph: {} });
          break;
        case 'fusion':
          response = await multiAgentApi.fuseIntelligence({ agent_results: {} });
          break;
        default:
          break;
      }
      setResult(response);
    } catch (err) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score > 0.7) return 'text-red-500 bg-red-500/10 border-red-500/30';
    if (score > 0.4) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    return 'text-green-500 bg-green-500/10 border-green-500/30';
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden relative">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40 brightness-75"
          src="/Digital_network_to_fingerprint_scan_202606202019.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90" />
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:30px_30px] opacity-[0.02]" />
      </div>

      <div className="relative z-10 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">AI Agents Ready</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter uppercase">
              Advanced <span className="text-zinc-500 italic">AI Suite</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto font-light">
              Six specialized AI agents working together for multi-modal intelligence analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Section - Input & Controls */}
            <div className="space-y-6">
              {/* Tabs */}
              <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <BrainCircuit className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Select Agent</h2>
                    <p className="text-zinc-500 text-sm">Choose AI capability</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setResult(null);
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          activeTab === tab.id
                            ? 'bg-white/10 border-white/30'
                            : 'bg-white/5 border-white/5 hover:border-white/10 text-zinc-400'
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2" />
                        <span className="text-xs font-bold uppercase tracking-wide">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={handleAnalyze} className="space-y-6">
                  {activeTab === 'nlp' && (
                    <div>
                      <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Paste text to analyze for scam patterns, phishing attempts, or suspicious messages..."
                        className="w-full h-48 px-6 py-4 text-lg bg-white/5 border border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:border-white/30 focus:bg-white/10 focus:outline-none transition-all font-mono text-sm resize-none"
                        required
                      />
                    </div>
                  )}

                  {activeTab === 'computer-vision' && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter image filename..."
                        className="w-full px-6 py-4 text-lg bg-white/5 border border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:border-white/30 focus:bg-white/10 focus:outline-none transition-all font-mono text-sm"
                      />
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the image (e.g., 'A passport photo that may be counterfeit' or 'A video that looks like a deepfake')..."
                        className="w-full h-32 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:border-white/30 focus:bg-white/10 focus:outline-none transition-all font-mono text-sm resize-none"
                      />
                    </div>
                  )}

                  {activeTab === 'speech' && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter audio filename..."
                        className="w-full px-6 py-4 text-lg bg-white/5 border border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:border-white/30 focus:bg-white/10 focus:outline-none transition-all font-mono text-sm"
                      />
                      <textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder="Transcript of the audio (to analyze for abusive content, scams, etc.)..."
                        className="w-full h-32 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:border-white/30 focus:bg-white/10 focus:outline-none transition-all font-mono text-sm resize-none"
                      />
                    </div>
                  )}

                  {activeTab === 'geospatial' && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="What would you like to analyze? (e.g., 'Crime hotspots in New York' or 'Patrol optimization for downtown')"
                        className="w-full px-6 py-4 text-lg bg-white/5 border border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:border-white/30 focus:bg-white/10 focus:outline-none transition-all font-mono text-sm"
                      />
                    </div>
                  )}

                  {(activeTab === 'graph-ai' || activeTab === 'fusion') && (
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
                      <div className="text-zinc-500 text-sm">Click Start Analysis to run a simulated analysis</div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-white to-zinc-200 text-black text-lg font-black rounded-2xl hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Analyzing...
                      </div>
                    ) : (
                      <>
                        Start Analysis <ArrowRight className="inline w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </form>

                {error && (
                  <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6" />
                    {error}
                  </div>
                )}
              </div>

              {/* Agent Status Cards */}
              <div className="grid grid-cols-2 gap-4">
                {tabs.slice(0, 6).map((agent, idx) => {
                  const Icon = agent.icon;
                  return (
                    <div 
                      key={idx} 
                      className={`bg-black/40 backdrop-blur-xl rounded-2xl p-6 border-2 transition-all ${
                        activeTab === agent.id ? 'border-white/30' : 'border-white/5'
                      }`}
                    >
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-black mb-1 uppercase tracking-tight">{agent.label}</h3>
                      <div className="mt-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Active</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Section - Results */}
            <div>
              <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl h-full">
                <div className="flex items-center gap-3 mb-8">
                  <Activity className="w-7 h-7 text-white" />
                  <h3 className="text-2xl font-black uppercase tracking-tight">Analysis Results</h3>
                </div>

                {loading && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-zinc-500">Processing with AI agents...</p>
                  </div>
                )}

                {!loading && !result && (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-10 h-10 text-zinc-600" />
                    </div>
                    <p className="text-zinc-500">Select an agent and run an analysis</p>
                  </div>
                )}

                {result && (
                  <div className="space-y-6">
                    {activeTab === 'nlp' && result.analysis && (
                      <>
                        <div className={`p-6 rounded-2xl border-2 ${getRiskColor(result.analysis.scam_confidence)}`}>
                          <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-3">Scam Probability</h4>
                          <div className="text-4xl font-black tabular-nums mb-4">
                            {Math.round(result.analysis.scam_confidence * 100)}%
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-1000 ${
                                result.analysis.scam_confidence > 0.7 ? 'bg-red-500' : 
                                result.analysis.scam_confidence > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${result.analysis.scam_confidence * 100}%` }}
                            />
                          </div>
                          <div className="mt-4 text-sm text-zinc-300">
                            {result.analysis.is_scam ? '⚠️ Potential scam detected!' : '✓ No scam patterns detected'}
                          </div>
                          {result.analysis.scam_type && (
                            <div className="mt-3 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                              <span className="text-sm font-bold uppercase tracking-wide">Type: {result.analysis.scam_type}</span>
                            </div>
                          )}
                        </div>

                        {result.analysis.key_entities && result.analysis.key_entities.length > 0 && (
                          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4">Key Entities</h4>
                            <div className="flex flex-wrap gap-2">
                              {result.analysis.key_entities.map((entity, idx) => (
                                <span key={idx} className="px-3 py-1 bg-white/10 rounded-lg text-sm">{entity}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {activeTab === 'computer-vision' && result.analysis && (
                      <>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className={`p-6 rounded-2xl border-2 ${getRiskColor(result.analysis.deepfake_confidence)}`}>
                            <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-3">Deepfake</h4>
                            <div className="text-3xl font-black tabular-nums">
                              {Math.round(result.analysis.deepfake_confidence * 100)}%
                            </div>
                          </div>
                          <div className={`p-6 rounded-2xl border-2 ${getRiskColor(result.analysis.counterfeit_confidence)}`}>
                            <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-3">Counterfeit</h4>
                            <div className="text-3xl font-black tabular-nums">
                              {Math.round(result.analysis.counterfeit_confidence * 100)}%
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                          <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4">Image Quality</h4>
                          <div className="text-xl font-black">{result.analysis.image_quality}</div>
                        </div>
                      </>
                    )}

                    {activeTab === 'speech' && result.analysis && (
                      <>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className={`p-6 rounded-2xl border-2 ${getRiskColor(result.analysis.ai_confidence)}`}>
                            <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-3">AI Generated</h4>
                            <div className="text-3xl font-black tabular-nums">
                              {Math.round(result.analysis.ai_confidence * 100)}%
                            </div>
                          </div>
                          <div className={`p-6 rounded-2xl border-2 ${getRiskColor(result.analysis.abusive_language_confidence)}`}>
                            <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-3">Abusive</h4>
                            <div className="text-3xl font-black tabular-nums">
                              {Math.round(result.analysis.abusive_language_confidence * 100)}%
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {activeTab === 'geospatial' && result.analysis && (
                      <div className="space-y-4">
                        {result.analysis.crime_hotspots && result.analysis.crime_hotspots.length > 0 && (
                          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4">Crime Hotspots</h4>
                            <div className="space-y-3">
                              {result.analysis.crime_hotspots.map((hotspot, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                                  <span className="font-bold">{hotspot.area_name || 'Unknown'} - {hotspot.risk.toUpperCase()}</span>
                                  <span className="text-zinc-400">{hotspot.incidents} incidents</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {result.analysis.patrol_recommendations && (
                          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4">Patrol Recommendations</h4>
                            <ul className="space-y-2">
                              {result.analysis.patrol_recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-zinc-300">
                                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span className="font-medium">{rec.area}: {rec.priority} - {rec.suggested_patrols} patrols</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'graph-ai' && result.analysis && (
                      <div className="space-y-4">
                        {result.analysis.fraud_rings_detected > 0 && (
                          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4">Detected Fraud Rings</h4>
                            <div className="text-3xl font-black tabular-nums text-red-400 mb-4">{result.analysis.fraud_rings_detected}</div>
                            {result.analysis.rings && result.analysis.rings.map((ring, idx) => (
                              <div key={idx} className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-3">
                                <div className="text-lg font-black">{ring.ring_id}</div>
                                <div className="text-zinc-400 text-sm mt-1">{ring.size} nodes • {ring.suspicious_transactions} transactions</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'fusion' && result.fusion_report && (
                      <>
                        <div className={`p-6 rounded-2xl border-2 ${getRiskColor(result.fusion_report.overall_risk_score)}`}>
                          <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-3">Overall Risk</h4>
                          <div className="text-3xl font-black mb-2">{result.fusion_report.overall_risk_level.toUpperCase()}</div>
                          <div className="text-4xl font-black tabular-nums">
                            {Math.round(result.fusion_report.overall_risk_score * 100)}%
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-3 mt-4">
                            <div 
                              className={`h-3 rounded-full transition-all duration-1000 ${
                                result.fusion_report.overall_risk_score > 0.7 ? 'bg-red-500' : 
                                result.fusion_report.overall_risk_score > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${result.fusion_report.overall_risk_score * 100}%` }}
                            />
                          </div>
                        </div>

                        {result.fusion_report.recommended_actions && (
                          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4">Recommended Actions</h4>
                            <ul className="space-y-2">
                              {result.fusion_report.recommended_actions.map((action, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-zinc-300">
                                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span className="font-medium">{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}

                    {/* Raw JSON */}
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4">Raw Data</h4>
                      <div className="text-xs text-zinc-400 font-mono overflow-auto max-h-64">
                        <pre>{JSON.stringify(result, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAI;
