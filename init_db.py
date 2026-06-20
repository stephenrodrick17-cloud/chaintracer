from backend.database.db import Base, engine, create_tables
from backend.database.models import Address, Transaction, GraphEdge, Cluster, AbuseReport
import os

if __name__ == "__main__":
    print("Creating tables...")
    create_tables()
    print("Tables created.")
