$pptApp = New-Object -ComObject PowerPoint.Application
$pptApp.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue

$pptxPath = "e:\SIH@\SIH\SIH\SAHAYAK_SIH2026_Presentation_AltioraX.pptx"
$pdfPath = "e:\SIH@\SIH\SIH\SAHAYAK_SIH2026_Presentation_AltioraX.pdf"
$imgDir = "e:\SIH@\SIH\SIH\final_slide_images"

if (!(Test-Path $imgDir)) { New-Item -ItemType Directory -Path $imgDir | Out-Null }

Write-Host "Opening presentation: $pptxPath"
$presentation = $pptApp.Presentations.Open($pptxPath, [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)

Write-Host "Exporting to PDF: $pdfPath"
# ppSaveAsPDF = 32
$presentation.SaveAs($pdfPath, 32)
Write-Host "PDF export complete."

Write-Host "Exporting slide images..."
for ($i = 1; $i -le $presentation.Slides.Count; $i++) {
    $slide = $presentation.Slides.Item($i)
    $imgFile = "$imgDir\slide_$i.png"
    $slide.Export($imgFile, "PNG", 1920, 1080)
    Write-Host "Exported slide $i to $imgFile"
}

$presentation.Close()
$pptApp.Quit()
[System.GC]::Collect()

# Also sync to workspace root for quick access
Copy-Item $pptxPath "e:\SIH@\SAHAYAK_SIH2026_Presentation_AltioraX.pptx" -Force
Copy-Item $pdfPath "e:\SIH@\SAHAYAK_SIH2026_Presentation_AltioraX.pdf" -Force
if (!(Test-Path "e:\SIH@\slides")) { New-Item -ItemType Directory -Path "e:\SIH@\slides" | Out-Null }
Copy-Item "$imgDir\*.png" "e:\SIH@\slides\" -Force

Write-Host "[SUCCESS] Presentation exported to PDF and slide images successfully in all locations."

