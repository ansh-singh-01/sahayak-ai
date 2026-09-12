$pptApp = New-Object -ComObject PowerPoint.Application
$pptApp.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue
$presentation = $pptApp.Presentations.Open("e:\SIH@\SIH\SIH\SIH2026-IDEA-Presentation-Format.pptx", [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
$outDir = "e:\SIH@\SIH\SIH\template_slide_images"
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir }
for ($i = 1; $i -le $presentation.Slides.Count; $i++) {
    $slide = $presentation.Slides.Item($i)
    $slide.Export("$outDir\slide_$i.png", "PNG", 1920, 1080)
    Write-Host "Exported slide $i"
}
$presentation.Close()
$pptApp.Quit()
[System.GC]::Collect()
