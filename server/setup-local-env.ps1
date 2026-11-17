$ErrorActionPreference = 'Stop'
$envPath = Join-Path $PSScriptRoot '.env'
$values = @{}
if (Test-Path -LiteralPath $envPath) {
  foreach ($line in Get-Content -LiteralPath $envPath) {
    if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
      $values[$Matches[1]] = $Matches[2].Trim().Trim('"').Trim("'")
    }
  }
}

$secure = Read-Host 'Enter the PostgreSQL password for user postgres (input is hidden)' -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
  $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  if ([string]::IsNullOrEmpty($password)) { throw 'A non-empty PostgreSQL password is required.' }
  $encodedPassword = [Uri]::EscapeDataString($password)

  $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
  if ([string]::IsNullOrWhiteSpace($values['JWT_SECRET']) -or $values['JWT_SECRET'].Length -lt 64) {
    $jwtBytes = New-Object byte[] 64
    $rng.GetBytes($jwtBytes)
    $values['JWT_SECRET'] = [Convert]::ToBase64String($jwtBytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
    [Array]::Clear($jwtBytes, 0, $jwtBytes.Length)
  }
  if ([string]::IsNullOrWhiteSpace($values['TEMP_TEAM_PASSWORD'])) {
    $teamBytes = New-Object byte[] 24
    $rng.GetBytes($teamBytes)
    $values['TEMP_TEAM_PASSWORD'] = [Convert]::ToBase64String($teamBytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
    [Array]::Clear($teamBytes, 0, $teamBytes.Length)
  }
  $rng.Dispose()

  $values['DATABASE_URL'] = "postgresql://postgres:$encodedPassword@localhost:5432/smart_waste_db?schema=public"
  if ([string]::IsNullOrWhiteSpace($values['JWT_EXPIRES_IN'])) { $values['JWT_EXPIRES_IN'] = '7d' }
  if ([string]::IsNullOrWhiteSpace($values['PORT'])) { $values['PORT'] = '5000' }
  if ([string]::IsNullOrWhiteSpace($values['CLIENT_URL'])) { $values['CLIENT_URL'] = 'http://localhost:5173' }

  $content = @(
    "DATABASE_URL=`"$($values['DATABASE_URL'])`"",
    "JWT_SECRET=`"$($values['JWT_SECRET'])`"",
    "JWT_EXPIRES_IN=`"$($values['JWT_EXPIRES_IN'])`"",
    "PORT=$($values['PORT'])",
    "CLIENT_URL=`"$($values['CLIENT_URL'])`"",
    "TEMP_TEAM_PASSWORD=`"$($values['TEMP_TEAM_PASSWORD'])`""
  )
  [IO.File]::WriteAllLines($envPath, $content, (New-Object System.Text.UTF8Encoding($false)))
  $password = $null
  $encodedPassword = $null
  Write-Output 'Backend environment saved. Credentials and generated secrets were not displayed.'
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  if ($secure) { $secure.Dispose() }
}
