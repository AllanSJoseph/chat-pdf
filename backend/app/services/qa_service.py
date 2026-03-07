import os
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROMA_PERSIST_DIR = os.path.join(BASE_DIR, "chroma_db")

def get_qa_chain(user_id: str, pdf_id: str):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    
    vectorstore = Chroma(
        collection_name=f"user_{user_id}_pdf_{pdf_id}",
        persist_directory=CHROMA_PERSIST_DIR,
        embedding_function=embeddings,
    )
    
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
    
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.2)
    
    # We will pass chat history explicitly instead of using memory inside the chain.
    # It allows us to manage it with MongoDB without complex memory wrapping.
    
    qa_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        return_source_documents=True
    )
    
    return qa_chain

async def get_answer(user_id: str, pdf_id: str, query: str, chat_history: list):
    qa_chain = get_qa_chain(user_id, pdf_id)
    
    # Langchain expects chat_history in format [(human_msg, ai_msg), ...]
    formatted_history = []
    for i in range(0, len(chat_history), 2):
        if i + 1 < len(chat_history):
            formatted_history.append((chat_history[i]["content"], chat_history[i+1]["content"]))
        else:
            # Handle edge case if history is odd (should not happen for full turn)
            pass
            
    result = qa_chain.invoke({"question": query, "chat_history": formatted_history})
    
    return result["answer"]
