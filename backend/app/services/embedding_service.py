from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROMA_PERSIST_DIR = os.path.join(BASE_DIR, "chroma_db")


def create_and_store_embeddings(chunks, user_id: str, pdf_id: str, pdf_name: str):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    texts = [chunk for chunk in chunks]

    vectorstore = Chroma(
        collection_name=f"user_{user_id}_pdf_{pdf_id}",
        persist_directory=CHROMA_PERSIST_DIR,
        embedding_function=embeddings,
    )

    vectorstore.add_texts(texts, metadatas=[{"source": pdf_name}] * len(texts))

