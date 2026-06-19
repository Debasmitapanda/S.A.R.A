from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import os

def generate_report_pdf(amendment_id, amendment_title, counts, percentages, keywords, summaries, output_folder="outputs"):
    os.makedirs(output_folder, exist_ok=True)
    file_path = os.path.join(output_folder, f"{amendment_id}_report.pdf")

    # Set page margins to 20 points to maximize vertical printable area
    doc = SimpleDocTemplate(
        file_path,
        pagesize=A4,
        rightMargin=20,
        leftMargin=20,
        topMargin=20,
        bottomMargin=20
    )
    styles = getSampleStyleSheet()
    
    # Configure ultra-compact headings to save vertical space
    styles['Title'].fontSize = 14
    styles['Title'].leading = 17
    styles['Heading2'].fontSize = 10
    styles['Heading2'].leading = 12

    custom_style = ParagraphStyle(
        'Custom',
        parent=styles['Normal'],
        fontSize=8.0,
        leading=10
    )

    elements = []
    elements.append(Paragraph(f"<b>Amendment Report</b>", styles["Title"]))
    elements.append(Spacer(1, 2))

    # Amendment Title
    elements.append(Paragraph(f"<b>Amendment:</b> {amendment_title}", custom_style))
    elements.append(Spacer(1, 1))

    # Total comments
    total_comments = sum(counts.values())
    elements.append(Paragraph(f"<b>Total Comments:</b> {total_comments}", custom_style))
    elements.append(Spacer(1, 2))

    # Sentiment breakdown
    elements.append(Paragraph("<b>Sentiment Analysis</b>", styles["Heading2"]))
    for sentiment, value in counts.items():
        pct = percentages.get(sentiment, 0)
        elements.append(Paragraph(f"{sentiment.capitalize()}: {value} ({pct}%)", custom_style))
    elements.append(Spacer(1, 2))

    # Keywords
    if keywords:
        elements.append(Paragraph("<b>Frequent Keywords</b>", styles["Heading2"]))
        elements.append(Paragraph(", ".join(keywords), custom_style))
        elements.append(Spacer(1, 2))

    # Summaries
    elements.append(Paragraph("<b>AI-Generated Summaries</b>", styles["Heading2"]))
    for sentiment, summary in summaries.items():
        elements.append(Paragraph(f"<b>{sentiment.capitalize()}:</b> {summary}", custom_style))
        elements.append(Spacer(1, 1))

    # Generate Pie Chart image using Matplotlib -
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    labels = []
    sizes = []
    colors = []

    pos_count = counts.get("positive", counts.get("Positive", 0))
    neu_count = counts.get("neutral", counts.get("Neutral", 0))
    neg_count = counts.get("negative", counts.get("Negative", 0))

    all_categories = [
        ("Positive", pos_count, "#3b82f6"),
        ("Neutral", neu_count, "#94a3b8"),
        ("Negative", neg_count, "#ef4444")
    ]

    for label, val, color in all_categories:
        if val > 0:
            labels.append(f"{label} ({val})")
            sizes.append(val)
            colors.append(color)

    pie_image_path = None
    if sizes:
        fig, ax = plt.subplots(figsize=(3.0, 1.6))
        wedges, texts, autotexts = ax.pie(
            sizes,
            labels=labels,
            autopct='%1.1f%%',
            startangle=140,
            colors=colors,
            textprops=dict(color="black", fontsize=8)
        )
        # Bold and color style the percent labels to stand out
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_weight('bold')
            autotext.set_fontsize(7.5)

        ax.axis('equal')
        plt.tight_layout()
        pie_image_path = os.path.join(output_folder, f"{amendment_id}_pie_chart.png")
        fig.savefig(pie_image_path, dpi=150, bbox_inches='tight')
        plt.close(fig)

    # Embed Pie Chart in PDF (keep header and chart together on the same page)
    if pie_image_path and os.path.exists(pie_image_path):
        img = Image(pie_image_path, width=2.2*inch, height=1.3*inch)
        img.hAlign = 'CENTER'
        elements.append(Spacer(1, 2))
        elements.append(KeepTogether([
            Paragraph("<b>Sentiment Distribution</b>", styles["Heading2"]),
            Spacer(1, 1),
            img
        ]))

    doc.build(elements)
    return file_path

