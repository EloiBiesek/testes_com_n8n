param (
  [Parameter(ValueFromPipeline=$true)]
  [string]$InputObject
)

# Cria diretório de logs se não existir
$LogDir = "cursor_logs"
if (-not (Test-Path $LogDir)) { 
  New-Item -ItemType Directory -Path $LogDir | Out-Null 
}

# Cria nome do arquivo com timestamp
$Timestamp = Get-Date -Format "yyyy-MM-ddTHH-mm-ss"
$File = Join-Path $LogDir "$Timestamp.md"

# Escreve o cabeçalho
"# Cursor Agent Log - $(Get-Date -Format o)`n" | Out-File -FilePath $File -Encoding UTF8

# Adiciona o conteúdo do STDIN
$InputObject | Out-File -Append -FilePath $File -Encoding UTF8

Write-Host "📝 Log automático salvo em $File"