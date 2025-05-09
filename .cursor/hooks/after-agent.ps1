param (
  [Parameter(ValueFromPipeline=$true)]
  [string]$InputObject
)

$LogDir = "cursor_logs"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }

$Timestamp = (Get-Date).ToString("yyyy-MM-dd_HH-mm-ss")
$File      = Join-Path $LogDir "$Timestamp.md"

"# Cursor Agent log – $Timestamp`n" | Out-File -FilePath $File -Encoding UTF8
$InputObject | Out-File -Append -FilePath $File -Encoding UTF8

Write-Host "📝  Log automático salvo em $File" 