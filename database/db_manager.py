"""
Database Manager for DSVERSE - Academic Computer Science Platform.
Stores user lab profiles, saved algorithm experiments, and diagnostic problem attempts.
Supports PostgreSQL with local SQLite automatic fallback.
"""

import os
import json
import sqlite3
import psycopg
from dotenv import load_dotenv
from typing import Dict, Any, List, Optional

load_dotenv()

DB_NAME = os.getenv("DB_NAME", "dsverse_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")

LOCAL_SQLITE_PATH = os.path.join(os.path.dirname(__file__), "dsverse.db")


def is_postgres_available() -> bool:
    if not DB_PASSWORD or DB_PASSWORD == "your_postgresql_password":
        return False
    try:
        conn = psycopg.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            connect_timeout=2
        )
        conn.close()
        return True
    except Exception:
        return False


def get_db_connection():
    if is_postgres_available():
        try:
            conn = psycopg.connect(
                dbname=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD,
                host=DB_HOST,
                port=DB_PORT
            )
            return conn, "postgres"
        except Exception:
            pass
    conn = sqlite3.connect(LOCAL_SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    return conn, "sqlite"


def init_db():
    """Initializes tables for academic experiment tracking."""
    conn, backend = get_db_connection()
    cursor = conn.cursor()

    if backend == "postgres":
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                role VARCHAR(50) DEFAULT 'Student Researcher',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS saved_experiments (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                module_name VARCHAR(50) NOT NULL,
                operation_name VARCHAR(100) NOT NULL,
                input_data TEXT NOT NULL,
                metrics_json TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS problem_attempts (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                case_id VARCHAR(50) NOT NULL,
                is_correct BOOLEAN DEFAULT FALSE,
                attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
    else:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                role TEXT DEFAULT 'Student Researcher',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS saved_experiments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                module_name TEXT NOT NULL,
                operation_name TEXT NOT NULL,
                input_data TEXT NOT NULL,
                metrics_json TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS problem_attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                case_id TEXT NOT NULL,
                is_correct BOOLEAN DEFAULT 0,
                attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """)

    conn.commit()
    cursor.close()
    conn.close()


def get_or_create_user(username: str = "Vikas"):
    init_db()
    conn, backend = get_db_connection()
    cursor = conn.cursor()

    if backend == "postgres":
        cursor.execute("SELECT * FROM users WHERE username = %s;", (username,))
        user = cursor.fetchone()
        if not user:
            cursor.execute(
                "INSERT INTO users (username, role) VALUES (%s, 'Student Researcher') RETURNING *;",
                (username,)
            )
            user = cursor.fetchone()
            conn.commit()
        cursor.close()
        conn.close()
        return {"id": user[0], "username": user[1], "role": user[2], "backend": "PostgreSQL"}
    else:
        cursor.execute("SELECT * FROM users WHERE username = ?;", (username,))
        user = cursor.fetchone()
        if not user:
            cursor.execute("INSERT INTO users (username, role) VALUES (?, 'Student Researcher');", (username,))
            conn.commit()
            cursor.execute("SELECT * FROM users WHERE username = ?;", (username,))
            user = cursor.fetchone()
        cursor.close()
        conn.close()
        return {"id": user["id"], "username": user["username"], "role": user["role"], "backend": "SQLite (Local)"}


def save_experiment(username: str, module: str, operation: str, input_data: str, metrics: Dict[str, Any]):
    init_db()
    conn, backend = get_db_connection()
    cursor = conn.cursor()
    metrics_str = json.dumps(metrics)

    if backend == "postgres":
        cursor.execute(
            "INSERT INTO saved_experiments (username, module_name, operation_name, input_data, metrics_json) VALUES (%s, %s, %s, %s, %s);",
            (username, module, operation, input_data, metrics_str)
        )
    else:
        cursor.execute(
            "INSERT INTO saved_experiments (username, module_name, operation_name, input_data, metrics_json) VALUES (?, ?, ?, ?, ?);",
            (username, module, operation, input_data, metrics_str)
        )

    conn.commit()
    cursor.close()
    conn.close()


def get_experiments(username: str, limit: int = 10) -> List[Dict[str, Any]]:
    init_db()
    conn, backend = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT id, module_name, operation_name, input_data, metrics_json, created_at FROM saved_experiments WHERE username = %s ORDER BY id DESC LIMIT %s;" if backend == "postgres" else "SELECT id, module_name, operation_name, input_data, metrics_json, created_at FROM saved_experiments WHERE username = ? ORDER BY id DESC LIMIT ?;"
    cursor.execute(query, (username, limit))
    rows = cursor.fetchall()

    experiments = []
    for r in rows:
        if backend == "postgres":
            experiments.append({
                "id": r[0], "module": r[1], "operation": r[2], "input": r[3],
                "metrics": json.loads(r[4]), "created_at": str(r[5])
            })
        else:
            experiments.append({
                "id": r["id"], "module": r["module_name"], "operation": r["operation_name"],
                "input": r["input_data"], "metrics": json.loads(r["metrics_json"]), "created_at": str(r["created_at"])
            })

    cursor.close()
    conn.close()
    return experiments
