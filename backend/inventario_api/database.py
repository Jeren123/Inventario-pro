from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "postgresql://inventario_db_bavk_user:PhaZmJZ9zJfm0V6TWNf3PYfcfDUnp7fs@dpg-d6hfjbjuibrs739upb10-a/inventario_db_bavk"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()