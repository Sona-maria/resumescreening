import fitz
import spacy
from parser import extract_text_from_pdf, extract_entities

doc = fitz.open()
page = doc.new_page()
page.insert_text((50, 50), "John Doe\njohn@example.com\n5 years of experience in Python and React.")
doc.save("test.pdf")

with open("test.pdf", "rb") as f:
    text = extract_text_from_pdf(f.read())
    print("TEXT:", text)
    ent = extract_entities(text)
    print("ENTITIES:", ent)
