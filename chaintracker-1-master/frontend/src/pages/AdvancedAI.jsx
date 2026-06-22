import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Type, Mic, MapPin, Network, BrainCircuit } from 'lucide-react';
import { multiAgentApi } from '../api';

const AdvancedAI = () => {
  const [activeTab, setActiveTab] = useState('nlp');
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'nlp', label: 'NLP / Scam Detection', icon: Type },
    { id: 'computer-vision', label: 'Computer Vision', icon: Camera },
    { id: 'speech', label: 'Speech AI', icon: Mic },
    { id: 'geospatial', label: 'Geospatial', icon: MapPin },
    { id: 'graph-ai', label: 'Graph AI', icon: Network },
    { id: 'fusion', label: 'Intelligence Fusion', icon: BrainCircuit },
  ];

  const analyzeData = async () => {
    setLoading(true);
    try {
      let response;
      switch (activeTab) {
        case 'nlp':
          response = await multiAgentApi.analyzeNLP({ text: input });
          break;
        case 'computer-vision':
          response = await multiAgentApi.analyzeComputerVision({ type: 'image', filename: input });
          break;
        case 'speech':
          response = await multiAgentApi.analyzeSpeech({ type: 'audio', filename: input });
          break;
        case 'geospatial':
          response = await multiAgentApi.analyzeGeospatial({ locations: [] });
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
    } catch (error) {
      console.error('Error analyzing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const TabIcon = tabs.find(t => t.id === activeTab)?.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-lg flex items-center justify-center">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Advanced AI Suite</h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl">
            Multi-modal intelligence capabilities powered by specialized AI agents.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-3 mb-10 border-b border-slate-800 pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setResult(null);
                }}
                className={`px-6 py-3 rounded-t-xl font-semibold flex items-center gap-2 transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white border-t-2 border-t-violet-500'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                {TabIcon && <TabIcon className="w-6 h-6 text-violet-500" />}
                Input Data
              </h2>

              {activeTab === 'nlp' && (
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste text to analyze for scam patterns..."
                  className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              )}

              {(activeTab === 'computer-vision' || activeTab === 'speech') && (
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter filename or upload (simulated)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              )}

              {activeTab === 'geospatial' && (
                <div className="text-center py-12 text-slate-500">
                  <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Location analysis ready. Click to simulate.</p>
                </div>
              )}

              {activeTab === 'graph-ai' && (
                <div className="text-center py-12 text-slate-500">
                  <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Graph network analysis ready. Click to simulate.</p>
                </div>
              )}

              {activeTab === 'fusion' && (
                <div className="text-center py-12 text-slate-500">
                  <BrainCircuit className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Intelligence fusion engine ready. Click to simulate.</p>
                </div>
              )}

              <button
                onClick={analyzeData}
                disabled={loading}
                className="mt-6 w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Analyzing...' : 'Run Analysis'}
              </button>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            key={activeTab + '-results'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 h-full">
              <h2 className="text-2xl font-bold mb-6">Analysis Results</h2>
              
              {!result && !loading && (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-lg">No analysis yet</p>
                  <p className="text-sm mt-2">Run an analysis to see results here</p>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-400">Processing with AI agents...</p>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  <div className="bg-slate-950 rounded-xl p-4 font-mono text-sm overflow-auto max-h-[500px]">
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                  </div>

                  {result.analysis?.is_scam && (
                    <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                      <p className="text-red-400 font-bold">⚠️ Potential scam detected!</p>
                      <p className="text-sm text-red-300 mt-1">Confidence: {(result.analysis.scam_confidence * 100).toFixed(1)}%</p>
                    </div>
                  )}

                  {result.analysis?.is_deepfake && (
                    <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-xl">
                      <p className="text-orange-400 font-bold">🎭 Deepfake detected!</p>
                      <p className="text-sm text-orange-300 mt-1">Confidence: {(result.analysis.deepfake_confidence * 100).toFixed(1)}%</p>
                    </div>
                  )}

                  {result.fusion_report && (
                    <div className={`p-4 rounded-xl ${
                      result.fusion_report.overall_risk_level === 'critical' || result.fusion_report.overall_risk_level === 'high'
                        ? 'bg-red-900/20 border border-red-500/30'
                        : 'bg-green-900/20 border border-green-500/30'
                    }`}>
                      <p className={`font-bold ${
                        result.fusion_report.overall_risk_level === 'critical' || result.fusion_report.overall_risk_level === 'high'
                          ? 'text-red-400'
                          : 'text-green-400'
                      }`}>
                        Risk Level: {result.fusion_report.overall_risk_level}
                      </p>
                      <p className="text-sm mt-1">
                        Score: {(result.fusion_report.overall_risk_score * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAI;
