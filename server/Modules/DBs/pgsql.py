import psycopg2,os
from dotenv import load_dotenv

load_dotenv()

conn = psycopg2.connect(
    host="localhost",        # PostgreSQL 서버 주소 (로컬일 경우 localhost)
    database=os.getenv('POSTGRES_USER'),  # 데이터베이스 이름
    user=os.getenv('POSTGRES_PASSWORD'),    # 데이터베이스 사용자명
    password=os.getenv('POSTGRES_DB') # 데이터베이스 비밀번호
)