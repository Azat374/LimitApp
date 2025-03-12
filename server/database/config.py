import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "database", "math_checker.db")

class Config:
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + DATABASE_PATH
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG = True
