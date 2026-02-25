[CmdletBinding()]
param(
    [string]$OutputDir = ".\migration-output",
    [string]$WingetExportPath = "",
    [string]$MappingCsvPath = "",
    [string]$SelectedCsvPath = "",
    [bool]$IncludeRegistry = $true,
    [switch]$NonInteractive,
    [switch]$BuildBrewfileFromCsv
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if ([string]::IsNullOrWhiteSpace($MappingCsvPath)) {
    $MappingCsvPath = Join-Path $ScriptDir "brew-mapping.csv"
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message"
}

function Write-Warn {
    param([string]$Message)
    Write-Warning $Message
}

function Normalize-Text {
    param([string]$Value)
    if ([string]::IsNullOrWhiteSpace($Value)) {
        return ""
    }

    $normalized = $Value.ToLowerInvariant()
    $normalized = $normalized -replace "[^a-z0-9]+", ""
    return $normalized
}

function New-DefaultMappingCsv {
    param([string]$Path)

    $defaultRows = @(
        [pscustomobject]@{ winget_id = "Git.Git"; program_name = ""; brew_type = "brew"; brew_name = "git"; notes = "Git CLI" },
        [pscustomobject]@{ winget_id = "OpenJS.NodeJS"; program_name = ""; brew_type = "brew"; brew_name = "node"; notes = "Node.js" },
        [pscustomobject]@{ winget_id = "OpenJS.NodeJS.LTS"; program_name = ""; brew_type = "brew"; brew_name = "node"; notes = "Node.js LTS" },
        [pscustomobject]@{ winget_id = "Python.Python.3"; program_name = ""; brew_type = "brew"; brew_name = "python"; notes = "Python 3" },
        [pscustomobject]@{ winget_id = "Microsoft.PowerShell"; program_name = ""; brew_type = "brew"; brew_name = "powershell"; notes = "PowerShell" },
        [pscustomobject]@{ winget_id = "Google.Chrome"; program_name = ""; brew_type = "cask"; brew_name = "google-chrome"; notes = "Google Chrome" },
        [pscustomobject]@{ winget_id = "Mozilla.Firefox"; program_name = ""; brew_type = "cask"; brew_name = "firefox"; notes = "Mozilla Firefox" },
        [pscustomobject]@{ winget_id = "Microsoft.VisualStudioCode"; program_name = ""; brew_type = "cask"; brew_name = "visual-studio-code"; notes = "VS Code" },
        [pscustomobject]@{ winget_id = "Docker.DockerDesktop"; program_name = ""; brew_type = "cask"; brew_name = "docker"; notes = "Docker Desktop" },
        [pscustomobject]@{ winget_id = "Postman.Postman"; program_name = ""; brew_type = "cask"; brew_name = "postman"; notes = "Postman" },
        [pscustomobject]@{ winget_id = "VideoLAN.VLC"; program_name = ""; brew_type = "cask"; brew_name = "vlc"; notes = "VLC" },
        [pscustomobject]@{ winget_id = "SlackTechnologies.Slack"; program_name = ""; brew_type = "cask"; brew_name = "slack"; notes = "Slack" },
        [pscustomobject]@{ winget_id = "Zoom.Zoom"; program_name = ""; brew_type = "cask"; brew_name = "zoom"; notes = "Zoom" },
        [pscustomobject]@{ winget_id = "Spotify.Spotify"; program_name = ""; brew_type = "cask"; brew_name = "spotify"; notes = "Spotify" },
        [pscustomobject]@{ winget_id = "Discord.Discord"; program_name = ""; brew_type = "cask"; brew_name = "discord"; notes = "Discord" },
        [pscustomobject]@{ winget_id = "Telegram.TelegramDesktop"; program_name = ""; brew_type = "cask"; brew_name = "telegram"; notes = "Telegram" },
        [pscustomobject]@{ winget_id = "Notion.Notion"; program_name = ""; brew_type = "cask"; brew_name = "notion"; notes = "Notion" },
        [pscustomobject]@{ winget_id = "JetBrains.Toolbox"; program_name = ""; brew_type = "cask"; brew_name = "jetbrains-toolbox"; notes = "JetBrains Toolbox" },
        [pscustomobject]@{ winget_id = "7zip.7zip"; program_name = ""; brew_type = "brew"; brew_name = "p7zip"; notes = "7-Zip alternative" },
        [pscustomobject]@{ winget_id = ""; program_name = "Visual Studio Code"; brew_type = "cask"; brew_name = "visual-studio-code"; notes = "Name mapping fallback" },
        [pscustomobject]@{ winget_id = ""; program_name = "Google Chrome"; brew_type = "cask"; brew_name = "google-chrome"; notes = "Name mapping fallback" },
        [pscustomobject]@{ winget_id = ""; program_name = "Mozilla Firefox"; brew_type = "cask"; brew_name = "firefox"; notes = "Name mapping fallback" },
        [pscustomobject]@{ winget_id = ""; program_name = "Docker Desktop"; brew_type = "cask"; brew_name = "docker"; notes = "Name mapping fallback" },
        [pscustomobject]@{ winget_id = ""; program_name = "Postman"; brew_type = "cask"; brew_name = "postman"; notes = "Name mapping fallback" },
        [pscustomobject]@{ winget_id = ""; program_name = "Slack"; brew_type = "cask"; brew_name = "slack"; notes = "Name mapping fallback" },
        [pscustomobject]@{ winget_id = ""; program_name = "Zoom"; brew_type = "cask"; brew_name = "zoom"; notes = "Name mapping fallback" },
        [pscustomobject]@{ winget_id = ""; program_name = "Spotify"; brew_type = "cask"; brew_name = "spotify"; notes = "Name mapping fallback" },
        [pscustomobject]@{ winget_id = ""; program_name = "Git"; brew_type = "brew"; brew_name = "git"; notes = "Name mapping fallback" },
        [pscustomobject]@{ winget_id = ""; program_name = "Node.js"; brew_type = "brew"; brew_name = "node"; notes = "Name mapping fallback" },
        [pscustomobject]@{ winget_id = ""; program_name = "Python"; brew_type = "brew"; brew_name = "python"; notes = "Name mapping fallback" }
    )

    $parent = Split-Path -Parent $Path
    if ((-not [string]::IsNullOrWhiteSpace($parent)) -and (-not (Test-Path $parent))) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }

    $defaultRows | Export-Csv -Path $Path -NoTypeInformation -Encoding UTF8
}

