from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import hashlib
import re
import secrets
import string
from typing import List

app = FastAPI()

# Generate the salt from secure Random methods
def generate_salt(length=32):
    # 生成一個包含字母和數字的隨機字串
    alphabet = string.ascii_letters + string.digits
    salt = ''.join(secrets.choice(alphabet) for _ in range(length))
    return salt

# Constants
SALT = generate_salt()  # 這裡保持生成 salt
ITERATIONS = 100000
KEY_LENGTH = 32  # 256 bits
ALGORITHM = "PBKDF2"

# Helper function to validate password
def is_valid_password(password):
    # At least 12 characters, at least one lowercase, one uppercase, and one digit
    return (len(password) >= 12 and
            re.search(r"[a-z]", password) and
            re.search(r"[A-Z]", password) and
            re.search(r"\d", password))

# Helper function to hash password
def hash_password(password, salt):
    # 直接將 salt 字串轉換為 bytes，而不是 hex
    salt_bytes = salt.encode('utf-8')  # 將 salt 轉換為 bytes
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt_bytes, ITERATIONS, dklen=KEY_LENGTH)
    return hashed.hex()

# Pydantic model to validate input data
class PasswordRequest(BaseModel):
    password: str

# Pydantic model for user data response
class User(BaseModel):
    name: str
    gender: str
    age: str
    phone: str

@app.post("/hash-password")
def hash_password_api(request: PasswordRequest):
    password = request.password

    if not password:
        raise HTTPException(status_code=400, detail="Password is required.")

    # Validate the password format
    if not is_valid_password(password):
        raise HTTPException(status_code=400, detail="The input string does not meet the required format.")

    # Generate hash
    hashed_value = hash_password(password, SALT)

    # Return success response
    return {
        "status": "Success",
        "message": "The input string meets the required format.",
        "original": password,
        "salt": SALT,
        "algorithm": ALGORITHM,
        "hash": hashed_value
    }

@app.get("/get-user-data", response_model=List[User])
def get_user_data():
    return [
        {
            "name": "Amy",
            "gender": "Female",
            "age": "20",
            "phone": "+886912012321"
        },
        {
            "name": "John",
            "gender": "Male",
            "age": "21",
            "phone": "+886937432156"
        }
    ]
