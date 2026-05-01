import fitz  # PyMuPDF
import google.generativeai as genai

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
# =========================
# 🔑 API KEY (FIX)
# =========================
genai.configure(api_key="Gemini API Key")

# dùng model ổn định
model = genai.GenerativeModel("gemini-2.5-flash")

# =========================
# 📄 Load PDF
# =========================
def load_pdf(file_path, year):
    doc = fitz.open(file_path)
    documents = []

    for page_num, page in enumerate(doc):
        text = page.get_text()
        text = text.replace("\n", " ")

        documents.append(
            Document(
                page_content=text,
                metadata={
                    "year": year,
                    "page": page_num + 1
                }
            )
        )
    return documents

# =========================
# 📚 Load nhiều file
# =========================
pdf_files = {
    "2017-2018": "data/2017-2018.pdf",
    "2018-2019": "data/2018-2019.pdf",
    "2019-2020": "data/2019-2020.pdf",
    "2020-2021": "data/2020-2021.pdf",
    "2021-2022": "data/2021-2022.pdf",
    "2022-2023": "data/2022-2023.pdf",
    "2023-2024": "data/2023-2024.pdf",
    "2024-2025": "data/2024-2025.pdf",
    "2025-2026": "data/2025-2026.pdf"
}

all_docs = []
for year, path in pdf_files.items():
    all_docs.extend(load_pdf(path, year))

print("Tổng số trang:", len(all_docs))

# =========================
# ✂️ Chunking
# =========================
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=100
)

chunks = splitter.split_documents(all_docs)
print("Số chunk:", len(chunks))

# =========================
# 🧠 Embedding
# =========================
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)

db = FAISS.from_documents(chunks, embeddings)

# =========================
# 💬 Hàm hỏi (FIX filter)
# =========================
def ask(question, year=None):
    docs = db.similarity_search(question, k=6)

    # 👉 filter thủ công (FAISS không hỗ trợ tốt)
    if year:
        docs = [d for d in docs if d.metadata["year"] == year]

    if not docs:
        return "Không tìm thấy thông tin phù hợp."

    context = "\n\n".join([
        f"[Năm {d.metadata['year']} - Trang {d.metadata['page']}]: {d.page_content}"
        for d in docs
    ])

    prompt = f"""
Bạn là trợ lý trả lời câu hỏi về sổ tay sinh viên.

Dựa vào tài liệu sau:
{context}

Hãy trả lời câu hỏi:
{question}

Yêu cầu:
- Trả lời chính xác
- Trích dẫn năm học
- Nếu không chắc, nói không biết
"""

    response = model.generate_content(prompt)
    return response.text

# =========================
# 🧪 Test
# =========================
while True:
    q = input("\nCâu hỏi: ")
    y = input("Năm (enter nếu tất cả): ")

    y = y if y.strip() != "" else None

    ans = ask(q, y)
    print("\nTrả lời:\n", ans)