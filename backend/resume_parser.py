
import io

try:
    import fitz  # PyMuPDF
except Exception:
    fitz = None

try:
    import pypdf
except Exception:
    pypdf = None


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extract text from an uploaded PDF file using PyMuPDF (fitz) or pypdf fallback.
    """
    extracted_text = ""

    # Try PyMuPDF first
    if fitz is not None:
        try:
            pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
            for page in pdf_document:
                extracted_text += page.get_text() + "\n"
            pdf_document.close()
        except Exception:
            extracted_text = ""

    # Fallback to pypdf if PyMuPDF extracted nothing or is unavailable
    if not extracted_text.strip() and pypdf is not None:
        try:
            reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
        except Exception as e:
            raise ValueError(f"PDF extraction failed: {str(e)}")

    if not extracted_text.strip():
        raise ValueError(
            "No readable text found in the PDF. "
            "The document may be scanned or image-based."
        )

    return extracted_text.strip()
