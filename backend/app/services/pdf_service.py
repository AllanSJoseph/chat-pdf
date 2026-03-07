import os
import re
import aiofiles
from fastapi import UploadFile
from utils.pdf_txt_extractor import extract_text_from_pdf
from utils.splitter import split_text
from services.embedding_service import create_and_store_embeddings


BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


async def store_pdf(file: UploadFile, user_id: str, pdf_id: str):
    global BASE_DIR
    UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", f"user_{user_id}")
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    safe_file_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', file.filename)
    file_name = f"{pdf_id}_{safe_file_name}"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)
    
    relative_path = os.path.relpath(file_path, BASE_DIR)

    return relative_path


async def process_pdf(file_path: str, user_id: str, pdf_id: str):
    global BASE_DIR
    absolute_file_path = os.path.join(BASE_DIR, file_path)

    # We need to extract text from a file path now, not an UploadFile.
    # We will modify pdf_txt_extractor to take a path string.
    raw_text = extract_text_from_pdf(absolute_file_path)

    chunks = split_text(raw_text)

    create_and_store_embeddings(chunks, user_id, pdf_id, os.path.basename(file_path))




