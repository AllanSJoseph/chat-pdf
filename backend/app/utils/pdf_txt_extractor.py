from pypdf import PdfReader

def extract_text_from_pdf(filepath: str) -> str:
    pdf_reader = PdfReader(filepath)
    text = ""
    for page in pdf_reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"
    return text
