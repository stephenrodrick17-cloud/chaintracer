import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const datasetApi = {
  getStats: () => api.get('/dataset/stats').then(res => res.data),
  getTimeline: () => api.get('/dataset/timeline').then(res => res.data),
};

export const predictApi = {
  getDatasetTx: (txid) => api.get(`/predict/dataset/${txid}`).then(res => res.data),
  postBatch: (txidList) => api.post('/predict/batch', txidList).then(res => res.data),
  getUnknowns: (params) => api.get('/predict/unknown', { params }).then(res => res.data),
  getModelStats: () => api.get('/predict/model/stats').then(res => res.data),
  getFeatures: () => api.get('/predict/model/features').then(res => res.data),
};

export const traceApi = {
  postAddress: (address) => api.post(`/trace/address?address=${address}`).then(res => res.data),
  getHistory: () => api.get('/trace/history').then(res => res.data),
  getGraph: (address) => api.get(`/trace/${address}/graph`).then(res => res.data),
  getTransactions: (address) => api.get(`/trace/${address}/transactions`).then(res => res.data),
  getAbuse: (address) => api.get(`/trace/${address}/abuse`).then(res => res.data),
};

export const graphApi = {
  getDatasetGraph: (txid, hops = 2) => api.get(`/graph/dataset/${txid}`, { params: { hops } }).then(res => res.data),
  expandNode: (txid) => api.get(`/graph/expand/${txid}`).then(res => res.data),
  getCluster: (id) => api.get(`/graph/cluster/${id}`).then(res => res.data),
};

export const reportApi = {
  getAllClusters: () => api.get('/report/clusters').then(res => res.data),
  getClusterReport: (id) => api.get(`/report/cluster/${id}`).then(res => res.data),
};

export const multiAgentApi = {
  checkFraud: (data) => api.post('/multi-agent/check', data).then(res => res.data),
  getAgentStatus: () => api.get('/multi-agent/status').then(res => res.data),
};

export const explainApi = {
  getExplanation: (prompt) => api.post('/explain', { prompt }).then(res => res.data),
};

export default api;
