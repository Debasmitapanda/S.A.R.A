from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import os

def generate_report_pdf(amendment_id, amendment_title, counts, percentages, keywords, summaries, output_folder="outputs"):
    os.makedirs(output_folder, exist_ok=True)
    file_path = os.path.join(output_folder, f"{amendment_id}_report.pdf")

    doc = SimpleDocTemplate(file_path, pagesize=A4)
    styles = getSampleStyleSheet()
    custom_style = ParagraphStyle(
        'Custom',
        parent=styles['Normal'],
        fontSize=11,
        leading=16
    )

    elements = []
    elements.append(Paragraph(f"<b>Amendment Report</b>", styles["Title"]))
    elements.append(Spacer(1, 0.2 * inch))

    # Amendment Title
    elements.append(Paragraph(f"<b>Amendment:</b> {amendment_title}", custom_style))
    elements.append(Spacer(1, 0.1 * inch))

    # Total comments
    total_comments = sum(counts.values())
    elements.append(Paragraph(f"<b>Total Comments:</b> {total_comments}", custom_style))
    elements.append(Spacer(1, 0.2 * inch))

    # Sentiment breakdown
    elements.append(Paragraph("<b>Sentiment Analysis</b>", styles["Heading2"]))
    for sentiment, value in counts.items():
        pct = percentages.get(sentiment, 0)
        elements.append(Paragraph(f"{sentiment.capitalize()}: {value} ({pct}%)", custom_style))
    elements.append(Spacer(1, 0.2 * inch))

    # Keywords
    if keywords:
        elements.append(Paragraph("<b>Frequent Keywords</b>", styles["Heading2"]))
        elements.append(Paragraph(", ".join(keywords), custom_style))
        elements.append(Spacer(1, 0.2 * inch))

    # Summaries
    elements.append(Paragraph("<b>AI-Generated Summaries</b>", styles["Heading2"]))
    for sentiment, summary in summaries.items():
        elements.append(Paragraph(f"<b>{sentiment.capitalize()}:</b> {summary}", custom_style))
        elements.append(Spacer(1, 0.1 * inch))

    doc.build(elements)
    return file_path

