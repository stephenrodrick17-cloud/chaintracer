
from sqlalchemy import Column, Integer, String, Float, Text
from .db import Base

class Address(Base):
    __tablename__ = "addresses"
    id = Column(Integer, primary_key=True, index=True)
    address = Column(String, unique=True, index=True)
    source = Column(String)
    illicit_prob = Column(Float)
    risk_level = Column(String)
    is_sanctioned = Column(Integer)
    abuse_reports = Column(Integer)
    n_tx = Column(Integer)
    total_received = Column(Integer)
    total_sent = Column(Integer)
    final_balance = Column(Integer)
    first_analyzed = Column(Text)
    last_analyzed = Column(Text)
    cluster_id = Column(Integer)

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    tx_hash = Column(String, unique=True, index=True)
    source_address = Column(String)
    dest_address = Column(String)
    value_satoshi = Column(Integer)
    fee_satoshi = Column(Integer)
    n_inputs = Column(Integer)
    n_outputs = Column(Integer)
    block_height = Column(Integer)
    timestamp = Column(Text)
    illicit_prob = Column(Float)
    risk_level = Column(String)

class GraphEdge(Base):
    __tablename__ = "graph_edges"
    id = Column(Integer, primary_key=True, index=True)
    src_txid = Column(String)
    dst_txid = Column(String)
    edge_type = Column(String)
    value_satoshi = Column(Integer)
    session_id = Column(String)

class Cluster(Base):
    __tablename__ = "clusters"
    id = Column(Integer, primary_key=True, index=True)
    representative_address = Column(String)
    size = Column(Integer)
    avg_illicit_prob = Column(Float)
    risk_level = Column(String)
    is_sanctioned = Column(Integer)
    peeling_chain_depth = Column(Integer)
    labels_json = Column(Text)
    created_at = Column(Text)

class AbuseReport(Base):
    __tablename__ = "abuse_reports"
    id = Column(Integer, primary_key=True, index=True)
    address = Column(String)
    abuse_type = Column(String)
    report_count = Column(Integer)
    first_seen = Column(Text)