function New-AppRecord {
    param(
        [string]$Name,
        [string]$WingetId,
        [string]$Version,
        [string]$Source
    )

    return [pscustomobject]@{
        Name = $Name
        WingetId = $WingetId
        Version = $Version
        Source = $Source
    }
}

function Get-WingetPackages {
    param([string]$ExportPath)

    $filePath = $ExportPath
    $generatedExportFile = $false

    if ([string]::IsNullOrWhiteSpace($filePath)) {
        $wingetCommand = Get-Command winget -ErrorAction SilentlyContinue
        if (-not $wingetCommand) {
            Write-Warn "winget was not found. Skipping winget package discovery."
            return @()
        }

        $tempFile = Join-Path $env:TEMP ("winget_export_{0}.json" -f (Get-Date -Format "yyyyMMdd_HHmmss"))
        Write-Info "Running winget export..."
        & winget export -o $tempFile --include-versions --accept-source-agreements | Out-Null
        if (-not (Test-Path $tempFile)) {
            throw "winget export did not create file: $tempFile"
        }
        $filePath = $tempFile
        $generatedExportFile = $true
    }

    if (-not (Test-Path $filePath)) {
        throw "Winget export file not found: $filePath"
    }

    $rawJson = Get-Content -Path $filePath -Raw
    if ([string]::IsNullOrWhiteSpace($rawJson)) {
        Write-Warn "Winget export file is empty: $filePath"
        return @()
    }

    $parsed = $rawJson | ConvertFrom-Json
    $results = New-Object "System.Collections.Generic.List[object]"

    $sources = @($parsed.Sources)
    foreach ($source in $sources) {
        $sourceName = "winget"
        if (($source.SourceDetails) -and ($source.SourceDetails.Name)) {
            $sourceName = [string]$source.SourceDetails.Name
        }

        $packages = @($source.Packages)
        foreach ($pkg in $packages) {
            $wingetId = ""
            if (($pkg.PSObject.Properties.Name -contains "PackageIdentifier") -and ($pkg.PackageIdentifier)) {
                $wingetId = [string]$pkg.PackageIdentifier
            }

            if ([string]::IsNullOrWhiteSpace($wingetId)) {
                continue
            }

            $version = ""
            if (($pkg.PSObject.Properties.Name -contains "Version") -and ($pkg.Version)) {
                $version = [string]$pkg.Version
            }
            elseif (($pkg.PSObject.Properties.Name -contains "PackageVersion") -and ($pkg.PackageVersion)) {
                $version = [string]$pkg.PackageVersion
            }

            $name = ($wingetId -split "\.")[-1]
            $results.Add((New-AppRecord -Name $name -WingetId $wingetId -Version $version -Source $sourceName))
        }
    }

    if (($generatedExportFile) -and (Test-Path $filePath)) {
        Remove-Item -Path $filePath -Force -ErrorAction SilentlyContinue
    }

    return $results.ToArray()
}

