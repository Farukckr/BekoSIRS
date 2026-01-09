# -*- coding: utf-8 -*-
"""
Script to force drop all tables in SQL Server by removing constraints first
"""
import pyodbc

# Database connection details
SERVER = 'LAPTOP-1Q82AMBK'
DATABASE = 'Beko_stok'
USERNAME = 'sa'
PASSWORD = '1234'

try:
    conn_str = (
        f'DRIVER={{ODBC Driver 18 for SQL Server}};'
        f'SERVER={SERVER};'
        f'DATABASE={DATABASE};'
        f'UID={USERNAME};'
        f'PWD={PASSWORD};'
        f'Encrypt=yes;TrustServerCertificate=yes;'
    )
    
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    print("✓ Connected to SQL Server")
    
    # Drop all foreign key constraints first
    cursor.execute("""
        SELECT 
            'ALTER TABLE [' + OBJECT_SCHEMA_NAME(parent_object_id) + '].[' + OBJECT_NAME(parent_object_id) + 
            '] DROP CONSTRAINT [' + name + ']' AS drop_statement
        FROM sys.foreign_keys
    """)
    
    constraints = [row[0] for row in cursor.fetchall()]
    print(f"✓ Found {len(constraints)} foreign key constraints")
    
    for constraint_sql in constraints:
        try:
            cursor.execute(constraint_sql)
            conn.commit()
        except Exception as e:
            print(f"  Warning: {e}")
    
    print("✓ All foreign keys dropped")
    
    # Now drop all tables
    cursor.execute("""
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        AND TABLE_SCHEMA = 'dbo'
    """)
    
    tables = [row[0] for row in cursor.fetchall()]
    print(f"✓ Found {len(tables)} tables to drop")
    
    for table in tables:
        try:
            cursor.execute(f"DROP TABLE [dbo].[{table}]")
            conn.commit()
            print(f"  ✓ Dropped: {table}")
        except Exception as e:
            print(f"  ✗ Error dropping {table}: {e}")
    
    print("\n✓ Database cleaned successfully!")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"✗ Error: {e}")
    import sys
    sys.exit(1)
