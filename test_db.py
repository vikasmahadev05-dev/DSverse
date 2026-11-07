from config.database import get_connection

conn = get_connection()
print("DSVERSE Database Connected Successfully!")
conn.close()