function Get-RegistryPackages {
    $paths = @(
        "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
        "HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*",
        "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*"
    )

    $results = New-Object "System.Collections.Generic.List[object]"

    foreach ($path in $paths) {
        $items = @(Get-ItemProperty -Path $path -ErrorAction SilentlyContinue)
        foreach ($item in $items) {
            if (($item) -and ($item.DisplayName)) {
                $results.Add((New-AppRecord -Name ([string]$item.DisplayName) -WingetId "" -Version ([string]$item.DisplayVersion) -Source "registry"))
            }
        }
    }

    return $results.ToArray()
}

function Merge-Programs {
    param(
        [array]$WingetPrograms,
        [array]$RegistryPrograms
    )

    $merged = New-Object "System.Collections.Generic.List[object]"
    $seenIds = @{}
    $seenNames = @{}

    foreach ($program in @($WingetPrograms)) {
        $idKey = Normalize-Text -Value $program.WingetId
        if (-not [string]::IsNullOrWhiteSpace($idKey)) {
            if ($seenIds.ContainsKey($idKey)) {
                continue
            }
            $seenIds[$idKey] = $true
        }

        $nameKey = Normalize-Text -Value $program.Name
        if (-not [string]::IsNullOrWhiteSpace($nameKey)) {
            $seenNames[$nameKey] = $true
        }

        $merged.Add($program)
    }

    foreach ($program in @($RegistryPrograms)) {
        $nameKey = Normalize-Text -Value $program.Name
        if ([string]::IsNullOrWhiteSpace($nameKey)) {
            continue
        }
        if ($seenNames.ContainsKey($nameKey)) {
            continue
        }

        $seenNames[$nameKey] = $true
        $merged.Add($program)
    }

    return @($merged | Sort-Object Name)
}

