Add-Type -AssemblyName System.Drawing

$ProgressPreference = "SilentlyContinue"
$root = Split-Path -Parent $PSScriptRoot
$tmp = $env:TEMP
$W = 1200
$H = 630

$fonts = @{
  "TitanOne.ttf"   = "https://fonts.gstatic.com/s/titanone/v17/mFTzWbsGxbbS_J5cQcjykw.ttf"
  "NunitoBold.ttf" = "https://fonts.gstatic.com/s/nunito/v32/XRXI3I6Li01BKofiOc5wtlZ2di8HDFwmRTM.ttf"
}
foreach ($name in $fonts.Keys) {
  $path = Join-Path $tmp $name
  if (-not (Test-Path $path)) { Invoke-WebRequest -Uri $fonts[$name] -OutFile $path }
}

$pfc = New-Object System.Drawing.Text.PrivateFontCollection
$pfc.AddFontFile((Join-Path $tmp "TitanOne.ttf"))
$pfc.AddFontFile((Join-Path $tmp "NunitoBold.ttf"))
$titan = $pfc.Families | Where-Object { $_.Name -like "*Titan*" }
$nunito = $pfc.Families | Where-Object { $_.Name -like "*Nunito*" }

$px = [System.Drawing.GraphicsUnit]::Pixel
$fTitle = New-Object System.Drawing.Font($titan, 80, [System.Drawing.FontStyle]::Regular, $px)
$fRole = New-Object System.Drawing.Font($nunito, 30, [System.Drawing.FontStyle]::Bold, $px)
$fLabel = New-Object System.Drawing.Font($nunito, 21, [System.Drawing.FontStyle]::Bold, $px)
$fPill = New-Object System.Drawing.Font($nunito, 18, [System.Drawing.FontStyle]::Bold, $px)

$bmp = New-Object System.Drawing.Bitmap($W, $H)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::Black)

$rand = New-Object System.Random(11)
$vx = 640.0
$vy = 300.0
for ($i = 0; $i -lt 300; $i++) {
  $a = $rand.NextDouble() * [Math]::PI * 2
  $t = [Math]::Pow($rand.NextDouble(), 0.55)
  $r1 = 30 + $t * 860
  $len = 12 + $t * 120
  $x1 = $vx + [Math]::Cos($a) * $r1
  $y1 = $vy + [Math]::Sin($a) * $r1 * 0.72
  $x2 = $vx + [Math]::Cos($a) * ($r1 + $len)
  $y2 = $vy + [Math]::Sin($a) * ($r1 + $len) * 0.72
  $al = [int](35 + $t * 205)
  if ($al -gt 255) { $al = 255 }
  if ($rand.NextDouble() -lt 0.18) {
    $col = [System.Drawing.Color]::FromArgb($al, 185, 167, 255)
  } else {
    $col = [System.Drawing.Color]::FromArgb($al, 255, 255, 255)
  }
  $pen = New-Object System.Drawing.Pen($col, [float](0.8 + $t * 2.1))
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawLine($pen, [float]$x1, [float]$y1, [float]$x2, [float]$y2)
  $pen.Dispose()
}

$shadeRect = New-Object System.Drawing.Rectangle(0, 0, 660, $H)
$shade = New-Object System.Drawing.Drawing2D.LinearGradientBrush($shadeRect, [System.Drawing.Color]::FromArgb(246, 0, 0, 0), [System.Drawing.Color]::FromArgb(0, 0, 0, 0), 0.0)
$g.FillRectangle($shade, $shadeRect)
$shade.Dispose()

function New-RoundRect($x, $y, $w, $h, $r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $p.AddArc($x, $y, $r * 2, $r * 2, 180, 90)
  $p.AddArc($x + $w - $r * 2, $y, $r * 2, $r * 2, 270, 90)
  $p.AddArc($x + $w - $r * 2, $y + $h - $r * 2, $r * 2, $r * 2, 0, 90)
  $p.AddArc($x, $y + $h - $r * 2, $r * 2, $r * 2, 90, 90)
  $p.CloseFigure()
  $p
}

$picks = @("game-130337157149168.png", "game-2637653456.png", "game-128974526462932.png")
$size = 150
$cardX = 672
$cardY = 240
$border = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 43, 43, 56), 3)
foreach ($pick in $picks) {
  $file = Join-Path $root "assets\games\$pick"
  if (Test-Path $file) {
    $img = [System.Drawing.Image]::FromFile($file)
    $path = New-RoundRect $cardX $cardY $size $size 18
    $g.SetClip($path)
    $g.DrawImage($img, $cardX, $cardY, $size, $size)
    $g.ResetClip()
    $g.DrawPath($border, $path)
    $path.Dispose()
    $img.Dispose()
  }
  $cardX += $size + 20
}
$border.Dispose()

$sf = [System.Drawing.StringFormat]::GenericTypographic
$bLabel = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 110, 110, 125))
$bTitle = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 185, 167, 255))
$bRole = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 166, 166, 180))

$g.DrawString("portfolioo.art", $fLabel, $bLabel, 76, 186, $sf)
$g.DrawString("blessedlua", $fTitle, $bTitle, 74, 214, $sf)
$g.DrawString("programmer", $fRole, $bRole, 76, 332, $sf)

$pillFill = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 22, 22, 31))
$pillText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 166, 166, 180))
$pillLine = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 43, 43, 56), 1)
$pillX = 76.0
$pillY = 396.0
$pillH = 40.0
foreach ($tag in @("videos", "games", "websites", "groups", "snippets")) {
  $tw = $g.MeasureString($tag, $fPill, 500, $sf).Width
  $pw = $tw + 34
  $path = New-RoundRect $pillX $pillY $pw $pillH ($pillH / 2)
  $g.FillPath($pillFill, $path)
  $g.DrawPath($pillLine, $path)
  $g.DrawString($tag, $fPill, $pillText, ($pillX + 17), ($pillY + 11), $sf)
  $path.Dispose()
  $pillX += $pw + 11
}

$out = Join-Path $root "assets\og-3.png"
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
"wrote $out"
