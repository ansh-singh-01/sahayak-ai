import fitz, os

doc = fitz.open(r'e:\SIH@\SIH\SIH\SIH2025 Presentation FINAL_organized.pdf')
out_dir = r'e:\SIH@\SIH\SIH\winning_pdf_images'
os.makedirs(out_dir, exist_ok=True)
for i, page in enumerate(doc):
    pix = page.get_pixmap(dpi=150)
    pix.save(os.path.join(out_dir, f'page_{i+1}.png'))
    print(f'Exported page {i+1}')
