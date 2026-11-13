
import fitz  # PyMuPDF


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extract text from an uploaded PDF file.
    """

    try:
        # Open PDF from uploaded file bytes
        pdf_document = fitz.open(
            stream=pdf_bytes,
            filetype="pdf"
        )

        extracted_text = ""

        # Read every page
        for page in pdf_document:
            extracted_text += page.get_text() + "\n"

        pdf_document.close()

        # Check whether text was extracted
        if not extracted_text.strip():
            raise ValueError(
                "No readable text found in the PDF. "
                "The document may be scanned or image-based."
            )

        return extracted_text.strip()

    except fitz.FileDataError:
        raise ValueError("The uploaded PDF is corrupted or invalid.")

    except Exception as e:
        if isinstance(e, ValueError):
            raise

        raise ValueError(f"PDF extraction failed: {str(e)}")
