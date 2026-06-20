import React, { useState } from 'react';
import { Search, Activity, AlertTriangle, CheckCircle, Shield, Brain, CheckSquare, FileText, ArrowRight, Clock, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { multiAgentApi } from '../api';

const MultiAgentFraudDetector = () => {
  const [inputType, setInputType] = useState('address');
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = inputType === 'address' 
        ? { address: inputValue } 
        : { tx_hash: inputValue };
      
      const response = await multiAgentApi.checkFraud(data);
      setResult(response);
    } catch (err) {
      setError(err.message || 'An error occurred during fraud check');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score > 0.7) return 'text-red-500 bg-red-500/10 border-red-500/30';
    if (score > 0.4) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    return 'text-green-500 bg-green-500/10 border-green-500/30';
  };

  const getFraudTypeColor = (type) => {
    const colors = {
      phishing: 'bg-red-500/20 text-red-400 border-red-500/30',
      'upi scam': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'marketplace fraud': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'illicit activity': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const formatSatoshi = (satoshi) => {
    return (satoshi / 100000000).toFixed(8) + ' BTC';
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
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Multi-Agent System Active</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter uppercase">
              Real-Time <span className="text-zinc-500 italic">Fraud Detection</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto font-light">
              Four specialized AI agents working in concert to identify and verify suspicious blockchain activity.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Run Analysis</h2>
                  <p className="text-zinc-500 text-sm">Scan an address or transaction</p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setInputType('address')}
                      className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${
                        inputType === 'address' 
                          ? 'bg-white text-black shadow-lg' 
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputType('transaction')}
                      className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${
                        inputType === 'transaction' 
                          ? 'bg-white text-black shadow-lg' 
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Transaction
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={inputType === 'address' ? 'Enter Bitcoin address...' : 'Enter transaction hash...'}
                      className="w-full px-6 py-4 text-lg bg-white/5 border border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:border-white/30 focus:bg-white/10 focus:outline-none transition-all font-mono text-sm"
                      required
                    />
                  </div>
                </div>

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
                    'Start Analysis'
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

            {/* Right Section */}
            <div className="space-y-6">
              {/* Agent Status Cards */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Collection', icon: Search, desc: 'Data Gathering' },
                  { name: 'Analysis', icon: Brain, desc: 'ML Detection' },
                  { name: 'Verification', icon: CheckSquare, desc: 'Cross-Checking' },
                  { name: 'Reporting', icon: FileText, desc: 'Generating Report' },
                ].map((agent, idx) => (
                  <div 
                    key={idx} 
                    className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                      <agent.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-black mb-1 uppercase tracking-tight">{agent.name}</h3>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">{agent.desc}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Active</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Results Display */}
              {result && (
                <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                  <div className="flex items-center gap-3 mb-8">
                    <Activity className="w-7 h-7 text-white" />
                    <h3 className="text-2xl font-black uppercase tracking-tight">Analysis Results</h3>
                  </div>

                  {result.pipeline_status === 'completed' && (
                    <div className="space-y-8">
                      {/* Collected Data */}
                      {result.steps?.collection?.collected_data && (
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Collected Data
                          </h4>
                          {result.steps.collection.collected_data.blockchain && (
                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Transactions
                                </div>
                                <div className="text-2xl font-black tabular-nums">
                                  {result.steps.collection.collected_data.blockchain.n_tx}
                                </div>
                              </div>
                              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1 flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  Final Balance
                                </div>
                                <div className="text-2xl font-black tabular-nums">
                                  {formatSatoshi(result.steps.collection.collected_data.blockchain.final_balance)}
                                </div>
                              </div>
                              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1 flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  Total Received
                                </div>
                                <div className="text-2xl font-black tabular-nums">
                                  {formatSatoshi(result.steps.collection.collected_data.blockchain.total_received)}
                                </div>
                              </div>
                              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Abuse Reports
                                </div>
                                <div className="text-2xl font-black tabular-nums">
                                  {result.steps.collection.collected_data.abuse?.count || 0}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Risk Score */}
                      {result.final_report && (
                        <>
                          <div className={`p-6 rounded-2xl border-2 ${getRiskColor(result.final_report.risk_summary.overall_risk)}`}>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                  <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-1">Overall Risk</h4>
                                  <span className="text-3xl font-black tabular-nums">
                                    {Math.round(result.final_report.risk_summary.overall_risk * 100)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-1000 ${
                                  result.final_report.risk_summary.overall_risk > 0.7 
                                    ? 'bg-red-500' 
                                    : result.final_report.risk_summary.overall_risk > 0.4 
                                      ? 'bg-yellow-500' 
                                      : 'bg-green-500'
                                }`}
                                style={{ width: `${result.final_report.risk_summary.overall_risk * 100}%` }}
                              />
                            </div>
                          </div>

                          {/* Detected Fraud Types */}
                          {result.final_report.risk_summary.detected_fraud_types.length > 0 && (
                            <div>
                              <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-3">Detected Fraud Types</h4>
                              <div className="flex flex-wrap gap-2">
                                {result.final_report.risk_summary.detected_fraud_types.map((type, idx) => (
                                  <span 
                                    key={idx} 
                                    className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide border ${getFraudTypeColor(type)}`}
                                  >
                                    {type}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recommendations */}
                          <div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-3">Recommendations</h4>
                            <ul className="space-y-3">
                              {result.final_report.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-zinc-300">
                                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span className="font-medium">{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}

                      {/* Analysis Details */}
                      {result.steps?.analysis?.analysis && (
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-3">Analysis Breakdown</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(result.steps.analysis.analysis).map(([type, data]) => (
                              <div key={type} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="text-zinc-400 text-xs uppercase tracking-widest mb-2">{type}</div>
                                <div className="text-xl font-black tabular-nums">
                                  {Math.round(data.probability * 100)}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {result.pipeline_status === 'failed' && (
                    <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 flex items-center gap-3">
                      <AlertTriangle className="w-8 h-8" />
                      <div>
                        <h4 className="font-black text-lg uppercase tracking-tight mb-1">Pipeline Failed</h4>
                        <p>{result.error}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiAgentFraudDetector;