function Build-MappingIndex {
    param([array]$Mappings)

    $byId = @{}
    $byName = @{}

    foreach ($mapping in @($Mappings)) {
        $wingetId = ""
        $programName = ""

        if (($mapping.PSObject.Properties.Name -contains "winget_id") -and ($mapping.winget_id)) {
            $wingetId = [string]$mapping.winget_id
        }
        if (($mapping.PSObject.Properties.Name -contains "program_name") -and ($mapping.program_name)) {
            $programName = [string]$mapping.program_name
        }

        if (-not [string]::IsNullOrWhiteSpace($wingetId)) {
            $byId[$wingetId.Trim().ToLowerInvariant()] = $mapping
        }

        $programNameKey = Normalize-Text -Value $programName
        if (-not [string]::IsNullOrWhiteSpace($programNameKey)) {
            $byName[$programNameKey] = $mapping
        }
    }

    return [pscustomobject]@{
        ById = $byId
        ByName = $byName
    }
}

function Build-BundleLine {
    param(
        [string]$BrewType,
        [string]$BrewName
    )

    if (([string]::IsNullOrWhiteSpace($BrewType)) -or ([string]::IsNullOrWhiteSpace($BrewName))) {
        return ""
    }

    $type = $BrewType.Trim().ToLowerInvariant()
    switch ($type) {
        "cask" { return "cask `"$BrewName`"" }
        "tap" { return "tap `"$BrewName`"" }
        default { return "brew `"$BrewName`"" }
    }
}

function Build-InstallCommand {
    param(
        [string]$BrewType,
        [string]$BrewName
    )

    if (([string]::IsNullOrWhiteSpace($BrewType)) -or ([string]::IsNullOrWhiteSpace($BrewName))) {
        return ""
    }

    $type = $BrewType.Trim().ToLowerInvariant()
    switch ($type) {
        "cask" { return "brew install --cask $BrewName" }
        "tap" { return "brew tap $BrewName" }
        default { return "brew install $BrewName" }
    }
}

function Convert-ToMappedPrograms {
    param(
        [array]$Programs,
        [object]$MappingIndex
    )

    $result = New-Object "System.Collections.Generic.List[object]"
    $index = 1

    foreach ($program in @($Programs)) {
        $mapping = $null

        if (-not [string]::IsNullOrWhiteSpace($program.WingetId)) {
            $wingetKey = $program.WingetId.Trim().ToLowerInvariant()
            if ($MappingIndex.ById.ContainsKey($wingetKey)) {
                $mapping = $MappingIndex.ById[$wingetKey]
            }
        }

        if (($null -eq $mapping) -and (-not [string]::IsNullOrWhiteSpace($program.Name))) {
            $nameKey = Normalize-Text -Value $program.Name
            if (($nameKey) -and ($MappingIndex.ByName.ContainsKey($nameKey))) {
                $mapping = $MappingIndex.ByName[$nameKey]
            }
        }

        $brewType = ""
        $brewName = ""
        $note = ""
        if ($mapping) {
            if (($mapping.PSObject.Properties.Name -contains "brew_type") -and ($mapping.brew_type)) {
                $brewType = [string]$mapping.brew_type
            }
            if (($mapping.PSObject.Properties.Name -contains "brew_name") -and ($mapping.brew_name)) {
                $brewName = [string]$mapping.brew_name
            }
            if (($mapping.PSObject.Properties.Name -contains "notes") -and ($mapping.notes)) {
                $note = [string]$mapping.notes
            }
        }

        $isMapped = ((-not [string]::IsNullOrWhiteSpace($brewType)) -and (-not [string]::IsNullOrWhiteSpace($brewName)))
        $bundleLine = Build-BundleLine -BrewType $brewType -BrewName $brewName
        $installCommand = Build-InstallCommand -BrewType $brewType -BrewName $brewName

        $result.Add([pscustomobject]@{
            index = $index
            name = $program.Name
            winget_id = $program.WingetId
            version = $program.Version
            source = $program.Source
            mapped = $isMapped
            brew_type = $brewType
            brew_name = $brewName
            mapping_note = $note
            bundle_line = $bundleLine
            install_command = $installCommand
        })

        $index++
    }

    return $result.ToArray()
}

function Parse-SelectionInput {
    param(
        [string]$Selection,
        [int]$MaxIndex
    )

    $selected = @{}
    $tokens = $Selection -split ","

    foreach ($tokenRaw in $tokens) {
        $token = $tokenRaw.Trim()
        if ([string]::IsNullOrWhiteSpace($token)) {
            continue
        }

        if ($token -match "^(\d+)$") {
            $indexValue = [int]$Matches[1]
            if (($indexValue -lt 1) -or ($indexValue -gt $MaxIndex)) {
                throw "Index out of range: $indexValue"
            }
            $selected[$indexValue] = $true
            continue
        }

        if ($token -match "^(\d+)-(\d+)$") {
            $start = [int]$Matches[1]
            $end = [int]$Matches[2]
            if ($start -gt $end) {
                throw "Invalid range (start > end): $token"
            }
            if (($start -lt 1) -or ($end -gt $MaxIndex)) {
                throw "Range out of bounds: $token"
            }
            for ($i = $start; $i -le $end; $i++) {
                $selected[$i] = $true
            }
            continue
        }

        throw "Invalid token: $token"
    }

    return @($selected.Keys | Sort-Object)
}

function Show-ProgramTable {
    param([array]$Programs)

    Write-Host ""
    Write-Host "Index | Mapped | Name | WingetId | Brew mapping"
    foreach ($program in @($Programs)) {
        $mappedLabel = if ($program.mapped) { "yes" } else { "no" }
        $wingetDisplay = if ($program.winget_id) { $program.winget_id } else { "-" }
        $brewDisplay = if ($program.mapped) { "$($program.brew_type):$($program.brew_name)" } else { "-" }
        Write-Host ("{0,5} | {1,6} | {2} | {3} | {4}" -f $program.index, $mappedLabel, $program.name, $wingetDisplay, $brewDisplay)
    }
    Write-Host ""
}

function Select-Programs {
    param(
        [array]$Programs,
        [switch]$NonInteractiveMode
    )

    if ($Programs.Count -eq 0) {
        return @()
    }

    $mappedPrograms = @($Programs | Where-Object { $_.mapped -eq $true })

    if ($NonInteractiveMode) {
        Write-Info "Non-interactive mode: selecting all mapped programs."
        return $mappedPrograms
    }

    Write-Host ""
    Write-Host "Selection mode:"
    Write-Host "1) mapped (default)"
    Write-Host "2) all"
    Write-Host "3) custom by index"
    Write-Host "4) none"

    $choice = Read-Host "Choose mode [1/2/3/4]"
    if ([string]::IsNullOrWhiteSpace($choice)) {
        $choice = "1"
    }

    switch ($choice.Trim().ToLowerInvariant()) {
        "1" { return $mappedPrograms }
        "mapped" { return $mappedPrograms }
        "2" { return @($Programs) }
        "all" { return @($Programs) }
        "4" { return @() }
        "none" { return @() }
        "3" {
            Show-ProgramTable -Programs $Programs
            $selection = Read-Host "Enter indexes/ranges, for example 1,2,5-8"
            if ([string]::IsNullOrWhiteSpace($selection)) {
                return @()
            }

            $indexes = Parse-SelectionInput -Selection $selection -MaxIndex $Programs.Count
            $selected = New-Object "System.Collections.Generic.List[object]"
            foreach ($idx in $indexes) {
                $selected.Add($Programs[$idx - 1])
            }
            return $selected.ToArray()
        }
        "custom" {
            Show-ProgramTable -Programs $Programs
            $selection = Read-Host "Enter indexes/ranges, for example 1,2,5-8"
            if ([string]::IsNullOrWhiteSpace($selection)) {
                return @()
            }

            $indexes = Parse-SelectionInput -Selection $selection -MaxIndex $Programs.Count
            $selected = New-Object "System.Collections.Generic.List[object]"
            foreach ($idx in $indexes) {
                $selected.Add($Programs[$idx - 1])
            }
            return $selected.ToArray()
        }
        default {
            throw "Unsupported selection mode: $choice"
        }
    }
}

function Convert-ToBoolean {
    param([object]$Value)

    if ($null -eq $Value) {
        return $false
    }

    $text = [string]$Value
    if ([string]::IsNullOrWhiteSpace($text)) {
        return $false
    }

    switch ($text.Trim().ToLowerInvariant()) {
        "true" { return $true }
        "1" { return $true }
        "yes" { return $true }
        "y" { return $true }
        default { return $false }
    }
}

function Write-Brewfile {
    param(
        [array]$Programs,
        [string]$Path
    )

    $tapSet = @{}
    $brewSet = @{}
    $caskSet = @{}

    foreach ($program in @($Programs)) {
        $brewName = ""
        $brewType = ""
        $mapped = $false

        if (($program.PSObject.Properties.Name -contains "brew_name") -and ($program.brew_name)) {
            $brewName = ([string]$program.brew_name).Trim()
        }
        if (($program.PSObject.Properties.Name -contains "brew_type") -and ($program.brew_type)) {
            $brewType = ([string]$program.brew_type).Trim().ToLowerInvariant()
        }
        if (($program.PSObject.Properties.Name -contains "mapped")) {
            $mapped = Convert-ToBoolean -Value $program.mapped
        }

        if (((-not $mapped) -and ($program.PSObject.Properties.Name -contains "mapped")) -or ([string]::IsNullOrWhiteSpace($brewName))) {
            continue
        }

        switch ($brewType) {
            "tap" { $tapSet[$brewName] = $true }
            "cask" { $caskSet[$brewName] = $true }
            default { $brewSet[$brewName] = $true }
        }
    }

    $lines = New-Object "System.Collections.Generic.List[string]"
    $lines.Add("# Generated by windows_to_macos_migration.ps1 on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")")
    $lines.Add("# Install on macOS with: brew bundle --file ./Brewfile.generated")
    $lines.Add("")

    foreach ($tap in @($tapSet.Keys | Sort-Object)) {
        $lines.Add("tap `"$tap`"")
    }
    foreach ($brew in @($brewSet.Keys | Sort-Object)) {
        $lines.Add("brew `"$brew`"")
    }
    foreach ($cask in @($caskSet.Keys | Sort-Object)) {
        $lines.Add("cask `"$cask`"")
    }

    if ($tapSet.Count + $brewSet.Count + $caskSet.Count -eq 0) {
        $lines.Add("# No mapped programs were selected.")
    }

    $parent = Split-Path -Parent $Path
    if ((-not [string]::IsNullOrWhiteSpace($parent)) -and (-not (Test-Path $parent))) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }

    Set-Content -Path $Path -Value $lines -Encoding UTF8
}

function Resolve-OutputDir {
    param([string]$Path)

    if ([System.IO.Path]::IsPathRooted($Path)) {
        return $Path
    }

    return (Join-Path (Get-Location).Path $Path)
}

try {
    if (-not (Test-Path $MappingCsvPath)) {
        Write-Warn "Mapping file was not found. Creating default mapping file at: $MappingCsvPath"
        New-DefaultMappingCsv -Path $MappingCsvPath
    }

    if ($BuildBrewfileFromCsv) {
        if ([string]::IsNullOrWhiteSpace($SelectedCsvPath)) {
            throw "Please provide -SelectedCsvPath when using -BuildBrewfileFromCsv."
        }
        if (-not (Test-Path $SelectedCsvPath)) {
            throw "Selected CSV not found: $SelectedCsvPath"
        }

        $rows = @(Import-Csv -Path $SelectedCsvPath)
        $resolvedOutputDir = Resolve-OutputDir -Path $OutputDir
        if (-not (Test-Path $resolvedOutputDir)) {
            New-Item -Path $resolvedOutputDir -ItemType Directory -Force | Out-Null
        }
        $brewfilePath = Join-Path $resolvedOutputDir "Brewfile.generated"
        Write-Brewfile -Programs $rows -Path $brewfilePath

        Write-Info "Brewfile generated from CSV."
        Write-Host "Brewfile: $brewfilePath"
        Write-Host "Run on macOS: brew bundle --file ./Brewfile.generated"
        exit 0
    }

    Write-Info "Loading package mappings from: $MappingCsvPath"
    $mappings = @(Import-Csv -Path $MappingCsvPath)
    $mappingIndex = Build-MappingIndex -Mappings $mappings

    Write-Info "Collecting programs from winget export..."
    $wingetPrograms = @(Get-WingetPackages -ExportPath $WingetExportPath)
    Write-Info "Winget programs found: $($wingetPrograms.Count)"

    $registryPrograms = @()
    if ($IncludeRegistry) {
        Write-Info "Collecting programs from Windows registry..."
        $registryPrograms = @(Get-RegistryPackages)
        Write-Info "Registry programs found: $($registryPrograms.Count)"
    }
    else {
        Write-Info "Registry collection disabled."
    }

    $programs = @(Merge-Programs -WingetPrograms $wingetPrograms -RegistryPrograms $registryPrograms)
    if ($programs.Count -eq 0) {
        throw "No programs found. Provide -WingetExportPath or enable registry collection."
    }

    $mappedPrograms = @(Convert-ToMappedPrograms -Programs $programs -MappingIndex $mappingIndex)
    $mappedCount = @($mappedPrograms | Where-Object { $_.mapped -eq $true }).Count
    $unmappedCount = $mappedPrograms.Count - $mappedCount

    Write-Info "Total unique programs: $($mappedPrograms.Count)"
    Write-Info "Mapped to Homebrew: $mappedCount"
    Write-Info "Needs manual mapping: $unmappedCount"

    $selectedPrograms = @(Select-Programs -Programs $mappedPrograms -NonInteractiveMode:$NonInteractive)
    Write-Info "Selected programs: $($selectedPrograms.Count)"

    $resolvedOutputDir = Resolve-OutputDir -Path $OutputDir
    if (-not (Test-Path $resolvedOutputDir)) {
        New-Item -Path $resolvedOutputDir -ItemType Directory -Force | Out-Null
    }

    $allCsvPath = Join-Path $resolvedOutputDir "apps_inventory_all.csv"
    $selectedCsvPath = Join-Path $resolvedOutputDir "apps_selected.csv"
    $unmappedCsvPath = Join-Path $resolvedOutputDir "apps_unmapped.csv"
    $brewfilePath = Join-Path $resolvedOutputDir "Brewfile.generated"

    $mappedPrograms | Export-Csv -Path $allCsvPath -NoTypeInformation -Encoding UTF8
    $selectedPrograms | Export-Csv -Path $selectedCsvPath -NoTypeInformation -Encoding UTF8
    @($mappedPrograms | Where-Object { $_.mapped -eq $false }) | Export-Csv -Path $unmappedCsvPath -NoTypeInformation -Encoding UTF8
    Write-Brewfile -Programs $selectedPrograms -Path $brewfilePath

    Write-Host ""
    Write-Host "[OK] Export complete."
    Write-Host "All programs CSV   : $allCsvPath"
    Write-Host "Selected CSV       : $selectedCsvPath"
    Write-Host "Unmapped CSV       : $unmappedCsvPath"
    Write-Host "Generated Brewfile : $brewfilePath"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1) Review apps_selected.csv and apps_unmapped.csv"
    Write-Host "2) Copy Brewfile.generated to your Mac"
    Write-Host "3) Run: brew bundle --file ./Brewfile.generated"
}
catch {
    Write-Error ("{0}`n{1}" -f $_.Exception.Message, $_.ScriptStackTrace)
    exit 1
}
